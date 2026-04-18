function TradingLogs() {
  const logs = [
    {
      id: 1,
      time: '2026-04-18 15:30:00',
      type: 'info',
      message: '交易机器人启动成功',
    },
    {
      id: 2,
      time: '2026-04-18 15:31:00',
      type: 'info',
      message: '正在监控市场数据...',
    },
  ]

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-white mb-4">运行日志</h2>
      <div className="bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 py-1 border-b border-gray-800/30 last:border-0">
            <span className="text-gray-500 flex-shrink-0">{log.time}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              log.type === 'success' ? 'bg-green-500/20 text-green-400' :
              log.type === 'error' ? 'bg-red-500/20 text-red-400' :
              log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {log.type}
            </span>
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TradingLogs
