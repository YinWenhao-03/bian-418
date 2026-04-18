import { useState, useEffect } from 'react'
import { Bot, TrendingUp, DollarSign, Activity, Play, Square, RefreshCw, AlertCircle } from 'lucide-react'
import PriceDisplay from './components/PriceDisplay'
import StrategyControl from './components/StrategyControl'
import TradingLogs from './components/TradingLogs'

interface BotStatus {
  running: boolean
  totalTrades: number
  winRate: number
  profit: number
}

function App() {
  const [botStatus, setBotStatus] = useState<BotStatus>({
    running: false,
    totalTrades: 0,
    winRate: 0,
    profit: 0,
  })
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/strategies')
      const strategies = await res.json()
      const activeStrategy = strategies.find((s: any) => s.status === 'active')
      setBotStatus(prev => ({
        ...prev,
        running: !!activeStrategy,
        totalTrades: prev.totalTrades,
        winRate: prev.winRate,
        profit: prev.profit,
      }))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">交易机器人监控面板</h1>
              <p className="text-sm text-gray-400">Binance Trading Bot</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`status-badge ${botStatus.running ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
              <span className={`w-2 h-2 rounded-full ${botStatus.running ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              {botStatus.running ? '运行中' : '已停止'}
            </span>
            <button onClick={fetchStatus} className="btn btn-primary flex items-center gap-2" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">总交易次数</p>
            <p className="text-2xl font-bold text-white">{botStatus.totalTrades}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">胜率</p>
            <p className="text-2xl font-bold text-green-400">{botStatus.winRate.toFixed(1)}%</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">累计收益</p>
            <p className={`text-2xl font-bold ${botStatus.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {botStatus.profit >= 0 ? '+' : ''}{botStatus.profit.toFixed(2)} USDT
            </p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${botStatus.running ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                <Play className={`w-5 h-5 ${botStatus.running ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">机器人状态</p>
            <p className={`text-2xl font-bold ${botStatus.running ? 'text-green-400' : 'text-gray-400'}`}>
              {botStatus.running ? '运行中' : '已停止'}
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        {!botStatus.running && (
          <div className="flex items-center gap-3 p-4 mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-yellow-400">交易机器人未运行，请在下方启动策略以开始交易。</p>
          </div>
        )}

        {/* Strategy Control */}
        <StrategyControl 
          isRunning={botStatus.running} 
          onStatusChange={fetchStatus} 
        />

        {/* Price Display */}
        <PriceDisplay />

        {/* Trading Logs */}
        <TradingLogs />
      </main>
    </div>
  )
}

export default App
