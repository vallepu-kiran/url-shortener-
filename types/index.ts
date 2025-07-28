export interface UrlDocument {
  _id?: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
  clickHistory?: ClickEvent[];
}

export interface ClickEvent {
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

export interface ShortenResponse {
  data: boolean;
  error: string;
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  success: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UrlAnalytics {
  totalClicks: number;
  clickHistory: ClickEvent[];
  createdAt: Date;
  originalUrl: string;
  shortCode: string;
}