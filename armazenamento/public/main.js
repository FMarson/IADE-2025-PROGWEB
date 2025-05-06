// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  listAll,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Substitua pelos dados do seu projeto Firebase
// ajustar aqui
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

// Redireciona para login se não estiver autenticado, ou para logado.html se estiver
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "logado.html";
    } else {
      window.location.href = "login.html";
    }
  });
}

// Login com Google
const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "logado.html";
    } catch (err) {
      const errDisplay = document.getElementById("error");
      if (errDisplay) errDisplay.innerText = err.message;
    }
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// Exibe o email do usuário logado
const welcomeText = document.getElementById("welcomeText");
if (welcomeText) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      welcomeText.textContent = `Você está logado com o usuário ${user.email}.`;
      updateFileList();
    } else {
      window.location.href = "login.html";
    }
  });
}

// --- Firebase Storage: Upload e listagem ---

async function updateFileList() {
  const listElement = document.getElementById("fileList");
  if (!listElement) return;

  listElement.innerHTML = "Carregando...";

  const user = auth.currentUser;
  if (!user) {
    listElement.innerHTML = "<li>Usuário não autenticado.</li>";
    return;
  }

  const listRef = storageRef(storage, `uploads/${user.uid}/`);

  try {
    const res = await listAll(listRef);
    if (res.items.length === 0) {
      listElement.innerHTML = "<li>Nenhum arquivo enviado.</li>";
      return;
    }

    listElement.innerHTML = "";

    for (const itemRef of res.items) {
      const url = await getDownloadURL(itemRef);
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = url;
      a.textContent = itemRef.name;
      a.target = "_blank";
      li.appendChild(a);
      listElement.appendChild(li);
    }
  } catch (error) {
    listElement.innerHTML = `<li>Erro ao carregar arquivos: ${error.message}</li>`;
  }
}

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

if (uploadBtn && fileInput) {
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert("Selecione um arquivo para enviar.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    const fileRef = storageRef(storage, `uploads/${user.uid}/${file.name}`);

    try {
      await uploadBytes(fileRef, file);
      alert("Arquivo enviado com sucesso!");
      fileInput.value = "";
      updateFileList();
    } catch (error) {
      alert("Erro ao enviar arquivo: " + error.message);
    }
  });
}
