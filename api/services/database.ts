import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import type { NewTrade, NewLog, NewBotStatus, Trade, Log, BotStatus } from '../types/database.js';

dotenv.config();

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'trading_bot',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: any;

try {
  pool = mysql.createPool(dbConfig);
  await initializeTables();
} catch (error) {
  console.error('Failed to initialize database:', error);
  throw error;
}

async function initializeTables() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        side ENUM('buy', 'sell') NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        quantity DECIMAL(20, 8) NOT NULL,
        timestamp BIGINT NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
        profit_loss DECIMAL(20, 8),
        order_id VARCHAR(100),
        fee DECIMAL(20, 8),
        note TEXT,
        extra TEXT,
        INDEX idx_trades_symbol (symbol),
        INDEX idx_trades_timestamp (timestamp),
        INDEX idx_trades_status (status),
        INDEX idx_trades_symbol_timestamp (symbol, timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level ENUM('debug', 'info', 'warn', 'error', 'fatal') NOT NULL,
        message TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        metadata TEXT,
        source VARCHAR(100),
        user_id VARCHAR(100),
        extra TEXT,
        INDEX idx_logs_level (level),
        INDEX idx_logs_timestamp (timestamp),
        INDEX idx_logs_source (source)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bot_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status ENUM('idle', 'running', 'paused', 'stopped', 'error') NOT NULL DEFAULT 'idle',
        started_at BIGINT,
        last_updated BIGINT NOT NULL,
        trade_count INT NOT NULL DEFAULT 0,
        strategy VARCHAR(100),
        version VARCHAR(50),
        extra TEXT,
        INDEX idx_bot_status_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [statusRows] = await connection.query('SELECT COUNT(*) as count FROM bot_status') as any;
    if (statusRows[0].count === 0) {
      const now = Date.now();
      await connection.query(
        'INSERT INTO bot_status (status, started_at, last_updated, trade_count) VALUES (?, NULL, ?, 0)',
        ['idle', now]
      );
    }
  } finally {
    connection.release();
  }
}

export async function insertTrade(trade: NewTrade): Promise<number> {
  const [result] = await pool.query(
    `INSERT INTO trades (symbol, side, price, quantity, timestamp, status, profit_loss, order_id, fee, note, extra)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trade.symbol,
      trade.side,
      trade.price,
      trade.quantity,
      trade.timestamp,
      trade.status,
      trade.profit_loss ?? null,
      trade.order_id ?? null,
      trade.fee ?? null,
      trade.note ?? null,
      trade.extra ?? null,
    ]
  ) as any;
  return result.insertId;
}

export async function getTradesBySymbol(symbol: string, limit: number = 100): Promise<Trade[]> {
  const [rows] = await pool.query(
    'SELECT * FROM trades WHERE symbol = ? ORDER BY timestamp DESC LIMIT ?',
    [symbol, limit]
  ) as any;
  return rows;
}

export async function insertLog(log: NewLog): Promise<number> {
  const [result] = await pool.query(
    `INSERT INTO logs (level, message, timestamp, metadata, source, user_id, extra)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      log.level,
      log.message,
      log.timestamp,
      log.metadata ?? null,
      log.source ?? null,
      log.user_id ?? null,
      log.extra ?? null,
    ]
  ) as any;
  return result.insertId;
}

export async function getLogsByLevel(level: Log['level'], limit: number = 100): Promise<Log[]> {
  const [rows] = await pool.query(
    'SELECT * FROM logs WHERE level = ? ORDER BY timestamp DESC LIMIT ?',
    [level, limit]
  ) as any;
  return rows;
}

export async function getBotStatus(): Promise<BotStatus | null> {
  const [rows] = await pool.query('SELECT * FROM bot_status ORDER BY id DESC LIMIT 1') as any;
  return rows[0] || null;
}

export async function updateBotStatus(status: Partial<NewBotStatus>): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  const now = Date.now();

  if (status.status !== undefined) {
    updates.push('status = ?');
    values.push(status.status);
  }
  if (status.started_at !== undefined) {
    updates.push('started_at = ?');
    values.push(status.started_at);
  }
  if (status.trade_count !== undefined) {
    updates.push('trade_count = ?');
    values.push(status.trade_count);
  }
  if (status.strategy !== undefined) {
    updates.push('strategy = ?');
    values.push(status.strategy);
  }
  if (status.version !== undefined) {
    updates.push('version = ?');
    values.push(status.version);
  }
  if (status.extra !== undefined) {
    updates.push('extra = ?');
    values.push(status.extra);
  }

  updates.push('last_updated = ?');
  values.push(now);

  const currentStatus = await getBotStatus();
  if (currentStatus) {
    values.push(currentStatus.id);
    await pool.query(
      `UPDATE bot_status SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function getAllTrades(limit?: number, offset?: number): Promise<Trade[]> {
  let query = 'SELECT * FROM trades ORDER BY timestamp DESC';
  const values: any[] = [];

  if (limit !== undefined) {
    query += ' LIMIT ?';
    values.push(limit);

    if (offset !== undefined) {
      query += ' OFFSET ?';
      values.push(offset);
    }
  }

  const [rows] = await pool.query(query, values) as any;
  return rows;
}

export async function getTradesByStatus(status: Trade['status'], limit: number = 100): Promise<Trade[]> {
  const [rows] = await pool.query(
    'SELECT * FROM trades WHERE status = ? ORDER BY timestamp DESC LIMIT ?',
    [status, limit]
  ) as any;
  return rows;
}

export async function getTradesByTimeRange(startTime: number, endTime: number, limit: number = 100): Promise<Trade[]> {
  const [rows] = await pool.query(
    'SELECT * FROM trades WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC LIMIT ?',
    [startTime, endTime, limit]
  ) as any;
  return rows;
}

export async function updateTrade(id: number, updates: Partial<NewTrade>): Promise<void> {
  const updateFields: string[] = [];
  const values: any[] = [];

  if (updates.symbol !== undefined) {
    updateFields.push('symbol = ?');
    values.push(updates.symbol);
  }
  if (updates.side !== undefined) {
    updateFields.push('side = ?');
    values.push(updates.side);
  }
  if (updates.price !== undefined) {
    updateFields.push('price = ?');
    values.push(updates.price);
  }
  if (updates.quantity !== undefined) {
    updateFields.push('quantity = ?');
    values.push(updates.quantity);
  }
  if (updates.timestamp !== undefined) {
    updateFields.push('timestamp = ?');
    values.push(updates.timestamp);
  }
  if (updates.status !== undefined) {
    updateFields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.profit_loss !== undefined) {
    updateFields.push('profit_loss = ?');
    values.push(updates.profit_loss);
  }
  if (updates.order_id !== undefined) {
    updateFields.push('order_id = ?');
    values.push(updates.order_id ?? null);
  }
  if (updates.fee !== undefined) {
    updateFields.push('fee = ?');
    values.push(updates.fee ?? null);
  }
  if (updates.note !== undefined) {
    updateFields.push('note = ?');
    values.push(updates.note ?? null);
  }
  if (updates.extra !== undefined) {
    updateFields.push('extra = ?');
    values.push(updates.extra ?? null);
  }

  if (updateFields.length === 0) {
    return;
  }

  values.push(id);
  await pool.query(`UPDATE trades SET ${updateFields.join(', ')} WHERE id = ?`, values);
}

export async function deleteTrade(id: number): Promise<void> {
  await pool.query('DELETE FROM trades WHERE id = ?', [id]);
}

export async function getAllLogs(limit?: number, offset?: number): Promise<Log[]> {
  let query = 'SELECT * FROM logs ORDER BY timestamp DESC';
  const values: any[] = [];

  if (limit !== undefined) {
    query += ' LIMIT ?';
    values.push(limit);

    if (offset !== undefined) {
      query += ' OFFSET ?';
      values.push(offset);
    }
  }

  const [rows] = await pool.query(query, values) as any;
  return rows;
}

export async function getLogsByTimeRange(startTime: number, endTime: number, limit: number = 100): Promise<Log[]> {
  const [rows] = await pool.query(
    'SELECT * FROM logs WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC LIMIT ?',
    [startTime, endTime, limit]
  ) as any;
  return rows;
}

export async function getLogsBySource(source: string, limit: number = 100): Promise<Log[]> {
  const [rows] = await pool.query(
    'SELECT * FROM logs WHERE source = ? ORDER BY timestamp DESC LIMIT ?',
    [source, limit]
  ) as any;
  return rows;
}

export async function deleteOldLogs(beforeTime: number): Promise<void> {
  await pool.query('DELETE FROM logs WHERE timestamp < ?', [beforeTime]);
}

export async function incrementTradeCount(): Promise<void> {
  await pool.query('UPDATE bot_status SET trade_count = trade_count + 1, last_updated = ?', [Date.now()]);
}

export async function getTradeById(id: number): Promise<Trade | null> {
  const [rows] = await pool.query('SELECT * FROM trades WHERE id = ?', [id]) as any;
  return rows[0] || null;
}

export async function resetBotStatus(): Promise<void> {
  const now = Date.now();
  await pool.query(
    `UPDATE bot_status 
     SET status = 'idle', 
         started_at = NULL, 
         last_updated = ?, 
         trade_count = 0`,
    [now]
  );
}

export default pool;
