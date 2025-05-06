// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


	//ajustar aqui
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

// Login com email e senha
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "logado.html";
    } catch (err) {
      document.getElementById("error").innerText = err.message;
      document.getElementById("message").innerText = "";
    }
  });
}

// Login com Google com tratamento para linking de contas
const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Login Google ok, redireciona
      window.location.href = "logado.html";
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        // Conta existe com outro provedor
        const pendingCred = error.credential;
        const email = error.customData.email;

        // Pega os métodos de login que o usuário já usa
        const methods = await auth.fetchSignInMethodsForEmail(email);

        if (methods.includes("password")) {
          // Pede a senha para linkar as contas
          const password = prompt(`Já existe uma conta com o email ${email}. Por favor, digite sua senha para vincular as contas:`);

          if (!password) {
            document.getElementById("error").innerText = "Senha necessária para vincular as contas.";
            return;
          }

          try {
            // Login com email/senha
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Vincula a conta Google
            await userCredential.user.linkWithCredential(pendingCred);

            // Sucesso ao vincular, redireciona
            window.location.href = "logado.html";
          } catch (linkError) {
            document.getElementById("error").innerText = linkError.message;
          }
        } else {
          document.getElementById("error").innerText =
            `Por favor, faça login usando o método associado à sua conta (${methods.join(", ")})`;
        }
      } else {
        document.getElementById("error").innerText = error.message;
      }
      document.getElementById("message").innerText = "";
    }
  });
}

// Cadastro com email e senha
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      document.getElementById("message").innerText =
        "Cadastro realizado com sucesso! Agora você pode fazer login.";
      document.getElementById("error").innerText = "";

      signupForm.reset();
    } catch (err) {
      document.getElementById("error").innerText = err.message;
      document.getElementById("message").innerText = "";
    }
  });
}

// Recuperar senha
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
if (resetPasswordBtn) {
  resetPasswordBtn.addEventListener("click", async () => {
    const emailInput = document.getElementById("email");
    const email = emailInput.value;

    if (!email) {
      document.getElementById("error").innerText =
        "Por favor, informe seu e-mail para recuperar a senha.";
      document.getElementById("message").innerText = "";
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      document.getElementById("message").innerText =
        "Email de recuperação enviado. Verifique sua caixa de entrada.";
      document.getElementById("error").innerText = "";
    } catch (err) {
      document.getElementById("error").innerText = err.message;
      document.getElementById("message").innerText = "";
    }
  });
}
