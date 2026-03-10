import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { usePetitions, Petition } from "@/hooks/usePetitions";

// This config helps in styling the status badges consistently.
const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-gray-100 text-gray-800 border-gray-200" },
  PENDING: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  SUBMITTED: { label: "Submetida", className: "bg-blue-100 text-blue-800 border-blue-200" },
  APPROVED: { label: "Aprovada", className: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Rejeitada", className: "bg-red-100 text-red-800 border-red-200" },
};

// Helper to format date for display
const formatUpdateDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export function RecentPetitions() {
  const navigate = useNavigate();
  // Assuming usePetitions returns these fields, similar to useCases
  const { petitions, isLoading, error } = usePetitions();

  // Get the 5 most recent petitions by sorting
  const recentPetitions: Petition[] = petitions
    ?.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5) || [];

  return (
    <div className="bg-card rounded-xl shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-semibold">
              Petições Recentes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Últimas peças redigidas ou atualizadas
            </p>
          </div>
          <button 
            onClick={() => navigate("/petitions")}
            className="text-sm font-medium text-accent hover:underline transition-all">
            Ver todas
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Carregando petições...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-sm text-destructive">Erro ao carregar petições</p>
        </div>
      ) : recentPetitions.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma petição cadastrada ainda</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recentPetitions.map((petition, index) => (
            <div
              key={petition.id}
              className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate("/petitions", { state: { openPetitionId: petition.id } })}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium truncate">
                      {petition.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        statusConfig[petition.status]?.className || statusConfig.DRAFT.className
                      )}
                    >
                      {statusConfig[petition.status]?.label || petition.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{petition.client_name}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-foreground">
                    {formatUpdateDate(petition.updatedAt || petition.createdAt)}
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