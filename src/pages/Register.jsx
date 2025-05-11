import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/", {
        nome,
        matricula
      });

      // Armazena os tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // Redireciona para a dashboard (ou homepage protegida)
      navigate("/home");
    } catch (err) {
      setErro(
        err.response?.data?.matricula?.[0] ||
        err.response?.data?.nome?.[0] ||
        "Erro ao cadastrar. Verifique os dados."
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Cadastro</h2>

        {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Matrícula</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
            maxLength={6}
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Cadastrar
        </button>

        <p className="text-sm text-center">
          Já tem conta?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-green-600 hover:underline cursor-pointer"
          >
            Faça login
          </span>
        </p>
      </form>
    </div>
  );
}
