import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { visualizationService, MuseumLocation } from '@/services/visualizationService';
import { realApiService } from '@/services/artifactService';
import { AuthImage } from '@/components/ui/auth-image';
import type { Artifact } from '@/types/artifact';

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
  const [museumArtifacts, setMuseumArtifacts] = useState<Artifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(false);

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

  // 当选中博物馆时，加载该博物馆的文物
  const handleSelectMuseum = async (museum: MuseumLocation) => {
  setSelectedMuseum(museum);
  setLoadingArtifacts(true);
  setMuseumArtifacts([]);

  try {
    // 博物馆名称映射（中文 -> 后端存储的英文名称）
    const museumNameMap: Record<string, string> = {
      '大英博物馆': 'British Museum',
      '大都会艺术博物馆': 'Metropolitan Museum of Art',
      '芝加哥艺术博物馆': 'Art Institute of Chicago',
      '普林斯顿大学艺术博物馆': 'Princeton University Art Museum',
      '布鲁克林博物馆': 'Brooklyn Museum',
      '波士顿美术馆': 'Boston',
      '克利夫兰艺术博物馆': 'Cleveland Museum of Art',
      '弗利尔美术馆': 'Freer Gallery of Art',
    };

    const searchName = museumNameMap[museum.name] || museum.name;
    console.log('搜索博物馆文物:', searchName);  // 调试用

    const response = await realApiService.searchArtifacts(searchName, 1, 6);
    setMuseumArtifacts(response.data);
  } catch (error) {
    console.error('加载博物馆文物失败:', error);
  } finally {
    setLoadingArtifacts(false);
  }
};
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {locations.map((loc) => (
              <Marker
                key={loc.name}
                position={[loc.latitude, loc.longitude]}
                icon={redIcon}
                eventHandlers={{
                  click: () => {
                    handleSelectMuseum(loc);
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
                    <br />
                    <span className="text-xs text-blue-500">点击右侧查看文物列表</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="mt-2 text-sm text-gray-400 text-center">
            💡 提示：点击红色标记查看博物馆详情和藏品
          </div>
        </div>

        {/* 右侧统计和详情 */}
        <div className="space-y-4">
          {/* 统计摘要 */}
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

          {/* 博物馆详情 + 文物列表 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">博物馆详情</h3>
            {selectedMuseum ? (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-medium text-gray-800">{selectedMuseum.name}</div>
                  <div className="text-sm text-gray-500">{selectedMuseum.city}, {selectedMuseum.country}</div>
                  <div className="text-sm mt-1">🏺 藏品数量: <span className="font-bold text-blue-600">{selectedMuseum.collectionCount.toLocaleString()}</span> 件</div>
                </div>

                {/* 文物列表 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    🖼️ 代表性文物
                    <span className="text-xs text-gray-400">({museumArtifacts.length}件)</span>
                  </h4>
                  {loadingArtifacts ? (
                    <div className="text-center py-4 text-gray-400 text-sm">加载文物中...</div>
                  ) : museumArtifacts.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {museumArtifacts.map((artifact) => (
                        <div
                          key={artifact.id}
                          className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => window.location.href = `/artifact/${artifact.id}`}
                        >
                          {artifact.images && artifact.images[0] ? (
                            <AuthImage
                              src={artifact.images[0] || ''}
                              alt={artifact.name}
                              className="w-12 h-12 object-cover rounded"
                              errorFallback={
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">无图</div>
                              }
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">无图</div>
                          )}
                        <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm truncate">{artifact.name}</div>
                        <div className="text-xs text-gray-500">{artifact.era} · {artifact.category}</div>
                        </div>
                          <span className="text-xs text-blue-500">查看 →</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      暂无文物数据
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-6 text-sm">
                点击地图上的红色标记查看博物馆详情和藏品
              </div>
            )}
          </div>

          {/* 博物馆列表 */}
          <div className="bg-white rounded-lg shadow p-4 max-h-64 overflow-auto">
            <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">博物馆列表</h3>
            <div className="space-y-2 text-sm">
              {locations.map((loc) => (
                <div
                  key={loc.name}
                  className={`cursor-pointer hover:bg-gray-100 p-2 rounded flex justify-between transition-colors ${selectedMuseum?.name === loc.name ? 'bg-blue-50 border-l-3 border-blue-500' : ''}`}
                  onClick={() => handleSelectMuseum(loc)}
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
