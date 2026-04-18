import { useState } from 'react'
import { Play, Square, Settings } from 'lucide-react'

interface StrategyControlProps {
  isRunning: boolean
  onStatusChange: () => void
}

function StrategyControl({ isRunning, onStatusChange }: StrategyControlProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleToggle = async () => {
    setLoading(true)
    setMessage('')
    try {
      const strategyId = '1'
      const url = isRunning ? `/api/strategies/${strategyId}/stop` : `/api/strategies/${strategyId}/start`
      const method = isRunning ? 'POST' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      setMessage(data.message || (isRunning ? '策略已停止' : '策略已启动'))
      onStatusChange()
    } catch {
      setMessage(isRunning ? '停止失败' : '启动失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Settings className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">策略控制</h2>
            <p className="text-sm text-gray-400">默认策略 - 涨幅榜自动交易</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`btn flex items-center gap-2 ${
            isRunning ? 'btn-danger' : 'btn-success'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span>处理中...</span>
          ) : isRunning ? (
            <>
              <Square className="w-4 h-4" />
              停止策略
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              启动策略
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('失败') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">策略说明</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• 买入条件：价格涨幅超过 3% 或币安广场情绪积极</li>
          <li>• 卖出条件：价格下跌或达到止损/止盈线</li>
          <li>• 风控：止损 5%，止盈 10%，最大回撤 15%</li>
          <li>• 监控频率：每 1 分钟检查一次市场数据</li>
        </ul>
      </div>
    </div>
  )
}

export default StrategyControl
