import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface TickerData {
  symbol: string
  lastPrice: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
}

function PriceDisplay() {
  const [prices, setPrices] = useState<TickerData[]>([])
  const [gainers, setGainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    try {
      const [priceRes, gainersRes] = await Promise.all([
        fetch('/api/binance/price'),
        fetch('/api/binance/gainers')
      ])
      const priceData = await priceRes.json()
      const gainersData = await gainersRes.json()
      setGainers(gainersData.slice(0, 10))
      
      const mainSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
      const mainPrices: TickerData[] = gainersData
        .filter((t: any) => mainSymbols.includes(t.symbol))
        .map((t: any) => ({
          symbol: t.symbol,
          lastPrice: parseFloat(t.lastPrice).toFixed(2),
          priceChangePercent: parseFloat(t.priceChangePercent).toFixed(2),
          highPrice: parseFloat(t.highPrice).toFixed(2),
          lowPrice: parseFloat(t.lowPrice).toFixed(2),
          volume: parseFloat(t.volume).toFixed(2),
        }))
      setPrices(mainPrices)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSymbolDisplay = (symbol: string) => {
    const names: Record<string, string> = {
      BTCUSDT: 'BTC/USDT',
      ETHUSDT: 'ETH/USDT',
      BNBUSDT: 'BNB/USDT',
      SOLUSDT: 'SOL/USDT',
    }
    return names[symbol] || symbol.replace('USDT', '/USDT')
  }

  if (loading) {
    return (
      <div className="card mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-32"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">实时价格</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {prices.map((price) => (
          <div key={price.symbol} className="p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">{getSymbolDisplay(price.symbol)}</p>
            <p className="text-xl font-bold text-white mb-2">{price.lastPrice}</p>
            <div className={`flex items-center gap-1 text-sm ${parseFloat(price.priceChangePercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(price.priceChangePercent) >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {Math.abs(parseFloat(price.priceChangePercent)).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-md font-semibold text-white mb-3">涨幅榜 Top 10</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2 px-3">#</th>
              <th className="text-left py-2 px-3">交易对</th>
              <th className="text-right py-2 px-3">最新价</th>
              <th className="text-right py-2 px-3">涨幅</th>
              <th className="text-right py-2 px-3">成交量</th>
            </tr>
          </thead>
          <tbody>
            {gainers.map((gainer, index) => (
              <tr key={gainer.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-2 px-3 text-gray-500">{index + 1}</td>
                <td className="py-2 px-3 font-medium text-white">{gainer.symbol.replace('USDT', '/USDT')}</td>
                <td className="py-2 px-3 text-right text-white">
                  {parseFloat(gainer.lastPrice).toFixed(gainer.lastPrice.includes('.') ? Math.min(4, gainer.lastPrice.split('.')[1]?.length || 2) : 2)}
                </td>
                <td className="py-2 px-3 text-right text-green-400">+{parseFloat(gainer.priceChangePercent).toFixed(2)}%</td>
                <td className="py-2 px-3 text-right text-gray-400">
                  {parseFloat(gainer.volume).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PriceDisplay
