import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  children?: React.ReactNode; // Tornamos opcional com o "?"
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e3e3e3]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0"> 
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">
          {/* Se houver children, renderiza children. Se não, renderiza o Outlet das rotas */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}