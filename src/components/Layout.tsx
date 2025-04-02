
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardCheck, 
  Store, 
  Layers, 
  HelpCircle, 
  Users,
  BarChart
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAdmin = currentPath.startsWith('/admin');
  const value = isAdmin ? 'admin' : 'auditor';
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-3 px-4 sm:px-6 bg-white shadow-sm">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Audit Flow Compass</span>
          </Link>
          
          <Tabs value={value} className="w-auto">
            <TabsList>
              <TabsTrigger value="auditor" asChild>
                <Link to="/">Área do Auditor</Link>
              </TabsTrigger>
              <TabsTrigger value="admin" asChild>
                <Link to="/admin">Área do Admin</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      
      <main className="flex-1 container py-6 px-4 sm:px-6">
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
            <aside className="space-y-4 hidden md:block">
              <nav className="flex flex-col space-y-1">
                <Link 
                  to="/admin" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted ${currentPath === '/admin' ? 'bg-muted font-medium' : ''}`}
                >
                  <Store className="h-5 w-5" />
                  <span>Lojas</span>
                </Link>
                <Link 
                  to="/admin/secoes" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted ${currentPath === '/admin/secoes' ? 'bg-muted font-medium' : ''}`}
                >
                  <Layers className="h-5 w-5" />
                  <span>Seções</span>
                </Link>
                <Link 
                  to="/admin/perguntas" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted ${currentPath === '/admin/perguntas' ? 'bg-muted font-medium' : ''}`}
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Perguntas</span>
                </Link>
                <Link 
                  to="/admin/usuarios" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted ${currentPath === '/admin/usuarios' ? 'bg-muted font-medium' : ''}`}
                >
                  <Users className="h-5 w-5" />
                  <span>Usuários</span>
                </Link>
                <Link 
                  to="/admin/relatorios" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted ${currentPath === '/admin/relatorios' ? 'bg-muted font-medium' : ''}`}
                >
                  <BarChart className="h-5 w-5" />
                  <span>Relatórios</span>
                </Link>
              </nav>
            </aside>
            <div>
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      
      <footer className="py-4 px-4 sm:px-6 border-t text-center text-sm text-muted-foreground">
        <div className="container">
          &copy; {new Date().getFullYear()} Audit Flow Compass - Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
