import { useState } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsModal } from "@/components/NotificationsModal";

// Add props for mobile menu
interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { profileData } = useUserProfile();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const displayName =
    profileData?.full_name ||
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Hamburger Menu for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* 1. Busca - hide on mobile */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar processos, clientes..."
          className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const term = searchTerm.trim();
              if (!term) return;

              const currentPath = location.pathname;
              let target = "/processos";
              if (currentPath.startsWith("/clientes")) {
                target = "/clientes";
              } else if (currentPath.startsWith("/processos")) {
                target = "/processos";
              }

              navigate(target, { state: { globalSearch: term } });
            }
          }}
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        
        {/* 2. Sino de Notificações (abre modal) */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group"
          onClick={() => setNotificationsOpen(true)}
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5 transition-transform group-hover:scale-110 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white border-2 border-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
        <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />

        {/* 3. Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2 md:px-3 hover:bg-muted/50 rounded-full transition-all">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-700 leading-none">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Advogado</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-xl border-border">
            <DropdownMenuLabel className="text-xs text-slate-400 uppercase font-black">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => navigate("/perfil")}>
              Perfil
            </DropdownMenuItem>
            {/* LINHA CORRIGIDA ABAIXO */}
            <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => navigate("/settings")}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-bold" 
              onClick={handleLogout}
            >
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}