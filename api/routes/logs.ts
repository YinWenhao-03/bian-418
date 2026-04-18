import { Router, type Request, type Response } from 'express'
import { getAllLogs, getLogsByLevel, getLogsBySource, getLogsByTimeRange, deleteOldLogs } from '../services/database.js'
import type { Log } from '../types/database.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, offset, level, source, startTime, endTime } = req.query
    
    let logs: Log[]
    const parsedLimit = limit ? parseInt(limit as string) : undefined
    const parsedOffset = offset ? parseInt(offset as string) : undefined

    if (level) {
      const limitVal = parsedLimit || 100
      logs = await getLogsByLevel(level as Log['level'], limitVal)
    } else if (source) {
      const limitVal = parsedLimit || 100
      logs = await getLogsBySource(source as string, limitVal)
    } else if (startTime && endTime) {
      const start = parseInt(startTime as string)
      const end = parseInt(endTime as string)
      const limitVal = parsedLimit || 100
      logs = await getLogsByTimeRange(start, end, limitVal)
    } else {
      logs = await getAllLogs(parsedLimit, parsedOffset)
    }

    res.json({
      success: true,
      data: logs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get logs',
    })
  }
})

router.delete('/old', async (req: Request, res: Response): Promise<void> => {
  try {
    const { beforeTime } = req.query
    
    if (!beforeTime) {
      res.status(400).json({
        success: false,
        error: 'beforeTime parameter is required',
      })
      return
    }

    const time = parseInt(beforeTime as string)
    if (isNaN(time)) {
      res.status(400).json({
        success: false,
        error: 'Invalid beforeTime format',
      })
      return
    }

    await deleteOldLogs(time)
    res.json({
      success: true,
      data: { message: 'Old logs deleted successfully' },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete old logs',
    })
  }
})

export default router
