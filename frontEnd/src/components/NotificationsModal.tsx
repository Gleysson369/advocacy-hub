import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Briefcase,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  processo: "Processo",
  peticao: "Petição",
  agenda: "Agenda",
  sistema: "Sistema",
  financeiro: "Financeiro",
};

function formatDateRef(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeIcon(type: string) {
  switch (type) {
    case "processo":
      return <Briefcase className="w-4 h-4" />;
    case "peticao":
      return <FileText className="w-4 h-4" />;
    case "agenda":
      return <Calendar className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

type FilterType = "all" | "unread" | "urgent";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = notifications
    .filter((n) => {
      if (filter === "unread") return !n.is_read;
      if (filter === "urgent") return n.is_urgent;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const urgentCount = notifications.filter((n) => n.is_urgent).length;

  const handleSeeDetails = (notif: Notification) => {
    onOpenChange(false);
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead.mutate(id);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-sidebar-border bg-card",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
        )}
      >
        <DialogHeader className="p-4 sm:p-6 border-b border-border flex flex-row items-center justify-between space-y-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-bold truncate">
                Notificações
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}`
                  : "Central de avisos"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 text-xs font-semibold"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              Marcar todas como lidas
            </Button>
          )}
        </DialogHeader>

        {/* Filtros */}
        <div className="px-4 sm:px-6 pt-2 pb-3 flex items-center gap-2 border-b border-border/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            Todas ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
              filter === "unread"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            Não lidas ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("urgent")}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1",
              filter === "urgent"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Urgentes ({urgentCount})
          </button>
        </div>

        {/* Lista com scroll (altura ~10 itens) */}
        <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6 py-4" style={{ maxHeight: "min(60vh, 480px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Nenhuma notificação encontrada
              </p>
            </div>
          ) : (
            <ul className="space-y-3 pr-2">
              {filtered.map((notif) => (
                <li
                  key={notif.id}
                  className={cn(
                    "rounded-lg border-l-4 p-4 transition-all hover:shadow-md",
                    !notif.is_read && "bg-primary/5 border-primary/30",
                    notif.is_read && "bg-muted/20 border-transparent",
                    notif.is_urgent && "border-l-red-500",
                    !notif.is_urgent && "border-l-muted-foreground/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                          notif.is_urgent ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground leading-tight">
                            {notif.title}
                          </h3>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {TYPE_LABELS[notif.type] ?? notif.type}
                          </span>
                          {notif.is_urgent && (
                            <span className="text-[10px] font-bold uppercase text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Urgente
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateRef(notif.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!notif.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Marcar como lido"
                          onClick={(e) => handleMarkAsRead(e, notif.id)}
                          disabled={markAsRead.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {notif.link && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Ver detalhes"
                          onClick={() => handleSeeDetails(notif)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        title="Remover"
                        onClick={(e) => handleRemove(e, notif.id)}
                        disabled={deleteNotification.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border bg-muted/20">
          <Button
            variant="ghost"
            className="w-full text-sm font-semibold text-primary hover:bg-primary/10"
            onClick={() => {
              onOpenChange(false);
              navigate("/notificacoes");
            }}
          >
            Ver todas na página central
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
