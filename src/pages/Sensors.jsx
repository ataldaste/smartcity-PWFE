import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/NavBar";

export default function Sensors() {
  const [sensores, setSensores] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [form, setForm] = useState({
    tipo: "temperatura",
    mac_address: "",
    latitude: "",
    longitude: "",
    status: "ativo",
    ambiente: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    const sensoresRes = await api.get("/sensores/");
    const ambientesRes = await api.get("/ambientes/");
    setSensores(sensoresRes.data);
    setAmbientes(ambientesRes.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/sensores/${editId}/`, form);
    } else {
      await api.post("/sensores/", form);
    }
    setForm({
      tipo: "temperatura",
      mac_address: "",
      latitude: "",
      longitude: "",
      status: "ativo",
      ambiente: "",
    });
    setEditId(null);
    fetchData();
  };

  const handleEdit = (sensor) => {
    setForm(sensor);
    setEditId(sensor.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/sensores/${id}/`);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

    return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lista de Sensores */}
          <div className="space-y-6">
            <div className="pb-4">
              <h1 className="text-3xl font-bold text-gray-900">Sensores</h1>
              <p className="text-gray-500 mt-1">
                {sensores.length} sensores cadastrados
              </p>
            </div>

            <div className="space-y-4">
              {sensores.map((s) => (
                <div 
                  key={s.id}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{s.tipo}</h3>
                      <p className="text-sm text-gray-500 mt-1">{s.mac_address}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded-md transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        s.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {s.status}
                      </span>
                      <p>Local: {s.ambiente_sig}</p>
                    </div>
                    <p className="mt-2">Coordenadas: {s.latitude}, {s.longitude}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário Fixo */}
          <div className="sticky top-8 h-fit bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editId ? "Editar Sensor" : "Novo Sensor"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Sensor
                </label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="temperatura">Temperatura</option>
                  <option value="luminosidade">Luminosidade</option>
                  <option value="umidade">Umidade</option>
                  <option value="contador">Contador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MAC Address
                </label>
                <input
                  name="mac_address"
                  value={form.mac_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ambiente
                </label>
                <select
                  name="ambiente"
                  value={form.ambiente || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um ambiente</option>
                  {ambientes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.sig} - {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editId ? "Atualizar Sensor" : "Cadastrar Sensor"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}