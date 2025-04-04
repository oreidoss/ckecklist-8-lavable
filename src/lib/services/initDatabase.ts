
import { db } from '../db';

export const initDatabase = async () => {
  try {
    // Check if usuarios already exist - get as Promise and await result
    const existingUsers = await db.getUsuarios();
    console.log("Usuários existentes:", existingUsers?.length || 0);
    
    // If no users exist, create a default test user
    if (!existingUsers || existingUsers.length === 0) {
      console.log("Criando usuário de teste...");
      const novoUsuario = await db.addUsuario({
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
        const novoUsuario = await db.addUsuario({
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
    const updatedUsers = await db.getUsuarios();
    console.log("Usuários após inicialização:", updatedUsers);
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
};
