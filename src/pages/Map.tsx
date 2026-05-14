import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { visualizationService, MuseumLocation } from '@/services/visualizationService';

// 修复 Leaflet 默认图标
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// 自定义红色图标
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map: React.FC = () => {
  const [locations, setLocations] = useState<MuseumLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuseum, setSelectedMuseum] = useState<MuseumLocation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await visualizationService.getMuseumLocations();
        setLocations(data);
      } catch (error) {
        console.error('获取博物馆数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96">加载地图数据中...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">文物地理分布图</h1>
        <p className="text-gray-500">中国文物海外流散现状可视化</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 地图区域 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <MapContainer
            center={[30, 0]}
            zoom={1.8}
            scrollWheelZoom={true}
            style={{ height: '550px', width: '100%', borderRadius: '0.5rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://www.carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {locations.map((loc) => (
              <Marker
                key={loc.name}
                position={[loc.latitude, loc.longitude]}
                icon={redIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedMuseum(loc);
                  },
                }}
              >
                <Popup>
                  <div className="text-center">
                    <strong>{loc.name}</strong>
                    <br />
                    {loc.city}, {loc.country}
                    <br />
                    🏺 藏品: {loc.collectionCount.toLocaleString()}件
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="mt-2 text-sm text-gray-400 text-center">
            💡 提示：点击红色标记查看博物馆详情，支持拖拽和缩放地图。
          </div>
        </div>

        {/* 右侧统计和详情 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">统计摘要</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">覆盖国家/地区</span>
                <span className="font-medium">{new Set(locations.map(l => l.country)).size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">博物馆数量</span>
                <span className="font-medium">{locations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">总藏品数量</span>
                <span className="font-medium text-blue-600">{locations.reduce((sum, l) => sum + l.collectionCount, 0).toLocaleString()} 件</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">博物馆详情</h3>
            {selectedMuseum ? (
              <div className="space-y-2">
                <div><span className="text-gray-500">名称：</span><span className="font-medium">{selectedMuseum.name}</span></div>
                <div><span className="text-gray-500">位置：</span>{selectedMuseum.city}, {selectedMuseum.country}</div>
                <div><span className="text-gray-500">藏品数量：</span><span className="text-blue-600 font-bold">{selectedMuseum.collectionCount.toLocaleString()}</span> 件</div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-6">点击地图上的红色标记查看博物馆详情</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4 max-h-64 overflow-auto">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">博物馆列表</h3>
            <div className="space-y-2 text-sm">
              {locations.map((loc) => (
                <div
                  key={loc.name}
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded flex justify-between"
                  onClick={() => setSelectedMuseum(loc)}
                >
                  <span className="truncate">{loc.name}</span>
                  <span className="text-gray-400">{loc.collectionCount}件</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;