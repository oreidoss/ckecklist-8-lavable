
import { Usuario } from "@/lib/types";

export const validateUserForm = (usuario: Usuario): { isValid: boolean, errorMessage?: string } => {
  if (!usuario.nome || !usuario.email) {
    return {
      isValid: false,
      errorMessage: "Preencha o nome e o email do usuário."
    };
  }
  
  // Validate email format
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(usuario.email)) {
    return {
      isValid: false,
      errorMessage: "Por favor, forneça um email válido."
    };
  }
  
  // Validate password if provided
  if (usuario.senha && usuario.senha.length < 4) {
    return {
      isValid: false,
      errorMessage: "A senha deve ter pelo menos 4 caracteres."
    };
  }
  
  return { isValid: true };
};
