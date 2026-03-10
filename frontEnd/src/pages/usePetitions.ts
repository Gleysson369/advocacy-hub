import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Petition {
  id: string;
  title: string;
  process_number: string | null;
  client_id: string;
  client_name: string;
  type: 'INITIAL_PETITION' | 'PETITION' | 'RECOURSE' | 'EVIDENCE' | 'OTHER';
  status: 'DRAFT' | 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  enderecamento?: string;
  reu?: string;
  fatos?: string;
  fundamentos?: string;
  pedidos?: string;
  valor_causa?: number | null;
  local?: string;
  content_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface PetitionInput extends Omit<Partial<Petition>, 'id' | 'created_at' | 'updated_at'> {
  title: string;
  client_id: string;
}

export function usePetitions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: petitions = [], isLoading, error } = useQuery<Petition[]>({
    queryKey: ['petitions'],
    queryFn: () => apiClient.get('/petitions'),
  });

  const createPetition = useMutation({
    mutationFn: (data: PetitionInput) => apiClient.post<Petition>('/petitions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      toast({ title: 'Petição criada com sucesso!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar petição', description: err.message, variant: 'destructive' });
    },
  });

  const updatePetition = useMutation({
    mutationFn: ({ id, ...data }: PetitionInput & { id: string }) => apiClient.put<Petition>(`/petitions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      toast({ title: 'Petição atualizada com sucesso!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar petição', description: err.message, variant: 'destructive' });
    },
  });

  const deletePetition = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/petitions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      toast({ title: 'Petição deletada com sucesso!' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao deletar petição', description: err.message, variant: 'destructive' });
    },
  });

  const downloadPetitionPdf = async (petitionId: string) => {
    try {
      const petition = petitions.find(p => p.id === petitionId);
      if (!petition) throw new Error("Petição não encontrada");

      // Tentar buscar dados completos do cliente
      let clientData: any = { name: petition.client_name };
      try {
        clientData = await apiClient.get(`/clients/${petition.client_id}`);
      } catch (e) {
        console.warn("Erro ao buscar dados completos do cliente", e);
      }

      const doc = new jsPDF();
      
      // Configuração de margens e fonte
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - (margin * 2);
      let y = margin;
      const lineHeight = 7;

      doc.setFont("times", "normal");
      doc.setFontSize(12);

      // Helper para adicionar texto com quebra de linha
      const addText = (text: string, align: 'left' | 'center' | 'right' = 'left', isBold = false) => {
        if (!text) return;
        doc.setFont("times", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxLineWidth);
        lines.forEach((line: string) => {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          if (align === 'center') {
            doc.text(line, pageWidth / 2, y, { align: 'center' });
          } else if (align === 'right') {
            doc.text(line, pageWidth - margin, y, { align: 'right' });
          } else {
            doc.text(line, margin, y);
          }
          y += lineHeight;
        });
        y += lineHeight / 2; // Espaçamento extra entre parágrafos
      };

      // Cabeçalho / Endereçamento
      addText(petition.enderecamento || "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...", 'left', true);
      y += lineHeight;

      // Processo
      if (petition.process_number) {
        addText(`Processo nº: ${petition.process_number}`, 'left', true);
        y += lineHeight;
      }

      // Qualificação
      const qualif = `${clientData.name}, ${clientData.nationality || 'brasileiro(a)'}, ${clientData.marital_status || 'estado civil desconhecido'}, portador(a) do CPF/CNPJ ${clientData.cpf_cnpj || '...'}, residente em ${clientData.address || '...'}, vem respeitosamente perante Vossa Excelência, por seu advogado, propor:`;
      addText(qualif);

      // Título da Peça
      addText(petition.title.toUpperCase(), 'center', true);
      y += lineHeight;

      // Em face de
      addText(`em face de ${petition.reu || "RÉU DESCONHECIDO"}, pelos fatos e fundamentos a seguir:`);
      y += lineHeight;

      // Fatos
      addText("I - DOS FATOS", 'left', true);
      addText(petition.fatos || petition.content_summary || "Fatos não informados.");

      // Fundamentos
      addText("II - DO DIREITO", 'left', true);
      addText(petition.fundamentos || "Fundamentos não informados.");

      // Pedidos
      addText("III - DOS PEDIDOS", 'left', true);
      addText(petition.pedidos || "Pedidos não informados.");

      // Valor da Causa
      if (petition.valor_causa) {
        const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(petition.valor_causa);
        addText(`Dá-se à causa o valor de ${valor}.`);
      }
      y += lineHeight * 2;

      // Fechamento
      addText("Termos em que,", 'center');
      addText("Pede deferimento.", 'center');
      y += lineHeight;

      const dataStr = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      addText(`${petition.local || "Local"}, ${dataStr}.`, 'center');
      y += lineHeight * 2;

      // Assinatura Advogado
      addText("________________________________________", 'center');
      const lawyerName = (user as any)?.name || (user as any)?.user_metadata?.full_name || "Advogado";
      addText(lawyerName, 'center', true);
      
      const oab = (user as any)?.oabNumber || (user as any)?.user_metadata?.oab || "";
      if (oab) {
        addText(`OAB ${oab}`, 'center');
      }

      // Salvar PDF
      doc.save(`${petition.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      toast({ title: "PDF Gerado", description: "O download deve iniciar automaticamente." });

    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao gerar PDF", description: err.message, variant: "destructive" });
    }
  };

  return {
    petitions,
    isLoading,
    error,
    createPetition,
    updatePetition,
    deletePetition,
    downloadPetitionPdf
  };
}