import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// IMPORTANTE: Substitua os valores abaixo pela configuração do seu próprio projeto Firebase.
// Você pode encontrar essas credenciais no console do Firebase:
// Configurações do Projeto > Geral > Seus apps > Configuração do SDK.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância de autenticação para ser usada em outros lugares do aplicativo
export const auth = getAuth(app);
