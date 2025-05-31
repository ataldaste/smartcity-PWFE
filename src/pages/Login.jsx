import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    if (!username || !password) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      const response = await api.post("token/", {
        username,
        password
      });

      localStorage.setItem("access_token", response.data.access);
      navigate("/home", { replace: true });
    } catch (err) {
      setErro(err.response?.data?.detail || "Credenciais inválidas");
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-gray-100" role="main">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4"
        aria-label="Formulário de login"
      >
        <h1 className="text-2xl font-bold text-center" id="login-title">Login</h1>

        {erro && <p className="text-red-500 text-sm text-center" role="alert">{erro}</p>}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuário</label>
          <input
            id="username"
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-required="true"
            aria-labelledby="username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            id="password"
            type="password"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            aria-labelledby="password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Entrar
        </button>

        <p className="text-sm text-center">
          Não tem conta?{' '}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline cursor-pointer"
            aria-label="Cadastre-se"
          >
            Cadastre-se
          </button>
        </p>
      </form>
    </main>
  );
}