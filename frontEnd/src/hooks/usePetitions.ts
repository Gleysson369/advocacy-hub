import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

/** Lista simples de petições (cards/tabela) */
export interface Petition {
  id: string;
  user_id: string;
  title: string;
  process_number: string | null;
  client_name: string;
  type: string;
  status: string;
  content_summary: string | null;
  created_at?: string;
  updatedAt?: string;
  // Campos detalhados opcionais para edição
  pedidos?: string | null;
  requests?: string | null;
  fatos?: string | null;
  facts?: string | null;
  fundamentos?: string | null;
  legal_grounds?: string | null;
  enderecamento?: string | null;
  addressee?: string | null;
  reu?: string | null;
  defendant?: string | null;
  valor_causa?: number | null;
  claim_value?: number | null;
  local?: string | null;
  closing_place?: string | null;
  processNumber?: string | null;
}

export type PetitionInput = Omit<Petition, "id" | "user_id" | "created_at">;

/** Dados estruturados para geração de texto/PDF */
export interface AuthorData {
  name: string;
  cpf?: string | null;
  rg?: string | null;
  marital_status?: string | null;
  profession?: string | null;
  address?: string | null;
  cep?: string | null;
  city?: string | null;
  uf?: string | null;
  email?: string | null;
}

export interface DefendantData {
  name: string;
  doc?: string | null; // CPF/CNPJ
  address?: string | null;
  cep?: string | null;
  city?: string | null;
  uf?: string | null;
}

export interface LawyerData {
  name: string;
  oab: string;
  uf: string;
}

export interface PetitionDocuments {
  protocols: string[];
  invoices: string[];
  has_negative_listing: boolean;
  payment_receipts: string[];
}

export interface PetitionCore {
  id: string;
  title: string;
  process_number: string | null;
  addressee: string | null;
  facts: string | null;
  legal_grounds?: string | null;
  legal_grounds_custom?: string | null;
  requests?: string | null;
  requests_custom?: string | null;
  claim_value: number | null;
  closing_place: string | null;
  type: string;
  status: string;
  created_at: string;
}

export interface PetitionFull {
  petition: PetitionCore;
  author: AuthorData;
  defendant: DefendantData;
  lawyer: LawyerData;
  documents: PetitionDocuments;
}

function formatLongDatePtBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function normalizeName(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function hasSamePerson(author: AuthorData, defendant: DefendantData): boolean {
  const sameName =
    normalizeName(author.name) !== "" &&
    normalizeName(author.name) === normalizeName(defendant.name);

  const sameDoc =
    !!author.cpf &&
    !!defendant.doc &&
    author.cpf.replace(/\D/g, "") === defendant.doc.replace(/\D/g, "");

  return sameName || sameDoc;
}

function buildDefaultRequests(
  core: PetitionCore,
  docs: PetitionDocuments
): string[] {
  const pedidos: string[] = [];

  pedidos.push(
    "a) A citação do Réu, no endereço indicado, para, querendo, apresentar resposta, sob pena de revelia e confissão quanto à matéria de fato."
  );

  pedidos.push(
    "b) A total procedência da ação, declarando-se a inexistência do débito objeto da presente demanda, com a consequente abstenção de cobranças futuras."
  );

  if (docs.has_negative_listing) {
    pedidos.push(
      "c) A imediata retirada de eventual inscrição indevida do nome do Autor dos cadastros de proteção ao crédito (SPC, SERASA e congêneres), com a expedição de ofícios aos órgãos competentes."
    );
  }

  pedidos.push(
    "d) A condenação do Réu ao pagamento de indenização por danos morais, em valor a ser arbitrado por Vossa Excelência, em razão dos abalos sofridos."
  );

  pedidos.push(
    "e) A condenação do Réu à repetição do indébito, em dobro, nos termos do art. 42, parágrafo único, do Código de Defesa do Consumidor, relativamente aos valores indevidamente cobrados e/ou pagos."
  );

  pedidos.push(
    "f) A condenação do Réu ao pagamento das custas processuais e honorários advocatícios, na forma do art. 85 do Código de Processo Civil."
  );

  pedidos.push(
    "g) Protesta por todos os meios de prova em direito admitidos, especialmente documental, testemunhal, pericial e o depoimento pessoal do representante legal do Réu, sob pena de confissão."
  );

  if (core.claim_value !== null && !Number.isNaN(core.claim_value)) {
    pedidos.push(
      `h) Dá-se à causa o valor de R$ ${core.claim_value
        .toFixed(2)
        .replace(".", ",")}.`
    );
  }

  return pedidos;
}

function buildRequestsList(core: PetitionCore, docs: PetitionDocuments): string {
  const normalizedCustom =
    core.requests_custom || core.requests || core.legal_grounds || "";

  const pedidos: string[] = [];

  if (normalizedCustom.trim()) {
    pedidos.push(normalizedCustom.trim());
  }

  const defaultPed = buildDefaultRequests(core, docs);

  if (!normalizedCustom.trim()) {
    defaultPed.forEach((p) => pedidos.push(p));
  } else {
    pedidos.push(...defaultPed);
  }

  if (!pedidos.some((p) => /pede\s+deferimento/i.test(p))) {
    pedidos.push("Termos em que, pede deferimento.");
  }

  return pedidos.join("\n\n");
}

function buildLegalGrounds(core: PetitionCore): string {
  const partes: string[] = [];

  if (core.legal_grounds_custom && core.legal_grounds_custom.trim()) {
    partes.push(core.legal_grounds_custom.trim());
  } else if (core.legal_grounds && core.legal_grounds.trim()) {
    partes.push(core.legal_grounds.trim());
  }

  partes.push(
    "Nos termos do Código de Defesa do Consumidor, especialmente dos arts. 6º, 14 e 42, resta evidenciada a responsabilidade objetiva do fornecedor de serviços, bem como o direito do consumidor à adequada e eficaz prestação do serviço e à reparação integral dos danos sofridos."
  );

  partes.push(
    "O Código de Processo Civil, em seus arts. 319 e seguintes, estabelece os requisitos da petição inicial, os quais são devidamente observados na presente demanda."
  );

  return partes.join("\n\n");
}

function buildDocumentsSection(documents: PetitionDocuments): string {
  const itens: string[] = [];

  if (documents.protocols.length) {
    itens.push(
      `- Protocolos de atendimento/registro: ${documents.protocols.join(", ")}.`
    );
  }

  if (documents.invoices.length) {
    itens.push(`- Faturas/contas: ${documents.invoices.join(", ")}.`);
  }

  if (documents.payment_receipts.length) {
    itens.push(
      `- Comprovantes de pagamento: ${documents.payment_receipts.join(", ")}.`
    );
  }

  if (documents.has_negative_listing) {
    itens.push(
      "- Comprovante(s) de inscrição em cadastro de inadimplentes (SPC/Serasa e congêneres)."
    );
  }

  if (!itens.length) {
    itens.push(
      "- Documentos pessoais do Autor e demais documentos que comprovam a relação contratual e os prejuízos suportados."
    );
  }

  return itens.join("\n");
}

function buildPetitionText(full: PetitionFull): string {
  const { petition: core, author, defendant, lawyer, documents } = full;

  if (hasSamePerson(author, defendant)) {
    throw new Error(
      "Autor e Réu não podem ser a mesma pessoa. Verifique os dados antes de gerar a petição."
    );
  }

  const titulo = core.title || "PETIÇÃO INICIAL";

  const enderecamento =
    core.addressee && core.addressee.trim()
      ? core.addressee.trim()
      : "Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a) de Direito";

  const qualAutor = [
    `${author.name || "[NOME DO AUTOR]"}`,
    author.cpf ? `, inscrito no CPF sob o nº ${author.cpf}` : "",
    author.rg ? `, portador do RG nº ${author.rg}` : "",
    author.marital_status ? `, ${author.marital_status}` : "",
    author.profession ? `, ${author.profession}` : "",
    author.address
      ? `, residente e domiciliado à ${author.address}${
          author.city || author.uf || author.cep ? "," : "."
        }`
      : "",
    author.city ? ` ${author.city}` : "",
    author.uf ? `/${author.uf}` : "",
    author.cep ? `, CEP ${author.cep}` : "",
    author.email ? `, e-mail: ${author.email}` : "",
  ]
    .join("")
    .replace(/\s+,/g, ",")
    .trim();

  const qualReu = [
    `${defendant.name || "[NOME DO RÉU]"}`,
    defendant.doc ? `, inscrito no CPF/CNPJ sob o nº ${defendant.doc}` : "",
    defendant.address
      ? `, com endereço à ${defendant.address}${
          defendant.city || defendant.uf || defendant.cep ? "," : "."
        }`
      : "",
    defendant.city ? ` ${defendant.city}` : "",
    defendant.uf ? `/${defendant.uf}` : "",
    defendant.cep ? `, CEP ${defendant.cep}` : "",
  ]
    .join("")
    .replace(/\s+,/g, ",")
    .trim();

  const valorCausaTexto =
    core.claim_value !== null && !Number.isNaN(core.claim_value)
      ? `Dá-se à causa o valor de R$ ${core.claim_value
          .toFixed(2)
          .replace(".", ",")}, correspondente à soma dos danos materiais e morais estimados.`
      : "Dá-se à causa o valor a ser oportunamente atualizado, considerando os danos materiais e morais suportados.";

  const fatos =
    core.facts && core.facts.trim()
      ? core.facts.trim()
      : "O Autor é consumidor dos serviços prestados pelo Réu, tendo sido surpreendido com cobranças indevidas e/ou inscrição indevida em cadastros de inadimplentes, em total afronta à boa-fé objetiva e aos direitos básicos do consumidor. A narrativa fática completa deverá ser detalhada conforme os documentos anexos e a cronologia dos eventos.";

  const fundamentos = buildLegalGrounds(core);
  const pedidos = buildRequestsList(core, documents);
  const docsText = buildDocumentsSection(documents);

  const local =
    core.closing_place ||
    (author.city && author.uf ? `${author.city}/${author.uf}` : "Cidade/UF");

  const dataExtenso = formatLongDatePtBR(new Date());

  const assinatura = `${lawyer.name || "[NOME DO ADVOGADO]"}\nOAB/${
    lawyer.uf || "UF"
  } ${lawyer.oab || "[NÚMERO]"}`;

  const linhas: string[] = [];

  linhas.push("@@PETITION_TITLE@@"); // Placeholder for formatted title
  linhas.push(""); // Espaço após o título
  linhas.push("");
  linhas.push(enderecamento.toUpperCase());
  linhas.push("");
  if (core.process_number) {
    linhas.push(`Processo nº ${core.process_number}`);
    linhas.push("");
  }

  linhas.push(
    `${qualAutor} vem, respeitosamente, à presença de Vossa Excelência, por intermédio de seu advogado infra-assinado, propor a presente ação em face de ${qualReu}, pelos fatos e fundamentos a seguir expostos.`
  );
  linhas.push("");
  linhas.push("");
  linhas.push("I - DOS FATOS");
  linhas.push("");
  linhas.push(fatos);
  linhas.push("");
  linhas.push("");
  linhas.push("II - DO DIREITO");
  linhas.push("");
  linhas.push(fundamentos);
  linhas.push("");
  linhas.push("");
  linhas.push("III - DOS PEDIDOS");
  linhas.push("");
  linhas.push(pedidos);
  linhas.push("");
  linhas.push("");
  linhas.push("IV - DOS DOCUMENTOS");
  linhas.push("");
  linhas.push(docsText);
  linhas.push("");
  linhas.push("");
  linhas.push("V - DO VALOR DA CAUSA");
  linhas.push("");
  linhas.push(valorCausaTexto);
  linhas.push("");
  linhas.push("");
  linhas.push(`${local}, ${dataExtenso}.`);
  linhas.push("");
  linhas.push("");
  linhas.push(assinatura);

  return linhas.join("\n");
}

async function buildPdfFromText(title: string, text: string): Promise<Blob> {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const marginLeft = 72;
  const marginTop = 72;
  const maxWidth = 595 - marginLeft * 2;

  doc.setFont("Times", "Normal");
  doc.setFontSize(12);

  const linhas = text.split("\n");
  let cursorY = marginTop;

  for (const linha of linhas) {
    if (linha.trim() === "@@PETITION_TITLE@@") {
      const titulo = (title || "PETIÇÃO INICIAL").toUpperCase();
      const tituloLines = doc.splitTextToSize(titulo, maxWidth);
      doc.setFont("Times", "Bold");
      doc.setFontSize(14);
      tituloLines.forEach((line) => {
        if (cursorY > 800) {
          doc.addPage();
          cursorY = marginTop;
        }
        const lineWidth = doc.getTextWidth(line);
        doc.text(line, (595 - lineWidth) / 2, cursorY);
        cursorY += 14 * 1.2;
      });
      doc.setFont("Times", "Normal");
      doc.setFontSize(12);
      cursorY += 12 * 1.5; // Adiciona espaço após o título
    } else {
      if (linha.trim() === "") {
        cursorY += 12 * 1.5;
        continue;
      }

      const split = doc.splitTextToSize(linha, maxWidth);
      split.forEach((trecho) => {
        if (cursorY > 800) {
          doc.addPage();
          cursorY = marginTop;
        }
        doc.text(trecho, marginLeft, cursorY);
        cursorY += 12 * 1.5;
      });
    }
  }

  const blob = doc.output("blob");
  return blob;
}

async function fetchPetitionFull(petitionId: string): Promise<PetitionFull> {
  try {
    const full = await apiClient.get<PetitionFull>(`/petitions/${petitionId}/full`);
    return full;
  } catch {
    const base: any = await apiClient.get<any>(`/petitions/${petitionId}`);

    const clientId: string | undefined =
      base.client_id || base.author_id || base.clientId;

    let author: AuthorData = {
      name: base.client_name || base.author_name || "[NOME DO AUTOR]",
    };

    if (clientId) {
      try {
        const client = await apiClient.get<any>(`/clients/${clientId}`);
        author = {
          name: client.name || base.client_name || "[NOME DO AUTOR]",
          cpf: client.cpf || client.cpf_cnpj || null,
          rg: client.rg || null,
          marital_status: client.marital_status || null,
          profession: client.profession || null,
          address: client.address || null,
          cep: client.cep || client.zip_code || null,
          city: client.city || null,
          uf: client.state || client.uf || null,
          email: client.email || null,
        };
      } catch {
        // mantém author básico
      }
    }

    // Dados do advogado a partir da tabela User (rota /users/:id)
    let lawyer: LawyerData = {
      name: "[NOME DO ADVOGADO]",
      oab: "[NÚMERO OAB]",
      uf: "UF",
    };
    const userIdForPetition: string | undefined = base.user_id || base.userId;
    if (userIdForPetition) {
      try {
        const user = await apiClient.get<any>(`/users/${userIdForPetition}`);
        lawyer = {
          name: user.full_name || user.name || "[NOME DO ADVOGADO]",
          oab: user.oab || "[NÚMERO OAB]",
          uf: user.oab_uf || "UF",
        };
      } catch {
        // mantém placeholders se falhar
      }
    }

    const defendant: DefendantData = {
      // prioriza campo já mapeado pelo backend (reu), depois nome interno do schema
      name: base.reu || base.defendant || base.defendant_name || "[NOME DO RÉU]",
      doc: base.defendant_doc || null,
      address: base.defendant_address || null,
      cep: base.defendant_cep || null,
      city: base.defendant_city || null,
      uf: base.defendant_uf || null,
    };

    const documents: PetitionDocuments = {
      protocols: base.documents?.protocols || [],
      invoices: base.documents?.invoices || [],
      has_negative_listing:
        !!base.documents?.has_negative_listing ||
        !!base.has_negative_listing ||
        false,
      payment_receipts: base.documents?.payment_receipts || [],
    };

    const core: PetitionCore = {
      id: String(base.id),
      title: base.title || "Petição Inicial",
      process_number: base.process_number || base.processNumber || null,
      addressee: base.addressee || base.addressing || null,
      facts: base.fatos || base.facts || base.content_summary || null,
      legal_grounds: base.legal_grounds || null,
      legal_grounds_custom: base.legal_grounds_custom || null,
      requests: base.pedidos || base.requests || null,
      requests_custom: base.requests_custom || null,
      claim_value:
        typeof base.valor_causa === "number"
          ? base.valor_causa
          : typeof base.claim_value === "number"
          ? base.claim_value
          : base.caseValue ?? null,
      closing_place: base.local || base.closing_place || null,
      type: base.type || "INICIAL",
      status: base.status || "DRAFT",
      created_at:
        base.created_at ||
        base.createdAt?.toISOString?.() ||
        new Date().toISOString(),
    };

    return {
      petition: core,
      author,
      defendant,
      lawyer,
      documents,
    };
  }
}

export function usePetitions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: petitions, isLoading } = useQuery<Petition[]>({
    queryKey: ["petitions", user?.id],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!user?.id || !token) {
        return [];
      }
      return apiClient.get<Petition[]>(`/petitions`);
    },
    enabled: !!user?.id,
  });

  const createPetition = useMutation({
    mutationFn: async (newPetition: PetitionInput) => {
      return apiClient.post<Petition>("/petitions", newPetition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petitions", user?.id] });
      toast.success("Petição criada com sucesso!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido ao criar petição.";
      toast.error("Erro ao criar petição: " + message);
    },
  });

  const updatePetition = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Petition> & { id: string }) => {
      return apiClient.put<Petition>(`/petitions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petitions", user?.id] });
      toast.success("Petição atualizada!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido ao atualizar.";
      toast.error("Erro ao atualizar petição: " + message);
    },
  });

  const deletePetition = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete<void>(`/petitions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petitions", user?.id] });
      toast.success("Petição removida.");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido ao remover.";
      toast.error("Erro ao remover petição: " + message);
    },
  });

  const previewPetitionText = async (petitionId: string): Promise<string> => {
    try {
      const full = await fetchPetitionFull(petitionId);
      const text = buildPetitionText(full);
      return text;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao gerar texto da petição.";
      toast.error(message);
      throw error;
    }
  };

  const generatePetitionPdf = async (petitionId: string): Promise<Blob> => {
    try {
      const full = await fetchPetitionFull(petitionId);
      const text = buildPetitionText(full);
      const blob = await buildPdfFromText(full.petition.title, text);
      return blob;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao gerar PDF da petição.";
      toast.error(message);
      throw error;
    }
  };

  const downloadPetitionPdf = async (
    petitionId: string,
    filename?: string
  ): Promise<void> => {
    try {
      const blob = await generatePetitionPdf(petitionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        filename ||
        `peticao-${petitionId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF da petição gerado com sucesso.");
    } catch {
      // erro já tratado em generatePetitionPdf
    }
  };

  const getPetitionDetails = async (petitionId: string) => {
    return fetchPetitionFull(petitionId);
  };

  return {
    petitions,
    isLoading,
    createPetition,
    updatePetition,
    deletePetition,
    previewPetitionText,
    generatePetitionPdf,
    downloadPetitionPdf,
    getPetitionDetails,
  };
}
