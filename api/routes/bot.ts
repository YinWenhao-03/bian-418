import { Router, type Request, type Response } from 'express'
import { getBotStatus, updateBotStatus, resetBotStatus } from '../services/database.js'

const router = Router()

router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await getBotStatus()
    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Bot status not found',
      })
      return
    }
    res.json({
      success: true,
      data: status,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get bot status',
    })
  }
})

router.post('/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now()
    await updateBotStatus({
      status: 'running',
      started_at: now,
    })
    const status = await getBotStatus()
    res.json({
      success: true,
      data: status,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start bot',
    })
  }
})

router.post('/stop', async (req: Request, res: Response): Promise<void> => {
  try {
    await updateBotStatus({
      status: 'stopped',
    })
    const status = await getBotStatus()
    res.json({
      success: true,
      data: status,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop bot',
    })
  }
})

router.post('/reset', async (req: Request, res: Response): Promise<void> => {
  try {
    await resetBotStatus()
    const status = await getBotStatus()
    res.json({
      success: true,
      data: status,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset bot',
    })
  }
})

export default router
