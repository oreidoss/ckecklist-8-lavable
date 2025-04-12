import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Layers, 
  HelpCircle, 
  Users,
  BarChart,
  LogOut,
  Menu,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAdmin = currentPath.startsWith('/admin');
  const value = isAdmin ? 'admin' : 'auditor';
  const { user, isAdmin: userIsAdmin, logout } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="border-b py-3 px-4 sm:px-6 bg-white shadow-sm">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/1a7a1eb0-0f52-443d-8508-441a6cca0dce.png" 
              alt="Checklist 9.0 Logo" 
              className="h-8 w-auto" 
            />
            <span className="font-bold text-xl">Checklist 9.0</span>
          </Link>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {userIsAdmin && !isMobile && (
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
            )}
            
            {userIsAdmin && isMobile && (
              <Link to={isAdmin ? "/" : "/admin"}>
                <Button variant="outline" size="sm" className="mr-2">
                  <Settings className="h-4 w-4 mr-1" />
                  {isAdmin ? "Auditor" : "Admin"}
                </Button>
              </Link>
            )}
            
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium hidden sm:inline">Olá, {user.nome}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout}
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-2 px-1 sm:py-6 sm:px-4 overflow-x-hidden">
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 md:gap-6">
            {isMobile ? (
              <div className="mb-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
                      <span>Menu Administrativo</span>
                      <Menu className="h-4 w-4 ml-2" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[80vw] sm:w-[300px] p-0">
                    <ScrollArea className="h-full p-4">
                      <div className="py-2">
                        <nav className="flex flex-col space-y-1">
                          <Link 
                            to="/admin" 
                            className={`flex items-center space-x-2 px-3 py-3 rounded-md hover:bg-muted ${currentPath === '/admin' ? 'bg-muted font-medium' : ''}`}
                          >
                            <Store className="h-5 w-5" />
                            <span>Lojas</span>
                          </Link>
                          <Link 
                            to="/admin/secoes" 
                            className={`flex items-center space-x-2 px-3 py-3 rounded-md hover:bg-muted ${currentPath === '/admin/secoes' ? 'bg-muted font-medium' : ''}`}
                          >
                            <Layers className="h-5 w-5" />
                            <span>Seções</span>
                          </Link>
                          <Link 
                            to="/admin/perguntas" 
                            className={`flex items-center space-x-2 px-3 py-3 rounded-md hover:bg-muted ${currentPath === '/admin/perguntas' ? 'bg-muted font-medium' : ''}`}
                          >
                            <HelpCircle className="h-5 w-5" />
                            <span>Perguntas</span>
                          </Link>
                          <Link 
                            to="/admin/usuarios" 
                            className={`flex items-center space-x-2 px-3 py-3 rounded-md hover:bg-muted ${currentPath === '/admin/usuarios' ? 'bg-muted font-medium' : ''}`}
                          >
                            <Users className="h-5 w-5" />
                            <span>Usuários</span>
                          </Link>
                          <Link 
                            to="/admin/relatorios" 
                            className={`flex items-center space-x-2 px-3 py-3 rounded-md hover:bg-muted ${currentPath === '/admin/relatorios' ? 'bg-muted font-medium' : ''}`}
                          >
                            <BarChart className="h-5 w-5" />
                            <span>Relatórios</span>
                          </Link>
                        </nav>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
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
            )}
            <div className="overflow-x-hidden">
              {children}
            </div>
          </div>
        ) : (
          <div className="overflow-x-hidden">
            {children}
          </div>
        )}
      </main>
      
      <footer className="py-3 px-4 sm:px-6 border-t text-center text-xs sm:text-sm text-muted-foreground">
        <div className="container">
          &copy; {new Date().getFullYear()} O REI DOS CATÁLOGOS - Rogerio Carvalheira
        </div>
      </footer>
    </div>
  );
}
