import { useEffect, useState } from "react";
import api from "../services/api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/NavBar";
import { debounce } from "lodash";

export default function History() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sensor_id: "",
    ambiente_sig: "",
    tipo_sensor: "",
    data_inicio: "",
    data_fim: ""
  });

  const fetchHistorico = debounce(async () => {
    setLoading(true);
    try {
      const params = {
        'sensor__id': filters.sensor_id || undefined,
        'sensor__ambiente__sig': filters.ambiente_sig || undefined,
        'sensor__tipo': filters.tipo_sensor || undefined,
        'timestamp__gte': filters.data_inicio || undefined,
        'timestamp__lte': filters.data_fim || undefined
      };

      const res = await api.get("/historicos/", { params });
      setDados(res.data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
    setLoading(false);
  }, 500);

  useEffect(() => {
    fetchHistorico();
  }, [filters]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
          <p className="font-medium text-gray-700">{formatDate(label)}</p>
          <div className="flex items-center mt-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">{`Valor: ${payload[0].value.toFixed(2)}`}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📊 Histórico de Leituras</h1>
            <p className="text-gray-500 mt-1">
              Evolução temporal das medições registradas pelos sensores
            </p>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <input
              type="text"
              placeholder="ID do Sensor"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, sensor_id: e.target.value })}
            />
            <input
              type="text"
              placeholder="Código Ambiente"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, ambiente_sig: e.target.value })}
            />
            <select
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, tipo_sensor: e.target.value })}
            >
              <option value="">Todos os Tipos</option>
              <option value="temperatura">Temperatura</option>
              <option value="luminosidade">Luminosidade</option>
              <option value="umidade">Umidade</option>
            </select>
            <input
              type="date"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
            />
            <input
              type="date"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
            />
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : dados.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <div className="mb-4 p-6 bg-blue-50 rounded-full">
                <span className="text-4xl">📭</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Dados Históricos Indisponíveis
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Nenhuma medição foi registrada até o momento.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Legenda Explicativa */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Valor das Medições</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <span className="text-sm text-gray-500">Média Histórica</span>
                </div>
              </div>

              {/* Gráfico */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#f1f5f9"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="timestamp"
                      tick={{ fill: '#64748b' }}
                      tickFormatter={formatDate}
                      angle={-45}
                      textAnchor="end"
                    />

                    <YAxis
                      tick={{ fill: '#64748b' }}
                      label={{
                        value: 'Valor Medido',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#64748b' }
                      }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend 
                      verticalAlign="top"
                      height={40}
                      formatter={(value) => (
                        <span className="text-gray-600 text-sm">{value}</span>
                      )}
                    />

                    <Line
                      name="Valor das Medições"
                      type="monotone"
                      dataKey="valor"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: '#3b82f6',
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                      fill="url(#colorValor)"
                    />

                    {/* Linha de Média (opcional) */}
                    <Line
                      name="Média Histórica"
                      type="monotone"
                      dataKey="media"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      dot={false}
                      strokeWidth={1}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Notas Explicativas */}
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>
                  Eixo X: Data e Hora da Medição • Eixo Y: Valor Registrado pelo Sensor
                </p>
                <p className="mt-1">
                  Dados atualizados em tempo real • Intervalo de medição: 15 minutos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
