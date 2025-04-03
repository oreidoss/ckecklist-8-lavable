
import { db } from '../db';

export const initDatabase = () => {
  // Check if usuarios already exist
  const existingUsers = db.getUsuarios();
  
  // If no users exist, create a default test user
  if (existingUsers.length === 0) {
    db.addUsuario({
      nome: 'testeuser',
      email: 'teste@exemplo.com',
      senha: 'Teste123!',
      role: 'admin'
    });
    
    console.log('Test user created: testeuser / Teste123!');
  }
};
