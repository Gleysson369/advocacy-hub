import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import Agenda from "./pages/Agenda";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Petitions from "./pages/Petitions"; // Updated import
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Lawyers from "./pages/Lawyers"; 

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ 
          v7_startTransition: true, 
          v7_relativeSplatPath: true 
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={
              <ProtectedRoute>
                <DashboardLayout /> 
              </ProtectedRoute>
            }>
              <Route path="/" element={<Index />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/processos" element={<Cases />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/notificacoes" element={<Notifications />} />
              <Route path="/petitions" element={<Petitions />} /> {/* Updated route path */}
              <Route path="/advogados" element={<Lawyers />} /> 
              <Route path="/perfil" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
