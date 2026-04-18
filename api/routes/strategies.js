import express from 'express';
import TradingService from '../services/trading.js';

const router = express.Router();

// 存储交易服务实例
let tradingService = null;
let strategyStatus = 'inactive';

// 获取策略列表
router.get('/', (req, res) => {
  const strategies = [
    {
      id: 1,
      name: '默认策略',
      status: strategyStatus,
      created_at: new Date().toISOString(),
    },
  ];
  res.json(strategies);
});

// 启动策略
router.post('/:id/start', (req, res) => {
  const { id } = req.params;
  
  if (!tradingService) {
    tradingService = new TradingService();
  }

  const strategy = {
    id: id,
    name: '默认策略',
    monitoring: {
      frequency: 60,
      priceThreshold: 3,
      volumeThreshold: 50,
    },
    trading: {
      buyCondition: 'price_rising',
      sellCondition: 'price_falling',
      maxPosition: 0.2,
      singleTradeLimit: 0.1,
    },
    riskControl: {
      stopLoss: 5,
      takeProfit: 10,
      maxDrawdown: 15,
    },
  };

  tradingService.addStrategy(strategy);
  tradingService.start();
  strategyStatus = 'active';

  console.log('启动策略:', id);
  res.json({ success: true, message: '策略已启动' });
});

// 停止策略
router.post('/:id/stop', (req, res) => {
  const { id } = req.params;
  
  if (tradingService) {
    tradingService.stop();
  }
  strategyStatus = 'inactive';

  console.log('停止策略:', id);
  res.json({ success: true, message: '策略已停止' });
});

export default router;
export { tradingService, strategyStatus };