import { useEffect, useState, useCallback } from 'react';

interface BotStatus {
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  tradeCount: number;
  startTime: string;
}

export default function RobotMonitor() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}天 ${hours}小时 ${minutes}分钟 ${secs}秒`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'stopped':
        return '已停止';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/bot/status');
      if (!response.ok) throw new Error('获取状态失败');
      const data = await response.json();
      setBotStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取状态失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (action: 'start' | 'stop' | 'reset') => {
    try {
      const response = await fetch(`/api/bot/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`${action}操作失败`);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">机器人监控</h1>
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">机器人监控</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* 状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">当前状态</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(botStatus?.status || 'stopped')}`}></div>
            <span className="text-2xl font-bold">{getStatusText(botStatus?.status || 'stopped')}</span>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">运行时间</h2>
          <div className="text-2xl font-bold">
            {botStatus ? formatUptime(botStatus.uptime) : '0秒'}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">已执行交易</h2>
          <div className="text-2xl font-bold text-blue-400">
            {botStatus?.tradeCount || 0} 笔
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">启动时间</h2>
          <div className="text-lg font-medium">
            {botStatus?.startTime ? new Date(botStatus.startTime).toLocaleString('zh-CN') : '未启动'}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">控制操作</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleAction('start')}
            disabled={botStatus?.status === 'running'}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            启动机器人
          </button>
          <button
            onClick={() => handleAction('stop')}
            disabled={botStatus?.status !== 'running'}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            停止机器人
          </button>
          <button
            onClick={() => handleAction('reset')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            重置机器人
          </button>
        </div>
      </div>
    </div>
  );
}
