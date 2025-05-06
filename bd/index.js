import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

async function startServer() {
  const serviceAccountPath = path.resolve('./serviceAccountKey.json');
  const serviceAccountRaw = await fs.readFile(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountRaw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();

  const app = express();
  app.use(express.json());
  
   app.use(express.static(path.join(process.cwd(), 'public')));
   
   app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

  // CREATE - Criar usuário
  app.post('/usuarios', async (req, res) => {
    try {
      const { nome, email } = req.body;
      if (!nome || !email) {
        return res.status(400).json({ error: 'Campos nome e email são obrigatórios.' });
      }
      const docRef = await db.collection('usuarios').add({ nome, email });
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // READ - Listar todos usuários
  app.get('/usuarios', async (req, res) => {
    try {
      const snapshot = await db.collection('usuarios').get();
      const usuarios = [];
      snapshot.forEach(doc => usuarios.push({ id: doc.id, ...doc.data() }));
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // READ - Obter usuário por ID
  app.get('/usuarios/:id', async (req, res) => {
    try {
      const docRef = db.collection('usuarios').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // UPDATE - Atualizar usuário
  app.put('/usuarios/:id', async (req, res) => {
    try {
      const { nome, email } = req.body;
      if (!nome && !email) {
        return res.status(400).json({ error: 'Informe ao menos um campo para atualizar.' });
      }
      const docRef = db.collection('usuarios').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      const updateData = {};
      if (nome) updateData.nome = nome;
      if (email) updateData.email = email;
      await docRef.update(updateData);
      res.json({ message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE - Excluir usuário
  app.delete('/usuarios/:id', async (req, res) => {
    try {
      const docRef = db.collection('usuarios').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      await docRef.delete();
      res.json({ message: 'Usuário excluído com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer().catch(console.error);
