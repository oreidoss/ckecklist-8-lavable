
import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Check } from 'lucide-react';

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supervisorName: string;
  gerenteName: string;
  onConfirm: (supervisorSignature: string, gerenteSignature: string) => void;
  isLoading?: boolean;
}

const SignatureDialog: React.FC<SignatureDialogProps> = ({
  open,
  onOpenChange,
  supervisorName,
  gerenteName,
  onConfirm,
  isLoading = false
}) => {
  const supervisorCanvasRef = useRef<HTMLCanvasElement>(null);
  const gerenteCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSupervisor, setIsDrawingSupervisor] = useState(false);
  const [isDrawingGerente, setIsDrawingGerente] = useState(false);
  const [supervisorSigned, setSupervisorSigned] = useState(false);
  const [gerenteSigned, setGerenteSigned] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset signatures when dialog opens
      clearSignature('supervisor');
      clearSignature('gerente');
    }
  }, [open]);

  const setupCanvas = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const getCanvasCoordinates = (canvas: HTMLCanvasElement, event: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (type: 'supervisor' | 'gerente', event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const canvas = type === 'supervisor' ? supervisorCanvasRef.current : gerenteCanvasRef.current;
    if (!canvas) return;

    if (canvas.width === 0 || canvas.height === 0) {
      setupCanvas(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(canvas, event);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    if (type === 'supervisor') {
      setIsDrawingSupervisor(true);
    } else {
      setIsDrawingGerente(true);
    }
  };

  const draw = (type: 'supervisor' | 'gerente', event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const isDrawing = type === 'supervisor' ? isDrawingSupervisor : isDrawingGerente;
    if (!isDrawing) return;

    const canvas = type === 'supervisor' ? supervisorCanvasRef.current : gerenteCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(canvas, event);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (type: 'supervisor' | 'gerente') => {
    if (type === 'supervisor') {
      setIsDrawingSupervisor(false);
      setSupervisorSigned(true);
    } else {
      setIsDrawingGerente(false);
      setGerenteSigned(true);
    }
  };

  const clearSignature = (type: 'supervisor' | 'gerente') => {
    const canvas = type === 'supervisor' ? supervisorCanvasRef.current : gerenteCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (type === 'supervisor') {
      setSupervisorSigned(false);
    } else {
      setGerenteSigned(false);
    }
  };

  const getSignatureBase64 = (canvas: HTMLCanvasElement): string => {
    return canvas.toDataURL('image/png');
  };

  const handleConfirm = () => {
    if (!supervisorCanvasRef.current || !gerenteCanvasRef.current) return;
    if (!supervisorSigned || !gerenteSigned) return;

    const supervisorSignature = getSignatureBase64(supervisorCanvasRef.current);
    const gerenteSignature = getSignatureBase64(gerenteCanvasRef.current);
    
    onConfirm(supervisorSignature, gerenteSignature);
  };

  const canConfirm = supervisorSigned && gerenteSigned && !isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assinaturas Digitais</DialogTitle>
          <DialogDescription>
            Para finalizar a auditoria, é necessário a assinatura digital do supervisor e do gerente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Assinatura do Supervisor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Assinatura do Supervisor</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearSignature('supervisor')}
                disabled={!supervisorSigned}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>
            <p className="text-xs text-gray-600">{supervisorName}</p>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <canvas
                ref={supervisorCanvasRef}
                width={400}
                height={150}
                className="w-full h-24 cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={(e) => startDrawing('supervisor', e)}
                onMouseMove={(e) => draw('supervisor', e)}
                onMouseUp={() => stopDrawing('supervisor')}
                onMouseLeave={() => stopDrawing('supervisor')}
                onTouchStart={(e) => startDrawing('supervisor', e)}
                onTouchMove={(e) => draw('supervisor', e)}
                onTouchEnd={() => stopDrawing('supervisor')}
              />
            </div>
            {supervisorSigned && (
              <div className="flex items-center text-green-600 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Assinatura capturada
              </div>
            )}
          </div>

          <Separator />

          {/* Assinatura do Gerente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Assinatura do Gerente</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearSignature('gerente')}
                disabled={!gerenteSigned}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>
            <p className="text-xs text-gray-600">{gerenteName}</p>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <canvas
                ref={gerenteCanvasRef}
                width={400}
                height={150}
                className="w-full h-24 cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={(e) => startDrawing('gerente', e)}
                onMouseMove={(e) => draw('gerente', e)}
                onMouseUp={() => stopDrawing('gerente')}
                onMouseLeave={() => stopDrawing('gerente')}
                onTouchStart={(e) => startDrawing('gerente', e)}
                onTouchMove={(e) => draw('gerente', e)}
                onTouchEnd={() => stopDrawing('gerente')}
              />
            </div>
            {gerenteSigned && (
              <div className="flex items-center text-green-600 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Assinatura capturada
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {isLoading ? "Finalizando..." : "Finalizar Auditoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureDialog;
