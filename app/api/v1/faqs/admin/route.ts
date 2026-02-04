import { NextRequest, NextResponse } from 'next/server';
import FAQ from '@/app/models/FAQ';
import connectDB from '@/app/config/db';

// GET - Get all FAQs for admin (includes inactive)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Create query - get all FAQs including inactive
    let query: any = {};
    
    // Apply category filter if provided
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Apply search filter if provided
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await FAQ.countDocuments(query);
    
    // Get FAQs with pagination
    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get all unique categories from ALL FAQs (including inactive)
    const categories = await FAQ.distinct('category', {});
    
    return NextResponse.json({
      status: true,
      message: 'FAQs fetched successfully',
      data: {
        faqs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        categories: ['All', ...categories.sort()]
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || 'Failed to fetch FAQs'
      },
      { status: 500 }
    );
  }
}