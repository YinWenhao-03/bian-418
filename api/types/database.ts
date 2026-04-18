export interface Trade {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  profit_loss?: number | null;
  order_id?: string;
  fee?: number;
  note?: string;
  extra?: string;
}

export interface Log {
  id: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: number;
  metadata?: string | null;
  source?: string;
  user_id?: string;
  extra?: string;
}

export interface BotStatus {
  id: number;
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'error';
  started_at: number | null;
  last_updated: number;
  trade_count: number;
  strategy?: string;
  version?: string;
  extra?: string;
}

export type NewTrade = Omit<Trade, 'id'>;
export type NewLog = Omit<Log, 'id'>;
export type NewBotStatus = Omit<BotStatus, 'id'>;
