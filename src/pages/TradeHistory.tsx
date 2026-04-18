import { useEffect, useState } from 'react';

interface Trade {
  id: string;
  time: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: string;
  amount: string;
  status: 'success' | 'pending' | 'failed';
  profit: string;
}

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [symbolFilter, setSymbolFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades');
      if (!response.ok) throw new Error('获取交易历史失败');
      const data = await response.json();
      setTrades(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取交易历史失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const filteredTrades = trades.filter(trade => {
    const matchesStatus = !statusFilter || trade.status === statusFilter;
    const matchesSymbol = !symbolFilter || trade.symbol === symbolFilter;
    return matchesStatus && matchesSymbol;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrades = filteredTrades.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);

  const uniqueSymbols = [...new Set(trades.map(t => t.symbol))];

  const getSideText = (side: string) => side === 'buy' ? '买入' : '卖出';
  const getSideColor = (side: string) => side === 'buy' ? 'text-green-500' : 'text-red-500';

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'pending':
        return '待处理';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getProfitColor = (profit: string) => {
    const num = parseFloat(profit);
    return num > 0 ? 'text-green-500' : num < 0 ? 'text-red-500' : 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">交易历史</h1>
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">交易历史</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* 筛选器 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">状态筛选</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">全部</option>
              <option value="success">成功</option>
              <option value="pending">待处理</option>
              <option value="failed">失败</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">币种筛选</label>
            <select
              value={symbolFilter}
              onChange={(e) => { setSymbolFilter(e.target.value); setCurrentPage(1); }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">全部</option>
              {uniqueSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 交易历史表格 */}
      <div className="bg-gray-800 p-4 rounded-lg">
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
                <th className="text-right py-2">盈亏</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-700">
                  <td className="py-2">{new Date(trade.time).toLocaleString('zh-CN')}</td>
                  <td className="py-2">{trade.symbol}</td>
                  <td className={`py-2 ${getSideColor(trade.side)}`}>{getSideText(trade.side)}</td>
                  <td className="text-right py-2">{parseFloat(trade.price).toLocaleString()}</td>
                  <td className="text-right py-2">{parseFloat(trade.amount).toLocaleString()}</td>
                  <td className={`text-right py-2 ${getStatusColor(trade.status)}`}>{getStatusText(trade.status)}</td>
                  <td className={`text-right py-2 ${getProfitColor(trade.profit)}`}>
                    {parseFloat(trade.profit) > 0 ? '+' : ''}{parseFloat(trade.profit).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
