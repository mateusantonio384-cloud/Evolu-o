import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthErrorCodes
} from 'firebase/auth';
import { auth } from '../firebase';
import { GoogleIcon } from './Icons';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha e-mail e senha.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === AuthErrorCodes.USER_DELETED) {
         try {
            await createUserWithEmailAndPassword(auth, email, password);
         } catch (createErr: any) {
            setError(`Falha ao criar conta: ${createErr.message}`);
         }
      } else if (err.code === AuthErrorCodes.INVALID_PASSWORD) {
        setError("Senha incorreta. Por favor, tente novamente.");
      } else {
        setError(`Ocorreu um erro: ${err.message}`);
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(`Falha no login com Google: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">Evolução</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Faça login para continuar</p>
        </div>

        {error && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-2 rounded-md">{error}</p>}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-color))]"
              required
            />
          </div>
          <div>
            <label htmlFor="password-auth" className="sr-only">Senha</label>
            <input
              id="password-auth"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-color))]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)] font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-[rgb(var(--accent-color))]"
          >
            Entrar / Cadastrar
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-zinc-600"></div>
          <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">OU</span>
          <div className="flex-grow border-t border-gray-300 dark:border-zinc-600"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-blue-500"
        >
          <GoogleIcon className="h-5 w-5 mr-3" />
          Continuar com o Google
        </button>
      </div>
    </div>
  );
};

export default Auth;
