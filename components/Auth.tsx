import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
    onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !password.trim()) {
      setError("Por favor, preencha o nome e a senha.");
      return;
    }

    try {
        const usersJSON = localStorage.getItem('app_users');
        const users = usersJSON ? JSON.parse(usersJSON) : {};

        const existingUserPassword = users[name];

        if (existingUserPassword) {
            // Login
            if (window.atob(existingUserPassword) === password) {
                onLogin({ name });
            } else {
                setError("Senha incorreta. Tente novamente.");
            }
        } else {
            // Cadastro
            users[name] = window.btoa(password);
            localStorage.setItem('app_users', JSON.stringify(users));
            onLogin({ name });
        }
    } catch (e) {
        setError("Ocorreu um erro. Por favor, tente novamente.");
        console.error("Auth error:", e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">Evolução</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Crie uma conta ou entre</p>
        </div>

        {error && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-2 rounded-md">{error}</p>}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="username" className="sr-only">Nome</label>
            <input
              id="username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
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
              placeholder="Crie uma senha"
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
      </div>
    </div>
  );
};

export default Auth;
