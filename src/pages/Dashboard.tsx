import { useEffect, useState } from 'react';

interface PriceData {
  price: Record<string, string>;
}

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

export default function Dashboard() {
  const [btcPrice, setBtcPrice] = useState<string>('0');
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [gainers, setGainers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取BTC价格
    fetch('/api/binance/price?symbol=BTCUSDT')
      .then(response => response.json())
      .then((data: PriceData) => {
        setBtcPrice(data.price.BTCUSDT);
      });

    // 获取ETH价格
    fetch('/api/binance/price?symbol=ETHUSDT')
      .then(response => response.json())
      .then((data: PriceData) => {
        setEthPrice(data.price.ETHUSDT);
      });

    // 获取涨幅榜
    fetch('/api/binance/gainers')
      .then(response => response.json())
      .then((data: TickerData[]) => {
        setGainers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">仪表盘</h1>
      
      {/* 市场概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">比特币 (BTC)</h2>
          <div className="text-2xl font-bold">${parseFloat(btcPrice).toLocaleString()}</div>
          <div className="text-green-500">+2.5%</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">以太坊 (ETH)</h2>
          <div className="text-2xl font-bold">${parseFloat(ethPrice).toLocaleString()}</div>
          <div className="text-green-500">+1.8%</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">市场情绪</h2>
          <div className="text-2xl font-bold">看涨</div>
          <div className="text-yellow-500">中性偏多</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">策略状态</h2>
          <div className="text-2xl font-bold">运行中</div>
          <div className="text-green-500">已执行 12 笔交易</div>
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
                  <th className="text-left py-2">币种</th>
                  <th className="text-right py-2">价格</th>
                  <th className="text-right py-2">涨跌幅</th>
                  <th className="text-right py-2">成交量</th>
                </tr>
              </thead>
              <tbody>
                {gainers.map((ticker) => (
                  <tr key={ticker.symbol} className="border-b border-gray-700">
                    <td className="py-2">{ticker.symbol}</td>
                    <td className="text-right py-2">${parseFloat(ticker.lastPrice).toLocaleString()}</td>
                    <td className={`text-right py-2 ${parseFloat(ticker.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(ticker.priceChangePercent).toFixed(2)}%
                    </td>
                    <td className="text-right py-2">{parseFloat(ticker.volume).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 交易历史 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">交易历史</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">时间</th>
                <th className="text-left py-2">币种</th>
                <th className="text-left py-2">方向</th>
                <th className="text-right py-2">价格</th>
                <th className="text-right py-2">数量</th>
                <th className="text-right py-2">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2">2024-01-01 10:00</td>
                <td className="py-2">BTCUSDT</td>
                <td className="py-2 text-green-500">买入</td>
                <td className="text-right py-2">59800.00</td>
                <td className="text-right py-2">0.01</td>
                <td className="text-right py-2 text-green-500">成功</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2">2024-01-01 11:30</td>
                <td className="py-2">ETHUSDT</td>
                <td className="py-2 text-green-500">买入</td>
                <td className="text-right py-2">3200.00</td>
                <td className="text-right py-2">0.1</td>
                <td className="text-right py-2 text-green-500">成功</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}