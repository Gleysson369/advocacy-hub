import { useState } from "react";
import { 
  Bell, Clock, Trash2, CheckCircle, Filter, 
  AlertCircle, FileText, Calendar, Briefcase, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  // Lógica de Filtros
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'urgent') return notif.is_urgent;
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Formatação de Data Relativa
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Ícone por Tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'processo': return <Briefcase className="w-4 h-4" />;
      case 'peticao': return <FileText className="w-4 h-4" />;
      case 'agenda': return <Calendar className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Notificações</h1>
          <p className="text-muted-foreground text-sm">Gerencie todos os avisos e prazos do seu escritório.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-white hover:bg-slate-50"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCircle className="w-4 h-4" /> Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 overflow-x-auto">
        <Button 
          variant={filter === 'all' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setFilter('all')}
          className="gap-2"
        >
          Todas
          <Badge variant="secondary" className="ml-1 bg-slate-200 text-slate-700">{notifications.length}</Badge>
        </Button>
        <Button 
          variant={filter === 'unread' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setFilter('unread')}
          className="gap-2"
        >
          Não Lidas
          <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
            {notifications.filter(n => !n.is_read).length}
          </Badge>
        </Button>
        <Button 
          variant={filter === 'urgent' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setFilter('urgent')}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <AlertCircle className="w-4 h-4" />
          Urgentes
          <Badge variant="outline" className="ml-1 border-red-200 text-red-600">
            {notifications.filter(n => n.is_urgent).length}
          </Badge>
        </Button>
      </div>

      {/* Lista de Cards */}
      <div className="grid gap-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando notificações...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-700">Nenhuma notificação encontrada</h3>
            <p className="text-sm text-slate-500">Você está em dia com seus avisos.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
          <Card key={notif.id} className={cn(
            "p-4 border-0 border-l-4 transition-all hover:shadow-md bg-white group relative",
            notif.is_urgent ? "border-l-red-500" : "border-l-slate-300",
            !notif.is_read ? "bg-blue-50/30" : "bg-white"
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className={cn(
                  "mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  notif.is_urgent ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                )}>
                  {getTypeIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-semibold text-slate-800", !notif.is_read && "font-bold")}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                       <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Nova</span>
                    )}
                    {notif.is_urgent && (
                       <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                         <AlertCircle className="w-3 h-3" /> Urgente
                       </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> {formatTime(notif.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 md:static md:opacity-100">
                {!notif.is_read && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                    title="Marcar como lida"
                    onClick={() => markAsRead.mutate(notif.id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                {notif.link && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-slate-900"
                    title="Ver detalhes"
                    onClick={() => navigate(notif.link!)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-red-600"
                  title="Remover"
                  onClick={() => deleteNotification.mutate(notif.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )))}
      </div>
    </div>
  );
}