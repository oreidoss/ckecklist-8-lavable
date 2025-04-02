
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useEffect } from "react";
import { db } from "./lib/db";

// Páginas do Auditor
import AuditorHome from "./pages/auditor/Home";
import NovaAuditoria from "./pages/auditor/NovaAuditoria";
import Checklist from "./pages/auditor/Checklist";
import Relatorio from "./pages/auditor/Relatorio";

// Páginas do Admin
import AdminLojas from "./pages/admin/Lojas";
import AdminSecoes from "./pages/admin/Secoes";
import AdminPerguntas from "./pages/admin/Perguntas";
import AdminUsuarios from "./pages/admin/Usuarios";
import AdminRelatorios from "./pages/admin/Relatorios";

// Página de Erro
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Inicializa o banco de dados na primeira renderização
  useEffect(() => {
    db.initDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Rotas do Auditor */}
              <Route path="/" element={<AuditorHome />} />
              <Route path="/nova-auditoria" element={<NovaAuditoria />} />
              <Route path="/checklist/:auditoriaId" element={<Checklist />} />
              <Route path="/relatorio/:auditoriaId" element={<Relatorio />} />
              
              {/* Rotas do Admin */}
              <Route path="/admin" element={<AdminLojas />} />
              <Route path="/admin/secoes" element={<AdminSecoes />} />
              <Route path="/admin/perguntas" element={<AdminPerguntas />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/relatorios" element={<AdminRelatorios />} />
              
              {/* Outras rotas */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
