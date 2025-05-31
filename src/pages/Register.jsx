import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro("");

    if (!username || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      await api.post("/auth/registrar_usuario/", {
        username,
        senha,
        confirmar_senha: confirmarSenha,
      });
      navigate("/"); // redireciona para login
    } catch (err) {
      const data = err.response?.data;
      setErro(
        data?.username?.[0] ||
        data?.senha?.[0] ||
        data?.confirmar_senha?.[0] ||
        data?.erro ||
        "Erro ao cadastrar. Verifique os dados."
      );
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-gray-100" role="main">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4"
        aria-label="Formulário de cadastro"
      >
        <h1 className="text-2xl font-bold text-center" id="register-title">Cadastro</h1>

        {erro && <p className="text-red-500 text-sm text-center" role="alert">{erro}</p>}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuário</label>
          <input
            id="username"
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            id="senha"
            type="password"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
          <input
            id="confirmarSenha"
            type="password"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Cadastrar
        </button>

        <p className="text-sm text-center">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-green-600 hover:underline cursor-pointer"
          >
            Faça login
          </button>
        </p>
      </form>
    </main>
  );
}
