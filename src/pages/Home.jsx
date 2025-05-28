import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Navbar from "../components/NavBar";
import api from '../services/api';
import 'leaflet/dist/leaflet.css';

const getSensorColor = (type, status) => ({
  critico: '#ef4444',
  alerta: '#f59e0b',
  normal: '#10b981'
}[status] || '#6b7280');

const getStatusGlow = (status) => ({
  critico: 'rgba(239,68,68,0.3)',
  alerta: 'rgba(245,158,11,0.3)',
  normal: 'rgba(16,185,129,0.3)'
}[status] || 'rgba(107,114,128,0.3)');

const createIcon = (type, status) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${getSensorColor(type, status)}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid blue; box-shadow: 0 0 8px ${getStatusGlow(status)};"></div>`
});

export default function Home() {
  const [sensors, setSensors] = useState([]);
  const [historicos, setHistoricos] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, historicosRes] = await Promise.all([
          api.get('/sensores'),
          api.get('/historicos')
        ]);
        setSensors(sensorsRes.data);
        setHistoricos(historicosRes.data);
        setStats(calculateStats(historicosRes.data, sensorsRes.data));
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const calculateStats = (historicos, sensores) => {
    const stats = {
      temperatura: { soma: 0, count: 0 },
      umidade: { soma: 0, count: 0 },
      luminosidade: { soma: 0, count: 0 },
      contador: { soma: 0, count: 0 }
    };

    const sensorMap = {};
    sensores.forEach(s => sensorMap[s.id] = s.tipo);

    historicos.forEach(h => {
      const tipo = sensorMap[h.sensor];
      if (tipo && stats[tipo]) {
        stats[tipo].soma += h.valor;
        stats[tipo].count += 1;
      }
    });

    const resultado = {};
    Object.entries(stats).forEach(([tipo, { soma, count }]) => {
      const media = count ? soma / count : 0;
      resultado[`${tipo}_media`] = media;
      resultado[`${tipo}_status`] =
        media > (tipo === 'temperatura' ? 30 : tipo === 'umidade' ? 75 : tipo === 'luminosidade' ? 1000 : 50)
          ? 'critico'
          : media > (tipo === 'temperatura' ? 27 : tipo === 'umidade' ? 65 : tipo === 'luminosidade' ? 800 : 30)
            ? 'alerta'
            : 'normal';
    });

    return resultado;
  };

  const getUnit = (type) => ({
    temperatura: '°C',
    umidade: '%',
    luminosidade: 'lux',
    contador: ' pessoas'
  }[type] || '');

  const getChartColor = (type) => ({
    temperatura: '#ef4444',
    umidade: '#3b82f6',
    luminosidade: '#f59e0b',
    contador: '#10b981'
  }[type] || '#6b7280');

  const getStatusClass = (status) => ({
    critico: 'bg-red-100 text-red-800',
    alerta: 'bg-amber-100 text-amber-800',
    normal: 'bg-green-100 text-green-800'
  }[status] || 'bg-gray-100 text-gray-800');

  const latestValues = {};
  historicos.forEach(h => {
    if (!latestValues[h.sensor] || new Date(h.timestamp) > new Date(latestValues[h.sensor].timestamp)) {
      latestValues[h.sensor] = h;
    }
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        
        {/* Métricas Globais */}
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

        {/* Mapa */}
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
              {sensors.map((sensor) => {
                const valorAtual = latestValues[sensor.id]?.valor ?? null;
                return (
                  <Marker
                    key={sensor.id}
                    position={[sensor.latitude, sensor.longitude]}
                    icon={createIcon(sensor.tipo, sensor.status)}
                    eventHandlers={{ click: () => setSelectedSensor(sensor) }}
                  >
                    <Popup className="text-sm min-w-[200px]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">{sensor.tipo.toUpperCase()} ({sensor.mac_address})</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(sensor.status)}`}>
                            {sensor.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-500">Valor</p>
                            <p className="font-medium">{valorAtual != null ? `${valorAtual}${getUnit(sensor.tipo)}` : '—'}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-500">Ambiente</p>
                            <p className="font-medium">{sensor.ambiente}</p>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Detalhes */}
        <div className="lg:col-span-1 space-y-4">
          {selectedSensor ? (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <h3 className="font-bold text-xl">{selectedSensor.tipo.toUpperCase()} ({selectedSensor.mac_address})</h3>
              <p className="text-sm text-gray-500">Ambiente: {selectedSensor.ambiente}</p>
              <p className="text-lg mt-2">
                Valor: {latestValues[selectedSensor.id]?.valor ?? '-'}{getUnit(selectedSensor.tipo)}
              </p>
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
