import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import type { ApiResponse, UrlDocument } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const collection = db.collection<UrlDocument>('urls');

    const urls = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments();

    return NextResponse.json({
      success: true,
      data: urls.map(url => ({
        ...url,
        _id: url._id?.toString(),
      })),
      message: `Found ${urls.length} URLs (${total} total)`,
    } as ApiResponse<UrlDocument[]>);

  } catch (error) {
    console.error('URLs API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch URLs',
    } as ApiResponse, { status: 500 });
  }
}