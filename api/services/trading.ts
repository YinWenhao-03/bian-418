import Binance from 'binance-api-node';
import { insertTrade, insertLog, updateBotStatus, incrementTradeCount } from './database.js';
import type { NewTrade, NewLog } from '../types/database.js';

const binance = Binance;

interface Strategy {
  trading: {
    buyCondition: string;
  };
  monitoring: {
    priceThreshold: number;
  };
  riskControl: any;
}

interface MarketData {
  gainers: any[];
  plazaData: any[];
  prices: Record<string, string>;
}

class TradingService {
  binanceClient: any;
  strategies: Strategy[];
  isRunning: boolean;

  constructor(apiKey?: string, apiSecret?: string) {
    this.binanceClient = binance({
      apiKey: apiKey || process.env.BINANCE_API_KEY,
      apiSecret: apiSecret || process.env.BINANCE_API_SECRET,
    });
    this.strategies = [];
    this.isRunning = false;
  }

  addStrategy(strategy: Strategy) {
    this.strategies.push(strategy);
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const now = Date.now();
    await updateBotStatus({ status: 'running', started_at: now });
    await insertLog({
      level: 'info',
      message: '交易机器人已启动',
      timestamp: now,
      source: 'TradingService'
    });
    this.monitorMarket();
  }

  async stop() {
    this.isRunning = false;
    const now = Date.now();
    await updateBotStatus({ status: 'stopped' });
    await insertLog({
      level: 'info',
      message: '交易机器人已停止',
      timestamp: now,
      source: 'TradingService'
    });
  }

  async monitorMarket() {
    while (this.isRunning) {
      try {
        await insertLog({
          level: 'debug',
          message: '开始监控市场数据',
          timestamp: Date.now(),
          source: 'TradingService'
        });

        const [gainers, plazaData, prices] = await Promise.all([
          this.getGainers(),
          this.getPlazaData(),
          this.getPrices(),
        ]);

        await insertLog({
          level: 'debug',
          message: '获取市场数据成功',
          timestamp: Date.now(),
          source: 'TradingService',
          metadata: JSON.stringify({ gainersCount: gainers.length })
        });

        for (const strategy of this.strategies) {
          await this.executeStrategy(strategy, { gainers, plazaData, prices });
        }

        await new Promise(resolve => setTimeout(resolve, 60000));
      } catch (error) {
        const err = error as Error;
        console.error('监控市场错误:', err);
        await insertLog({
          level: 'error',
          message: '监控市场时发生错误',
          timestamp: Date.now(),
          source: 'TradingService',
          metadata: JSON.stringify({ error: err.message, stack: err.stack })
        });
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }

  async getGainers() {
    const tickers = await this.binanceClient.ticker24hr();
    return tickers
      .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
      .sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 20);
  }

  async getPlazaData() {
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

  async getPrices() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
    const prices: Record<string, string> = {};
    for (const symbol of symbols) {
      const priceData = await this.binanceClient.prices({ symbol });
      prices[symbol] = priceData[symbol];
    }
    return prices;
  }

  async executeStrategy(strategy: Strategy, marketData: MarketData) {
    const { gainers, plazaData, prices } = marketData;

    await insertLog({
      level: 'debug',
      message: '执行交易策略',
      timestamp: Date.now(),
      source: 'TradingService'
    });

    if (await this.checkBuyCondition(strategy, marketData)) {
      await this.executeBuy(strategy, marketData);
    }

    if (await this.checkSellCondition(strategy, marketData)) {
      await this.executeSell(strategy, marketData);
    }
  }

  async checkBuyCondition(strategy: Strategy, marketData: MarketData) {
    const { trading } = strategy;
    const { gainers, plazaData, prices } = marketData;

    switch (trading.buyCondition) {
      case 'price_rising':
        return gainers.some(ticker => parseFloat(ticker.priceChangePercent) > strategy.monitoring.priceThreshold);
      
      case 'volume_increase':
        return gainers.some(ticker => parseFloat(ticker.volume) > 1000000);
      
      case 'plaza_sentiment':
        return plazaData.some(item => item.sentiment === 'positive' && item.热度 > 80);
      
      case 'gainer_top':
        return gainers.slice(0, 10).length > 0;
      
      default:
        return false;
    }
  }

  async checkSellCondition(strategy: Strategy, marketData: MarketData) {
    const { trading, riskControl } = strategy;
    const { prices } = marketData;

    return false;
  }

  async executeBuy(strategy: Strategy, marketData: MarketData) {
    try {
      const topGainer = marketData.gainers[0];
      if (!topGainer) return;

      await insertLog({
        level: 'info',
        message: `准备买入 ${topGainer.symbol}`,
        timestamp: Date.now(),
        source: 'TradingService',
        metadata: JSON.stringify({ symbol: topGainer.symbol, price: topGainer.lastPrice })
      });

      const quantity = 0.001;

      const order = await this.binanceClient.order({
        symbol: topGainer.symbol,
        side: 'BUY',
        type: 'MARKET',
        quantity: quantity,
      });

      console.log('买入成功:', order);

      const now = Date.now();
      await insertTrade({
        symbol: topGainer.symbol,
        side: 'buy',
        price: parseFloat(topGainer.lastPrice || '0'),
        quantity: quantity,
        timestamp: now,
        status: 'completed',
        order_id: order.orderId?.toString() || undefined
      });

      await incrementTradeCount();

      await insertLog({
        level: 'info',
        message: `成功买入 ${topGainer.symbol}`,
        timestamp: now,
        source: 'TradingService',
        metadata: JSON.stringify({
          symbol: topGainer.symbol,
          quantity,
          price: topGainer.lastPrice,
          orderId: order.orderId
        })
      });

      return order;
    } catch (error) {
      const err = error as Error;
      console.error('买入失败:', err);
      await insertLog({
        level: 'error',
        message: '买入操作失败',
        timestamp: Date.now(),
        source: 'TradingService',
        metadata: JSON.stringify({ error: err.message })
      });
      throw error;
    }
  }

  async executeSell(strategy: Strategy, marketData: MarketData) {
    try {
      await insertLog({
        level: 'info',
        message: '执行卖出操作',
        timestamp: Date.now(),
        source: 'TradingService'
      });
      console.log('执行卖出操作');
    } catch (error) {
      const err = error as Error;
      console.error('卖出失败:', err);
      await insertLog({
        level: 'error',
        message: '卖出操作失败',
        timestamp: Date.now(),
        source: 'TradingService',
        metadata: JSON.stringify({ error: err.message })
      });
      throw error;
    }
  }
}

export default TradingService;
