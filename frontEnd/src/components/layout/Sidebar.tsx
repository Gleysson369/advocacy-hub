import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Scale,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText, 
  Gavel, 
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  // { title: "Advogados", url: "/advogados", icon: Gavel }, 
  { title: "Processos", url: "/processos", icon: Briefcase },
  { title: "Petições", url: "/petitions", icon: FileText }, // Updated item
  { title: "Agenda", url: "/agenda", icon: Calendar },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
    {/* Overlay para Mobile */}
    <div 
      className={cn(
        "fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setIsOpen?.(false)}
    />

    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col h-screen z-50",
        // Estilos para Mobile (padrão): menu fixo que desliza
        "fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Estilos para Desktop (md e acima): menu relativo e colapsável
        "md:relative md:translate-x-0 md:transition-all",
        collapsed ? "md:w-20" : "md:w-64"
      )}
    >
      {/* Botão de Recolher no Topo (Direita) */}
      <div className="flex justify-end px-4 pt-4">
        <button onClick={() => setIsOpen?.(false)} className="md:hidden p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground">
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Logo */}
      <div className={cn("p-6 pt-2 border-b border-sidebar-border transition-all", collapsed && "flex justify-center px-0")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center flex-shrink-0">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-serif text-lg font-semibold text-sidebar-foreground leading-tight">
                LexOffice
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                Gestão Jurídica
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto"> 
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  onClick={() => setIsOpen?.(false)}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/80"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive && "text-sidebar-primary"
                    )}
                  />
                  {!collapsed && (
                    <span className="animate-fade-in">{item.title}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer apenas com Sair */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className={cn(
            "group w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
            "text-red-500 hover:bg-red-500/10",
            collapsed && "justify-center"
          )}
        >
          <LogOut 
            className="w-5 h-5 transition-all duration-200 group-hover:scale-110 group-hover:text-red-400" 
          />
          {!collapsed && (
            <span className="text-sm font-semibold transition-colors duration-200 group-hover:text-red-400">
              Sair
            </span>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
