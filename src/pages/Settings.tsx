import { useState } from 'react';

export default function Settings() {
  const [strategy, setStrategy] = useState({
    name: '默认策略',
    monitoring: {
      frequency: 60, // 监控频率（秒）
      priceThreshold: 3, // 价格阈值（%）
      volumeThreshold: 50, // 成交量阈值（%）
    },
    trading: {
      buyCondition: 'price_rising', // 买入条件
      sellCondition: 'price_falling', // 卖出条件
      maxPosition: 0.2, // 最大持仓比例
      singleTradeLimit: 0.1, // 单笔交易限额
    },
    riskControl: {
      stopLoss: 5, // 止损（%）
      takeProfit: 10, // 止盈（%）
      maxDrawdown: 15, // 最大回撤（%）
    },
  });

  const handleInputChange = (section: string, field: string, value: string | number) => {
    setStrategy(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('策略配置已保存:', strategy);
    // 这里可以添加保存策略的逻辑
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">策略配置</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">基本信息</h2>
          <div className="mb-4">
            <label className="block mb-2">策略名称</label>
            <input
              type="text"
              value={strategy.name}
              onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 p-2 rounded"
            />
          </div>
        </div>

        {/* 监控参数 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">监控参数</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">监控频率（秒）</label>
              <input
                type="number"
                min="1"
                max="300"
                value={strategy.monitoring.frequency}
                onChange={(e) => handleInputChange('monitoring', 'frequency', parseInt(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">价格阈值（%）</label>
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={strategy.monitoring.priceThreshold}
                onChange={(e) => handleInputChange('monitoring', 'priceThreshold', parseFloat(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">成交量阈值（%）</label>
              <input
                type="number"
                min="0.1"
                max="1000"
                step="1"
                value={strategy.monitoring.volumeThreshold}
                onChange={(e) => handleInputChange('monitoring', 'volumeThreshold', parseInt(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* 交易规则 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">交易规则</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">买入条件</label>
              <select
                value={strategy.trading.buyCondition}
                onChange={(e) => handleInputChange('trading', 'buyCondition', e.target.value)}
                className="w-full bg-gray-700 p-2 rounded"
              >
                <option value="price_rising">价格上涨</option>
                <option value="volume_increase">成交量增加</option>
                <option value="plaza_sentiment">广场情绪积极</option>
                <option value="gainer_top">涨幅榜前10</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">卖出条件</label>
              <select
                value={strategy.trading.sellCondition}
                onChange={(e) => handleInputChange('trading', 'sellCondition', e.target.value)}
                className="w-full bg-gray-700 p-2 rounded"
              >
                <option value="price_falling">价格下跌</option>
                <option value="stop_loss">触发止损</option>
                <option value="take_profit">触发止盈</option>
                <option value="plaza_sentiment">广场情绪消极</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">最大持仓比例</label>
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={strategy.trading.maxPosition}
                onChange={(e) => handleInputChange('trading', 'maxPosition', parseFloat(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">单笔交易限额</label>
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={strategy.trading.singleTradeLimit}
                onChange={(e) => handleInputChange('trading', 'singleTradeLimit', parseFloat(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* 风险控制 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">风险控制</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">止损（%）</label>
              <input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={strategy.riskControl.stopLoss}
                onChange={(e) => handleInputChange('riskControl', 'stopLoss', parseFloat(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">止盈（%）</label>
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={strategy.riskControl.takeProfit}
                onChange={(e) => handleInputChange('riskControl', 'takeProfit', parseFloat(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">最大回撤（%）</label>
              <input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={strategy.riskControl.maxDrawdown}
                onChange={(e) => handleInputChange('riskControl', 'maxDrawdown', parseFloat(e.target.value))}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* API密钥配置 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API密钥配置</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">API Key</label>
              <input
                type="text"
                placeholder="输入币安API Key"
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Secret Key</label>
              <input
                type="password"
                placeholder="输入币安Secret Key"
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div className="text-sm text-gray-400">
              请确保API密钥具有交易权限，并开启IP白名单以提高安全性。
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            保存策略
          </button>
        </div>
      </form>
    </div>
  );
}