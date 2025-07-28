import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { urlSchema } from '@/lib/validations';
import { nanoid } from 'nanoid';
import type { ApiResponse, ShortenResponse, UrlDocument } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = urlSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0].message,
      } as ApiResponse, { status: 400 });
    }

    const { url } = validation.data;
    const db = await getDatabase();
    const collection = db.collection<UrlDocument>('urls');

    // Check if URL already exists
    const existingUrl = await collection.findOne({ originalUrl: url });
    if (existingUrl) {
      return NextResponse.json({
        success: true,
        data: {
          shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${existingUrl.shortCode}`,
          shortCode: existingUrl.shortCode,
          originalUrl: existingUrl.originalUrl,
          success: true,
        },
      } as ApiResponse<ShortenResponse>);
    }

    // Generate unique short code
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      shortCode = nanoid(8);
      const existing = await collection.findOne({ shortCode });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate unique short code',
      } as ApiResponse, { status: 500 });
    }

    // Create URL document
    const urlDoc: UrlDocument = {
      originalUrl: url,
      shortCode,
      createdAt: new Date(),
      clicks: 0,
      clickHistory: [],
    };

    await collection.insertOne(urlDoc);

    return NextResponse.json({
      success: true,
      data: {
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`,
        shortCode,
        originalUrl: url,
        success: true,
      },
    } as ApiResponse<ShortenResponse>, { status: 201 });

  } catch (error) {
    console.error('Shorten API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse, { status: 500 });
  }
}