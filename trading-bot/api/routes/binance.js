import express from 'express'
import Binance from 'binance-api-node'
import axios from 'axios'

// 修复Binance导入
const { default: binance } = Binance

const router = express.Router()

// 初始化币安API客户端
const binanceClient = binance({
  apiKey: process.env.BINANCE_API_KEY || '',
  apiSecret: process.env.BINANCE_API_SECRET || '',
})

// 获取实时价格
router.get('/price', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT' } = req.query
    const price = await binanceClient.prices({
      symbol: symbol,
    })
    res.json({ price })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get price' })
  }
})

// 获取涨幅榜数据
router.get('/gainers', async (req, res) => {
  try {
    const exchangeInfo = await binanceClient.exchangeInfo()
    const symbols = exchangeInfo.symbols
      .filter((symbol) => symbol.quoteAsset === 'USDT' && symbol.status === 'TRADING')
      .map((symbol) => symbol.symbol)

    const tickers = await binanceClient.ticker24hr()
    const usdtTickers = tickers
      .filter((ticker) => ticker.symbol.endsWith('USDT'))
      .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 20)

    res.json(usdtTickers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get gainers' })
  }
})

// 模拟币安广场数据（实际项目中需要爬取）
router.get('/plaza', async (req, res) => {
  try {
    // 这里模拟币安广场数据，实际项目中需要爬取
    const plazaData = [
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
      {
        id: 3,
        content: '市场波动较大，投资者需谨慎操作',
        sentiment: 'neutral',
        热度: 75,
        timestamp: new Date().toISOString(),
      },
    ]
    res.json(plazaData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plaza data' })
  }
})

export default router