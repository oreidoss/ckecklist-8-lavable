
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { db } from "./lib/db";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Login Page
import Login from "./pages/Login";

// Páginas do Auditor
import AuditorHome from "./pages/auditor/Home";
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

// Initialize database outside of component
db.initDatabase();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Routes>
                {/* Public route for login */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                {/* Rotas do Auditor */}
                <Route path="/" element={<ProtectedRoute element={<AuditorHome />} />} />
                <Route path="/checklist/:auditoriaId" element={<ProtectedRoute element={<Checklist />} />} />
                <Route path="/relatorio/:auditoriaId" element={<ProtectedRoute element={<Relatorio />} />} />
                <Route path="/relatorio/loja/:lojaId" element={<ProtectedRoute element={<Relatorio />} />} />
                
                {/* Rotas do Admin - requireAdmin=true */}
                <Route path="/admin" element={<ProtectedRoute element={<AdminLojas />} requireAdmin={true} />} />
                <Route path="/admin/secoes" element={<ProtectedRoute element={<AdminSecoes />} requireAdmin={true} />} />
                <Route path="/admin/perguntas" element={<ProtectedRoute element={<AdminPerguntas />} requireAdmin={true} />} />
                <Route path="/admin/usuarios" element={<ProtectedRoute element={<AdminUsuarios />} requireAdmin={true} />} />
                <Route path="/admin/relatorios" element={<ProtectedRoute element={<AdminRelatorios />} requireAdmin={true} />} />
                
                {/* Outras rotas */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
