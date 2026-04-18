import Binance from 'binance-api-node';

// 修复Binance导入
const { default: binance } = Binance;

class TradingService {
  constructor(apiKey, apiSecret) {
    this.binanceClient = binance({
      apiKey: apiKey || process.env.BINANCE_API_KEY,
      apiSecret: apiSecret || process.env.BINANCE_API_SECRET,
    });
    this.strategies = [];
    this.isRunning = false;
  }

  // 添加策略
  addStrategy(strategy) {
    this.strategies.push(strategy);
  }

  // 启动交易服务
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.monitorMarket();
  }

  // 停止交易服务
  stop() {
    this.isRunning = false;
  }

  // 监控市场
  async monitorMarket() {
    while (this.isRunning) {
      try {
        // 获取市场数据
        const [gainers, plazaData, prices] = await Promise.all([
          this.getGainers(),
          this.getPlazaData(),
          this.getPrices(),
        ]);

        // 执行策略
        for (const strategy of this.strategies) {
          await this.executeStrategy(strategy, { gainers, plazaData, prices });
        }

        // 等待监控频率
        await new Promise(resolve => setTimeout(resolve, 60000)); // 默认1分钟
      } catch (error) {
        console.error('监控市场错误:', error);
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }

  // 获取涨幅榜数据
  async getGainers() {
    const tickers = await this.binanceClient.ticker24hr();
    return tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 20);
  }

  // 获取币安广场数据（模拟）
  async getPlazaData() {
    // 实际项目中需要爬取币安广场数据
    return [
      {
        id: 1,
        content: '比特币突破60000美元，市场情绪高涨',
        sentiment: 'positive',
        热度: 95,
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        content: '以太坊2.0升级即将完成，生态系统将更加完善',
        sentiment: 'positive',
        热度: 88,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // 获取主要币种价格
  async getPrices() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
    const prices = {};
    for (const symbol of symbols) {
      const priceData = await this.binanceClient.prices({ symbol });
      prices[symbol] = priceData[symbol];
    }
    return prices;
  }

  // 执行策略
  async executeStrategy(strategy, marketData) {
    const { gainers, plazaData, prices } = marketData;

    // 检查买入条件
    if (await this.checkBuyCondition(strategy, marketData)) {
      await this.executeBuy(strategy, marketData);
    }

    // 检查卖出条件
    if (await this.checkSellCondition(strategy, marketData)) {
      await this.executeSell(strategy, marketData);
    }
  }

  // 检查买入条件
  async checkBuyCondition(strategy, marketData) {
    const { trading } = strategy;
    const { gainers, plazaData, prices } = marketData;

    switch (trading.buyCondition) {
      case 'price_rising':
        // 检查价格上涨
        return gainers.some(ticker => parseFloat(ticker.priceChangePercent) > strategy.monitoring.priceThreshold);
      
      case 'volume_increase':
        // 检查成交量增加
        return gainers.some(ticker => parseFloat(ticker.volume) > 1000000);
      
      case 'plaza_sentiment':
        // 检查广场情绪
        return plazaData.some(item => item.sentiment === 'positive' && item.热度 > 80);
      
      case 'gainer_top':
        // 检查是否在涨幅榜前10
        return gainers.slice(0, 10).length > 0;
      
      default:
        return false;
    }
  }

  // 检查卖出条件
  async checkSellCondition(strategy, marketData) {
    const { trading, riskControl } = strategy;
    const { prices } = marketData;

    // 这里简化处理，实际项目中需要检查持仓和止损止盈条件
    return false;
  }

  // 执行买入操作
  async executeBuy(strategy, marketData) {
    try {
      // 获取涨幅榜第一的币种
      const topGainer = marketData.gainers[0];
      if (!topGainer) return;

      // 计算买入数量（简化处理）
      const quantity = 0.001; // 固定数量

      // 执行买入
      const order = await this.binanceClient.order({
        symbol: topGainer.symbol,
        side: 'BUY',
        type: 'MARKET',
        quantity: quantity,
      });

      console.log('买入成功:', order);
      return order;
    } catch (error) {
      console.error('买入失败:', error);
      throw error;
    }
  }

  // 执行卖出操作
  async executeSell(strategy, marketData) {
    try {
      // 实际项目中需要检查持仓并执行卖出
      console.log('执行卖出操作');
    } catch (error) {
      console.error('卖出失败:', error);
      throw error;
    }
  }
}

export default TradingService;