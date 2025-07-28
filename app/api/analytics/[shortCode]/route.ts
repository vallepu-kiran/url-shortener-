import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { shortCodeSchema } from '@/lib/validations';
import type { ApiResponse, UrlAnalytics, UrlDocument } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const validation = shortCodeSchema.safeParse({
      shortCode: params.shortCode,
    });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid short code',
      } as ApiResponse, { status: 400 });
    }

    const { shortCode } = validation.data;
    const db = await getDatabase();
    const collection = db.collection<UrlDocument>('urls');

    const urlDoc = await collection.findOne({ shortCode });

    if (!urlDoc) {
      return NextResponse.json({
        success: false,
        error: 'Short URL not found',
      } as ApiResponse, { status: 404 });
    }

    const analytics: UrlAnalytics = {
      totalClicks: urlDoc.clicks,
      clickHistory: urlDoc.clickHistory || [],
      createdAt: urlDoc.createdAt,
      originalUrl: urlDoc.originalUrl,
      shortCode: urlDoc.shortCode,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    } as ApiResponse<UrlAnalytics>);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics',
    } as ApiResponse, { status: 500 });
  }
}