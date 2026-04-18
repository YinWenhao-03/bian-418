import { useEffect, useState } from 'react';

interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export default function Gainers() {
  const [gainers, setGainers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState<number>(5); // 涨幅阈值

  useEffect(() => {
    // 获取涨幅榜数据
    fetch('/api/binance/gainers')
      .then(response => response.json())
      .then((data: TickerData[]) => {
        setGainers(data);
        setLoading(false);
      });
  }, []);

  const filteredGainers = gainers.filter(ticker => 
    parseFloat(ticker.priceChangePercent) >= threshold
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">涨幅榜监控</h1>
      
      {/* 筛选设置 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <label className="text-lg font-semibold">涨幅阈值：</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="bg-gray-700 p-2 rounded w-24"
          />
          <span className="text-gray-400">%</span>
        </div>
      </div>

      {/* 涨幅榜 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">24小时涨幅榜</h2>
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">排名</th>
                  <th className="text-left py-2">币种</th>
                  <th className="text-right py-2">价格</th>
                  <th className="text-right py-2">涨跌幅</th>
                  <th className="text-right py-2">成交量</th>
                  <th className="text-right py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredGainers.map((ticker, index) => (
                  <tr key={ticker.symbol} className="border-b border-gray-700">
                    <td className="py-2 font-semibold">{index + 1}</td>
                    <td className="py-2">{ticker.symbol}</td>
                    <td className="text-right py-2">${parseFloat(ticker.lastPrice).toLocaleString()}</td>
                    <td className={`text-right py-2 ${parseFloat(ticker.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(ticker.priceChangePercent).toFixed(2)}%
                    </td>
                    <td className="text-right py-2">{parseFloat(ticker.volume).toLocaleString()}</td>
                    <td className="text-right py-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        交易
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 交易信号 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">交易信号</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <div className="font-semibold">买入信号：BTCUSDT</div>
            <div className="text-sm text-gray-400">理由：价格上涨超过5%，成交量增加30%</div>
            <div className="text-sm text-gray-400">时间：2024-01-01 10:00</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <div className="font-semibold">买入信号：ETHUSDT</div>
            <div className="text-sm text-gray-400">理由：价格上涨超过3%，广场情绪积极</div>
            <div className="text-sm text-gray-400">时间：2024-01-01 11:30</div>
          </div>
        </div>
      </div>
    </div>
  );
}