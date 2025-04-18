
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Store, Edit, UserRound, Save } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Usuario } from '@/lib/types';

interface ChecklistHeaderProps {
  lojaName: string;
  lojaNumero: string;
  progresso: number;
  currentDate: string;
  supervisor: string;
  gerente: string;
  isEditingSupervisor: boolean;
  isEditingGerente: boolean;
  usuarios: Usuario[];
  setIsEditingSupervisor: (value: boolean) => void;
  setIsEditingGerente: (value: boolean) => void;
  setSupervisor: (value: string) => void;
  setGerente: (value: string) => void;
  handleSaveSupervisor: () => void;
  handleSaveGerente: () => void;
}

const ChecklistHeader: React.FC<ChecklistHeaderProps> = ({
  lojaName,
  lojaNumero,
  progresso,
  currentDate,
  supervisor,
  gerente,
  isEditingSupervisor,
  isEditingGerente,
  usuarios,
  setIsEditingSupervisor,
  setIsEditingGerente,
  setSupervisor,
  setGerente,
  handleSaveSupervisor,
  handleSaveGerente
}) => {
  // Display the current values without hardcoded defaults
  const displaySupervisor = supervisor || "";
  const displayGerente = gerente || "";

  // Filter usuarios by role if available
  const supervisores = usuarios?.filter(u => 
    u.role === 'supervisor' || 
    u.funcao === 'supervisor' || 
    u.email?.toLowerCase().includes('supervisor') || 
    u.nome?.toLowerCase().includes('supervisor')
  );

  const gerentes = usuarios?.filter(u => 
    u.role === 'gerente' || 
    u.funcao === 'gerente' || 
    u.email?.toLowerCase().includes('gerente') || 
    u.nome?.toLowerCase().includes('gerente')
  );

  // Verificação melhorada para garantir que a lista de usuários não esteja vazia
  const hasSupervisores = supervisores && supervisores.length > 0;
  const hasGerentes = gerentes && gerentes.length > 0;

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center text-gray-700">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Voltar</span>
        </Link>
        <div className="text-right text-gray-600">
          {currentDate}
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <Store className="h-5 w-5 text-[#00bfa5] mr-2" />
        <h1 className="text-xl font-bold">{lojaName} {lojaNumero}</h1>
        <div className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {Math.round(progresso)}% completo
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Supervisor(a)</label>
          <div className="relative">
            {isEditingSupervisor ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select 
                    value={supervisor} 
                    onValueChange={(value) => setSupervisor(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um supervisor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[300px] overflow-y-auto z-50">
                      {hasSupervisores 
                        ? supervisores.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.nome}>
                              {usuario.nome}
                            </SelectItem>
                          ))
                        : usuarios?.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.nome}>
                              {usuario.nome}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSaveSupervisor}
                  variant="outline" 
                  className="h-10 px-3 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => setIsEditingSupervisor(false)}
                  variant="outline" 
                  className="h-10 px-3"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 border rounded-md bg-gray-50 flex items-center">
                  <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                  {displaySupervisor || "Nenhum supervisor selecionado"}
                </div>
                <Button 
                  onClick={() => setIsEditingSupervisor(true)}
                  variant="outline" 
                  className="h-10 px-3"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm text-gray-600 block mb-1">Gerente da Loja</label>
          <div className="relative">
            {isEditingGerente ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select 
                    value={gerente} 
                    onValueChange={(value) => {
                      console.log("ChecklistHeader - Alterando gerente para:", value);
                      setGerente(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um gerente" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="bg-white max-h-[300px] overflow-y-auto z-50">
                      {hasGerentes 
                        ? gerentes.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.nome}>
                              {usuario.nome}
                            </SelectItem>
                          ))
                        : usuarios?.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.nome}>
                              {usuario.nome}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSaveGerente}
                  variant="outline" 
                  className="h-10 px-3 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => setIsEditingGerente(false)}
                  variant="outline" 
                  className="h-10 px-3"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 border rounded-md bg-gray-50 flex items-center">
                  <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                  {displayGerente || "Nenhum gerente selecionado"}
                </div>
                <Button 
                  onClick={() => setIsEditingGerente(true)}
                  variant="outline" 
                  className="h-10 px-3"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistHeader;
