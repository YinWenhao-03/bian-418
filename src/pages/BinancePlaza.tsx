import { useEffect, useState } from 'react';

interface PlazaItem {
  id: number;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  热度: number;
  timestamp: string;
}

export default function BinancePlaza() {
  const [plazaData, setPlazaData] = useState<PlazaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取币安广场数据
    fetch('/api/binance/plaza')
      .then(response => response.json())
      .then((data: PlazaItem[]) => {
        setPlazaData(data);
        setLoading(false);
      });
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '积极';
      case 'negative':
        return '消极';
      default:
        return '中性';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">币安广场监控</h1>
      
      {/* 情绪分析概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">积极情绪</h2>
          <div className="text-2xl font-bold text-green-500">65%</div>
          <div className="text-sm text-gray-400">较昨日 +5%</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">中性情绪</h2>
          <div className="text-2xl font-bold text-yellow-500">25%</div>
          <div className="text-sm text-gray-400">较昨日 -2%</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">消极情绪</h2>
          <div className="text-2xl font-bold text-red-500">10%</div>
          <div className="text-sm text-gray-400">较昨日 -3%</div>
        </div>
      </div>

      {/* 热门讨论 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">热门讨论</h2>
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="space-y-4">
            {plazaData.map((item) => (
              <div key={item.id} className="border-b border-gray-700 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="mb-2">{item.content}</p>
                    <div className="flex items-center space-x-4">
                      <span className={`${getSentimentColor(item.sentiment)}`}>
                        {getSentimentText(item.sentiment)}
                      </span>
                      <span className="text-gray-400">
                        热度: {item.热度}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 情绪趋势 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">情绪趋势</h2>
        <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-gray-400">情绪趋势图表</div>
        </div>
      </div>
    </div>
  );
}