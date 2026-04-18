import express from 'express';
import TradingService from '../services/trading.js';

const router = express.Router();

// 存储交易服务实例
let tradingService = null;

// 创建新策略
router.post('/', (req, res) => {
  const strategy = req.body;
  // 这里可以添加策略验证和保存逻辑
  console.log('创建新策略:', strategy);
  res.json({ success: true, strategy });
});

// 获取策略列表
router.get('/', (req, res) => {
  // 这里可以从数据库获取策略列表
  const strategies = [
    {
      id: 1,
      name: '默认策略',
      status: 'inactive',
      created_at: new Date().toISOString(),
    },
  ];
  res.json(strategies);
});

// 更新策略
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const strategy = req.body;
  console.log('更新策略:', id, strategy);
  res.json({ success: true, strategy });
});

// 删除策略
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log('删除策略:', id);
  res.json({ success: true });
});

// 启动策略
router.post('/:id/start', (req, res) => {
  const { id } = req.params;
  
  // 初始化交易服务
  if (!tradingService) {
    tradingService = new TradingService();
  }

  // 添加策略（这里简化处理，实际项目中需要从数据库获取策略）
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

  console.log('启动策略:', id);
  res.json({ success: true, message: '策略已启动' });
});

// 停止策略
router.post('/:id/stop', (req, res) => {
  const { id } = req.params;
  
  if (tradingService) {
    tradingService.stop();
  }

  console.log('停止策略:', id);
  res.json({ success: true, message: '策略已停止' });
});

export default router;