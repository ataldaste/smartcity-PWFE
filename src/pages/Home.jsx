import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Navbar from "../components/NavBar";
import L from 'leaflet';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';

// Funções auxiliares para estilização
const getSensorColor = (type, status) => ({
  critico: '#ef4444',
  alerta: '#f59e0b',
  normal: '#10b981'
}[status]);

const getStatusGlow = (status) => ({
  critico: 'rgba(239,68,68,0.3)',
  alerta: 'rgba(245,158,11,0.3)',
  normal: 'rgba(16,185,129,0.3)'
}[status]);

// Configuração de ícones
const createIcon = (type, status) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${getSensorColor(type, status)}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid blue; box-shadow: 0 0 8px ${getStatusGlow(status)};"></div>`
});

export default function Home() {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  const fetchData = async () => {
    try {
      // Solicitar sensores e históricos (métricas)
      const [sensorsRes, statsRes] = await Promise.all([
        api.get('/sensores'),
        api.get('/historicos')
      ]);

      // Organizar os dados e calcular as métricas globais
      setSensors(sensorsRes.data);
      const stats = calculateGlobalStats(statsRes.data);
      setStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Erro na requisição:', error);
      setLoading(false);
    }
  };

  // Função para calcular métricas globais a partir dos históricos
  const calculateGlobalStats = (historicos) => {
    const stats = {
      temperatura_media: 0,
      umidade_media: 0,
      luminosidade_media: 0,
      contador_media: 0,
      temperatura_status: 'normal',
      umidade_status: 'normal',
      luminosidade_status: 'normal',
      contador_status: 'normal'
    };

    let countTemperatura = 0, countUmidade = 0, countLuminosidade = 0, countContador = 0;

    historicos.forEach(historico => {
      const tipo = historico.sensor_tipo;
      const valor = historico.valor;

      if (tipo === 'temperatura') {
        stats.temperatura_media += valor;
        countTemperatura++;
      } else if (tipo === 'umidade') {
        stats.umidade_media += valor;
        countUmidade++;
      } else if (tipo === 'luminosidade') {
        stats.luminosidade_media += valor;
        countLuminosidade++;
      } else if (tipo === 'contador') {
        stats.contador_media += valor;
        countContador++;
      }
    });

    // Calcular as médias
    stats.temperatura_media = countTemperatura ? stats.temperatura_media / countTemperatura : 0;
    stats.umidade_media = countUmidade ? stats.umidade_media / countUmidade : 0;
    stats.luminosidade_media = countLuminosidade ? stats.luminosidade_media / countLuminosidade : 0;
    stats.contador_media = countContador ? stats.contador_media / countContador : 0;

    // Definir o status das métricas globais (simulando lógica de thresholds, conforme você sugeriu)
    stats.temperatura_status = stats.temperatura_media > 30 ? 'critico' : stats.temperatura_media > 27 ? 'alerta' : 'normal';
    stats.umidade_status = stats.umidade_media > 75 ? 'critico' : stats.umidade_media > 65 ? 'alerta' : 'normal';
    stats.luminosidade_status = stats.luminosidade_media > 1000 ? 'critico' : stats.luminosidade_media > 800 ? 'alerta' : 'normal';
    stats.contador_status = stats.contador_media > 50 ? 'critico' : stats.contador_media > 30 ? 'alerta' : 'normal';

    return stats;
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Função para definir a unidade de cada tipo de sensor
  const getUnit = (type) => ({
    temperatura: '°C',
    umidade: '%',
    luminosidade: 'lux',
    contador: ' pessoas'
  }[type]);

  const getChartColor = (type) => ({
    temperatura: '#ef4444',
    umidade: '#3b82f6',
    luminosidade: '#f59e0b',
    contador: '#10b981'
  }[type]);

  const getStatusClass = (status) => ({
    critico: 'bg-red-100 text-red-800',
    alerta: 'bg-amber-100 text-amber-800',
    normal: 'bg-green-100 text-green-800'
  }[status]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Painel Esquerdo - Estatísticas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Métricas Globais</h2>
            <div className="space-y-4">
              {['temperatura', 'umidade', 'luminosidade', 'contador'].map((type) => (
                <div key={type} className="p-3 rounded-lg border-l-4"
                     style={{ borderColor: getChartColor(type) }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 capitalize">{type}</p>
                      <p className="text-xl font-bold">
                        {stats[`${type}_media`]?.toFixed(1) || '0.0'}{getUnit(type)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(stats[`${type}_status`])}`}>
                      {stats[`${type}_status`] || 'normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa Central */}
        <div className="lg:col-span-2 h-[60vh] lg:h-auto relative rounded-xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <MapContainer
              center={[-23.5505, -46.6333]}
              zoom={18}
              className="h-full w-full"
              preferCanvas={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap'
              />

              {sensors.map(sensor => (
                <Marker
                  key={sensor.id}
                  position={[sensor.latitude, sensor.longitude]}
                  icon={createIcon(sensor.tipo, sensor.status)}
                  eventHandlers={{ click: () => setSelectedSensor(sensor) }}
                >
                  <Popup className="text-sm min-w-[200px]">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{sensor.nome}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(sensor.status)}`}>
                          {sensor.tipo.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Valor</p>
                          <p className="font-medium">{sensor.valor}{getUnit(sensor.tipo)}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium">{sensor.status}</p>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Painel Direito - Detalhes */}
        <div className="lg:col-span-1 space-y-4">
          {selectedSensor ? (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">{selectedSensor.nome}</h3>
              <p className="text-sm text-gray-500">{selectedSensor.ambiente_sig}</p>
              <p className="text-lg">{selectedSensor.valor}{getUnit(selectedSensor.tipo)}</p>
              </div>
              </div>
              ) : (
              <div className="bg-white p-4 rounded-xl shadow-lg">
              <p className="text-gray-500">Selecione um sensor para visualizar detalhes</p>
              </div>
                )}
        </div>
      </div>
</div>
);
}