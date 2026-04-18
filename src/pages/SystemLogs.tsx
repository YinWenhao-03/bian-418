import { useEffect, useState } from 'react';

interface Log {
  id: string;
  time: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  source: string;
  message: string;
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error('获取系统日志失败');
      const data = await response.json();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取系统日志失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = !levelFilter || log.level === levelFilter;
    const matchesSource = !sourceFilter || log.source === sourceFilter;
    return matchesLevel && matchesSource;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const uniqueSources = [...new Set(logs.map(l => l.source))];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'text-gray-400';
      case 'info':
        return 'text-blue-400';
      case 'warn':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'fatal':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'debug':
        return 'bg-gray-600';
      case 'info':
        return 'bg-blue-600';
      case 'warn':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      case 'fatal':
        return 'bg-red-800';
      default:
        return 'bg-gray-600';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'debug':
        return '调试';
      case 'info':
        return '信息';
      case 'warn':
        return '警告';
      case 'error':
        return '错误';
      case 'fatal':
        return '致命';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">系统日志</h1>
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">系统日志</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* 筛选器 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">级别筛选</label>
            <select
              value={levelFilter}
              onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">全部</option>
              <option value="debug">调试</option>
              <option value="info">信息</option>
              <option value="warn">警告</option>
              <option value="error">错误</option>
              <option value="fatal">致命</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">来源筛选</label>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">全部</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-3">
        {currentLogs.map((log) => (
          <div key={log.id} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-gray-400 text-sm">{new Date(log.time).toLocaleString('zh-CN')}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getLevelBg(log.level)}`}>
                {getLevelText(log.level)}
              </span>
              <span className="text-gray-500 text-sm">来源: {log.source}</span>
            </div>
            <p className={`${getLevelColor(log.level)}`}>{log.message}</p>
          </div>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded"
          >
            上一页
          </button>
          <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
