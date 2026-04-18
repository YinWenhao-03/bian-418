import { Router, type Request, type Response } from 'express'
import { getAllTrades, getTradeById, getTradesByStatus, getTradesBySymbol, getTradesByTimeRange } from '../services/database.js'
import type { Trade } from '../types/database.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, offset, status, symbol, startTime, endTime } = req.query
    
    let trades: Trade[]
    const parsedLimit = limit ? parseInt(limit as string) : undefined
    const parsedOffset = offset ? parseInt(offset as string) : undefined

    if (status) {
      const limitVal = parsedLimit || 100
      trades = await getTradesByStatus(status as Trade['status'], limitVal)
    } else if (symbol) {
      const limitVal = parsedLimit || 100
      trades = await getTradesBySymbol(symbol as string, limitVal)
    } else if (startTime && endTime) {
      const start = parseInt(startTime as string)
      const end = parseInt(endTime as string)
      const limitVal = parsedLimit || 100
      trades = await getTradesByTimeRange(start, end, limitVal)
    } else {
      trades = await getAllTrades(parsedLimit, parsedOffset)
    }

    res.json({
      success: true,
      data: trades,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get trades',
    })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid trade ID',
      })
      return
    }

    const trade = await getTradeById(id)

    if (!trade) {
      res.status(404).json({
        success: false,
        error: 'Trade not found',
      })
      return
    }

    res.json({
      success: true,
      data: trade,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get trade',
    })
  }
})

export default router
