import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCases, Case as CaseData } from "@/hooks/useCases";

interface Case {
  id: string;
  number: string;
  client: string;
  type: string;
  status: "em_andamento" | "aguardando" | "concluido" | "urgente";
  lastUpdate: string;
}

// Função para formatar data de atualização
const formatLastUpdate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 0) {
    // Hoje
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Hoje, ${hours}:${minutes}`;
  } else if (diffInDays === 1) {
    // Ontem
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Ontem, ${hours}:${minutes}`;
  } else {
    // Data completa
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

// Função para mapear status do backend para o formato do componente
const mapStatus = (status: string): "em_andamento" | "aguardando" | "concluido" | "urgente" => {
  if (!status) return "aguardando";
  
  const statusLower = status.toLowerCase().trim();
  
  // Mapear status do backend para status do componente
  if (statusLower === "open" || statusLower === "em_andamento" || statusLower === "em andamento") {
    return "em_andamento";
  } else if (statusLower === "closed" || statusLower === "concluido" || statusLower === "concluído" || statusLower === "concluida") {
    return "concluido";
  } else if (statusLower === "urgent" || statusLower === "urgente") {
    return "urgente";
  } else if (statusLower === "aguardando" || statusLower === "waiting" || statusLower === "pending") {
    return "aguardando";
  } else {
    // Por padrão, se não reconhecer, assume "em_andamento" já que é o status padrão do schema
    return "em_andamento";
  }
};

// Função para converter dados do backend para o formato do componente
const convertCaseData = (caseData: CaseData): Case => {
  return {
    id: caseData.id,
    number: caseData.case_number || "",
    client: caseData.clients?.name || "Cliente não informado",
    type: caseData.case_type || "",
    status: mapStatus(caseData.status),
    lastUpdate: formatLastUpdate(caseData.updated_at || caseData.created_at),
  };
};

const statusConfig = {
  em_andamento: {
    label: "Em Andamento",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  aguardando: {
    label: "Aguardando",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  concluido: {
    label: "Concluído",
    className: "bg-success/10 text-success border-success/20",
  },
  urgente: {
    label: "Urgente",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function RecentCases() {
  const navigate = useNavigate();
  const { cases, isLoading, error } = useCases();

  // Converter dados do backend e limitar a 5 mais recentes
  const recentCases: Case[] = cases
    .slice(0, 5)
    .map(convertCaseData);

  return (
    <div className="bg-card rounded-xl shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-semibold">
              Processos Recentes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Últimas atualizações dos seus processos
            </p>
          </div>
          <button 
            onClick={() => navigate("/processos")}
            className="text-sm font-medium text-accent hover:underline transition-all">
            Ver todos
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Carregando processos...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-sm text-destructive">Erro ao carregar processos</p>
        </div>
      ) : recentCases.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum processo cadastrado ainda</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recentCases.map((caseItem, index) => (
            <div
              key={caseItem.id}
              className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate("/processos", { state: { openCaseId: caseItem.id } })}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-sm text-muted-foreground truncate">
                      {caseItem.number}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        statusConfig[caseItem.status].className
                      )}
                    >
                      {statusConfig[caseItem.status].label}
                    </Badge>
                  </div>
                  <p className="font-medium mt-1">{caseItem.client}</p>
                  <p className="text-sm text-muted-foreground">{caseItem.type}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-foreground">
                    {caseItem.lastUpdate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
