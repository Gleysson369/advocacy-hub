import { Plus, UserPlus, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Novo Processo",
    icon: Plus,
    path: "/processos",
    variant: "outline" as const,
    className: "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200",
  },
  {
    label: "Novo Cliente",
    icon: UserPlus,
    path: "/clientes",
    variant: "outline" as const,
    className: "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200",
  },
  {
    label: "Nova Petição",
    icon: FileText,
    path: "/petitions",
    variant: "outline" as const,
    className: "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200",
  },
  {
    label: "Agendar",
    icon: Calendar,
    path: "/agenda",
    variant: "outline" as const,
    className: "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200",
  },
];


export function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    navigate(path, { state: { openModal: true } });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          // Agora o check bate com o nome da propriedade acima
          variant={ action.variant}
          onClick={() => handleAction(action.path)}
          className={cn(
            "gap-2 font-medium active:scale-95 transition-all",
          )}
        >
          <action.icon className="w-4 h-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}