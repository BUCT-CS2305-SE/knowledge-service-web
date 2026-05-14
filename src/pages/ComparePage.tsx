import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useArtifactStore } from '@/store/artifactStore';
import type { Artifact } from '@/types/artifact';

interface CompareRowProps {
  label: string;
  values: (string | number | undefined)[];
  highlight?: boolean;
}

const CompareRow: React.FC<CompareRowProps> = ({ label, values, highlight = false }) => {
  // Check if all values are the same
  const allSame = values.length > 1 && 
    values.every((v, i, arr) => v === arr[0]) && 
    values[0] !== undefined;

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
      highlight ? 'bg-museum-gold/5' : ''
    }`}>
      <td className="py-4 px-6 font-semibold text-gray-900 bg-gray-50 w-32 align-top">
        {label}
      </td>
      {values.map((value, index) => (
        <td 
          key={index} 
          className={`py-4 px-6 text-center align-middle ${
            highlight && !allSame ? 'font-semibold text-museum-gold-dark' : 'text-gray-700'
          }`}
        >
          <span className={allSame ? 'text-gray-400' : ''}>
            {value || '-'}
          </span>
        </td>
      ))}
    </tr>
  );
};

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useArtifactStore();

  if (compareList.length === 0) {
    return (
      <div className="museum-container py-20">
        <Card className="max-w-2xl mx-auto p-12 text-center">
          <CardContent>
            <GitCompareArrows className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              暂无对比项
            </h2>
            <p className="text-gray-600 mb-8">
              请在浏览页面选择 2-3 件文物进行属性对比
            </p>
            <Link to="/browse">
              <Button size="lg" className="bg-museum-gold hover:bg-museum-gold-dark">
                去选择文物
                <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="museum-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/browse"
            className="inline-flex items-center text-sm text-gray-600 hover:text-museum-gold-dark transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            返回文物列表
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            清空对比
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <GitCompareArrows className="h-10 w-10 text-museum-gold" />
          文物对比
        </h1>
        <p className="text-lg text-gray-600">
          对比 {compareList.length} 件文物的详细属性差异
        </p>
      </div>

      {/* Selected Artifacts Preview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          已选文物（点击移除）
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {compareList.map(artifact => (
            <div key={artifact.id} className="relative group min-w-[160px] max-w-[200px]">
              <button
                onClick={() => removeFromCompare(artifact.id)}
                className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                title="移除此项"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="border-2 border-transparent rounded-lg overflow-hidden hover:border-museum-gold transition-colors cursor-default">
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  {artifact.images[0] ? (
                    <img
                      src={artifact.images[0]}
                      alt={artifact.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      🏛️
                    </div>
                  )}
                  
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                      {artifact.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {compareList.length < 3 && (
            <Link
              to="/browse"
              className="min-w-[160px] max-w-[200px] aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-museum-gold hover:text-museum-gold-dark transition-all"
            >
              <div className="text-center">
                <span className="text-3xl">+</span>
                <p className="text-sm mt-1">添加更多</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-museum-dark text-white">
                <th className="py-4 px-6 text-left font-semibold w-32">属性</th>
                {compareList.map(artifact => (
                  <th key={artifact.id} className="py-4 px-6 text-center font-semibold min-w-[180px]">
                    <div className="flex items-center justify-center gap-2">
                      {artifact.images[0] && (
                        <img
                          src={artifact.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />
                      )}
                      <span className="line-clamp-1">{artifact.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Basic Info */}
              <CompareRow
                label="名称"
                values={compareList.map(a => a.nameEn || a.name)}
              />

              <CompareRow
                label="中文名"
                values={compareList.map(a => a.name)}
              />

              <CompareRow
                label="年代"
                values={compareList.map(a => a.era)}
                highlight
              />

              <CompareRow
                label="地区/文明"
                values={compareList.map(a => a.region)}
                highlight
              />

              <CompareRow
                label="类型"
                values={compareList.map(a => a.category)}
                highlight
              />

              <CompareRow
                label="材质"
                values={compareList.map(a => a.material)}
                highlight
              />

              {/* Dimensions */}
              <CompareRow
                label="高度 (cm)"
                values={compareList.map(a => a.dimensions.height)}
              />

              <CompareRow
                label="宽度 (cm)"
                values={compareList.map(a => a.dimensions.width)}
              />

              <CompareRow
                label="深度 (cm)"
                values={compareList.map(a => a.dimensions.depth)}
              />

              {/* Museum & Location */}
              <CompareRow
                label="博物馆"
                values={compareList.map(a => a.museum)}
                highlight
              />

              <CompareRow
                label="现藏地"
                values={compareList.map(a => a.location)}
              />

              {/* Description preview */}
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <td colSpan={compareList.length + 1} className="py-3 px-6">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                    详细信息
                  </h4>
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-4 px-6 font-semibold text-gray-900 bg-gray-50 align-top">
                  描述
                </td>
                {compareList.map(artifact => (
                  <td key={artifact.id} className="py-4 px-6 text-sm text-gray-700 align-top">
                    <p className="line-clamp-4">{artifact.description}</p>
                    <Link 
                      to={`/artifact/${artifact.id}`}
                      className="inline-block mt-2 text-museum-gold-dark hover:underline text-xs font-medium"
                    >
                      查看完整描述 →
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Tags */}
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900 bg-gray-50 align-top">
                  标签
                </td>
                {compareList.map(artifact => (
                  <td key={artifact.id} className="py-4 px-6 align-top">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {artifact.tags.slice(0, 5).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {artifact.tags.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{artifact.tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.print()}
          className="gap-2"
        >
          打印对比结果
        </Button>
        
        <Link to="/browse">
          <Button size="lg" className="bg-museum-gold hover:bg-museum-gold-dark gap-2">
            继续浏览
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
