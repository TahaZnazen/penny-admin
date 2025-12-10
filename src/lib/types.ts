// Database types for Penny Slot Admin Dashboard

export interface User {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  x_username: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
  last_spin_at: string | null;
  total_spins: number;
  total_wins: number;
  total_penny_wins: number;
  total_jackpots: number;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_code: string;
  status: 'pending' | 'spinning' | 'won_penny' | 'won_jackpot' | 'lost' | 'expired' | 'claimed';
  created_at: string;
  used_at: string | null;
  result_at: string | null;
  expires_at: string;
  spin_result: Record<string, unknown> | null;
  claimed_at: string | null;
  // Joined user data
  users?: {
    telegram_username: string | null;
    x_username: string | null;
  };
}

export interface GlobalState {
  id: number;
  cycle_start_at: string;
  jackpots_remaining: number;
  penny_wins_remaining: number;
  last_reset_at: string;
  total_spins_this_cycle: number;
  updated_at: string;
}

export interface WinHistory {
  id: string;
  user_id: string;
  game_session_id: string;
  win_type: 'penny' | 'jackpot';
  wallet_address: string | null;
  telegram_id: number;
  telegram_username: string | null;
  won_at: string;
  claimed: boolean;
  claimed_at: string | null;
  reward_amount: number | null;
  reward_tx_hash: string | null;
  // Joined user data
  users?: {
    telegram_username: string | null;
    wallet_address: string | null;
  };
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalGames: number;
  totalWins: number;
  jackpotsRemaining: number;
  pennyWinsRemaining: number;
  cycleStartAt: string;
  totalSpinsThisCycle: number;
}

// Analytics data
export interface DailyStats {
  date: string;
  users: number;
  games: number;
  wins: number;
}

export interface TopWinner {
  id: string;
  telegram_username: string | null;
  total_wins: number;
  total_penny_wins: number;
  total_jackpots: number;
}

// Site Configuration
export interface SiteConfig {
  id: number;
  telegram_url: string | null;
  twitter_url: string | null;
  dexscreener_url: string | null;
  buy_url: string | null;
  penny_magic_url: string | null;
  whitepaper_url: string | null;
  website_url: string | null;
  contract_address: string | null;
  penny_win_amount: number;
  penny_win_unit: string;
  penny_win_custom_text: string | null;
  jackpot_amount: number;
  jackpot_unit: string;
  jackpot_custom_text: string | null;
  created_at: string;
  updated_at: string;
}
