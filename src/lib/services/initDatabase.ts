
import { db } from '../db';

export const initDatabase = () => {
  // Check if usuarios already exist
  const existingUsers = db.getUsuarios();
  console.log("Usuários existentes:", existingUsers.length);
  
  // If no users exist, create a default test user
  if (existingUsers.length === 0) {
    console.log("Criando usuário de teste...");
    const novoUsuario = db.addUsuario({
      nome: 'testeuser',
      email: 'teste@exemplo.com',
      senha: 'Teste123!',
      role: 'admin'
    });
    
    console.log('Usuário de teste criado:', novoUsuario);
  } else {
    // Verificar se o usuário de teste existe
    const testeUserExists = existingUsers.some(u => u.nome === 'testeuser');
    
    if (!testeUserExists) {
      console.log("Usuário testeuser não encontrado. Criando...");
      const novoUsuario = db.addUsuario({
        nome: 'testeuser',
        email: 'teste@exemplo.com',
        senha: 'Teste123!',
        role: 'admin'
      });
      
      console.log('Usuário de teste criado:', novoUsuario);
    } else {
      console.log("Usuário testeuser já existe.");
    }
  }
  
  // Exibe os usuários no console para debugging
  console.log("Usuários após inicialização:", db.getUsuarios());
};
