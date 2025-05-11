import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/NavBar";  

export default function Environments() {
  const [ambientes, setAmbientes] = useState([]);
  const [form, setForm] = useState({
    sig: "",
    nome: "",
    localizacao: "",
    descricao: "",
    ni: "",
    responsavel: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchAmbientes = async () => {
    const response = await api.get("/ambientes/");
    setAmbientes(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/ambientes/${editId}/`, form);
    } else {
      await api.post("/ambientes/", form);
    }
    setForm({
      sig: "",
      nome: "",
      localizacao: "",
      descricao: "",
      ni: "",
      responsavel: "",
    });
    setEditId(null);
    fetchAmbientes();
  };

  const handleEdit = (ambiente) => {
    setForm(ambiente);
    setEditId(ambiente.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/ambientes/${id}/`);
    fetchAmbientes();
  };

  useEffect(() => {
    fetchAmbientes();
  }, []);

   return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lista de Ambientes */}
          <div className="space-y-6">
            <div className="pb-4">
              <h1 className="text-3xl font-bold text-gray-900">Ambientes</h1>
              <p className="text-gray-500 mt-1">
                {ambientes.length} ambientes cadastrados
              </p>
            </div>

            <div className="space-y-4">
              {ambientes.map((a) => (
                <div 
                  key={a.id}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{a.nome}</h3>
                      <p className="text-sm text-gray-500 mt-1">{a.sig}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(a)}
                        className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded-md transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Local: {a.localizacao}</p>
                    <p className="mt-1">Responsável: {a.responsavel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário Fixo */}
          <div className="sticky top-8 h-fit bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editId ? "Editar Ambiente" : "Novo Ambiente"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sigla
                </label>
                <input
                  name="sig"
                  value={form.sig}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Ambiente
                </label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  name="localizacao"
                  value={form.localizacao}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <input
                  name="responsavel"
                  value={form.responsavel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editId ? "Atualizar Ambiente" : "Cadastrar Ambiente"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}