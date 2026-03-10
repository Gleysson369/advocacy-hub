import { useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentCases } from "@/components/dashboard/RecentCases";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentPetitions } from "@/pages/RecentPetitions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Briefcase, Users, FileText, FileStack } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCases } from "@/hooks/useCases";
import { useClients } from "@/hooks/useClients";
import { usePetitions } from "@/hooks/usePetitions";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const { user } = useAuth();
  const { profileData } = useUserProfile();
  const { cases } = useCases();
  const { clients } = useClients();
  const { petitions } = usePetitions();

  // Garante a leitura do nome em diferentes estruturas de usuário e evita erro de tipagem
  const userName =
    profileData?.full_name ||
    (user as any)?.user_metadata?.full_name ||
    (user as any)?.name ||
    (user as any)?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const stats = useMemo(() => {
    const processosAtivos = (cases || []).length;
    const totalClientes = (clients || []).length;
    const totalPeticoes = (petitions || []).length;

    // Contagem de processos por status
    const processosPorStatus = (cases || []).reduce((acc, caseItem) => {
      const status = caseItem.status || "indefinido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contagem de petições por status
    const peticoesPorStatus = (petitions || []).reduce((acc, petition) => {
      const status = petition.status || "indefinido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contagem de petições por tipo
    const peticoesPorTipo = (petitions || []).reduce((acc, petition) => {
      const type = petition.type || "indefinido";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      processosAtivos,
      totalClientes,
      totalPeticoes,
      processosPorStatus,
      peticoesPorStatus,
      peticoesPorTipo,
    };
  }, [cases, clients, petitions]);

  // Mapeamento de legendas para os status e tipos
  const caseStatusLabels: Record<string, string> = {
    em_andamento: "Andamento",
    aguardando: "Aguardando",
    concluido: "Concluído",
    urgente: "Urgente",
  };

  const petitionStatusLabels: Record<string, string> = {
    DRAFT: "Rascunhos",
    PENDING: "Pendentes",
    SUBMITTED: "Submetidas",
    APPROVED: "Aprovadas",
    REJECTED: "Rejeitadas",
  };

  const petitionTypeLabels: Record<string, string> = {
    INITIAL_PETITION: "Iniciais",
    PETITION: "Intermediárias",
    RECOURSE: "Recursos",
    EVIDENCE: "Provas",
    OTHER: "Outras",
  };

  // Geração das strings para os subtítulos dos cards
  const processosStatusSubtitle = Object.entries(stats.processosPorStatus)
    .map(([status, count]) => `${caseStatusLabels[status] || status}: ${count}`)
    .join(' | ') || "Nenhum processo";

  const peticoesStatusSubtitle = Object.entries(stats.peticoesPorStatus)
    .map(([status, count]) => `${petitionStatusLabels[status] || status}: ${count}`)
    .join(' | ') || "Nenhuma petição";

  const peticoesTipoSubtitle = Object.entries(stats.peticoesPorTipo)
    .map(([type, count]) => `${petitionTypeLabels[type] || type}: ${count}`)
    .join(' | ') || "Nenhum tipo cadastrado";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Bom dia, Dr. {userName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo do seu escritório hoje
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Processos Ativos"
          value={stats.processosAtivos}
          subtitle={processosStatusSubtitle}
          icon={Briefcase}
          variant="accent"
        />
        <StatCard
          title="Clientes"
          value={stats.totalClientes}
          subtitle="Cadastrados no sistema"
          icon={Users}
          variant="accent"
        />
        <StatCard
          title="Petições por Status"
          value={stats.totalPeticoes}
          subtitle={peticoesStatusSubtitle}
          icon={FileText}
          variant="accent"
        />
        <StatCard
          title="Petições por Tipo"
          value={stats.totalPeticoes}
          subtitle={peticoesTipoSubtitle}
          icon={FileText}
          variant="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentCases />
        </div>
        <div>
          <UpcomingEvents />
        </div>
      </div>

      {/* New Row for Petitions */}
      <div className="grid grid-cols-1 gap-6">
        <RecentPetitions />
      </div>
      <Footer />
    </div>
  );
};

export default Index;