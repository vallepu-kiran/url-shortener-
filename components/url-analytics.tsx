'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, MousePointer, TrendingUp } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';
import type { UrlAnalytics, ClickEvent } from '@/types';

interface UrlAnalyticsProps {
  shortCode: string;
}

export default function UrlAnalyticsComponent({ shortCode }: UrlAnalyticsProps) {
  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/${shortCode}`);
        const result = await response.json();

        if (result.success && result.data) {
          setAnalytics(result.data);
        } else {
          setError(result.error || 'Failed to load analytics');
        }
      } catch (error) {
        setError('Failed to load analytics');
        console.error('Analytics error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shortCode) {
      fetchAnalytics();
    }
  }, [shortCode]);

  const getClicksByDay = (clickHistory: ClickEvent[]) => {
    const clicksByDay: { [key: string]: number } = {};
    
    clickHistory.forEach(click => {
      const date = new Date(click.timestamp).toDateString();
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;
    });

    return Object.entries(clicksByDay)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7); // Last 7 days
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-600">{error || 'No analytics data available'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentClicks = analytics.clickHistory.slice(-10).reverse();
  const clicksByDay = getClicksByDay(analytics.clickHistory);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalClicks)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(analytics.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalClicks > 0 ? 
                Math.round(analytics.totalClicks / Math.max(1, Math.ceil((Date.now() - new Date(analytics.createdAt).getTime()) / (1000 * 60 * 60 * 24)))) : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* URL Info */}
      <Card>
        <CardHeader>
          <CardTitle>URL Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Short Code</p>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {analytics.shortCode}
            </code>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Original URL</p>
            <a 
              href={analytics.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all text-sm"
            >
              {analytics.originalUrl}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Daily Clicks Chart */}
      {clicksByDay.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Clicks (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clicksByDay.map(([date, clicks]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-200 h-2 rounded-full" style={{
                      width: `${Math.max(20, (clicks / Math.max(...clicksByDay.map(([, c]) => c))) * 100)}px`
                    }}></div>
                    <Badge variant="secondary">{clicks}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Clicks */}
      {recentClicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Clicks</CardTitle>
            <CardDescription>Last 10 clicks on this URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClicks.map((click, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {formatDate(click.timestamp)}
                  </span>
                  <div className="flex items-center gap-2">
                    {click.referrer && (
                      <Badge variant="outline" className="text-xs">
                        {new URL(click.referrer).hostname}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {click.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}