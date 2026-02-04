import { NextRequest, NextResponse } from 'next/server';
import FAQ from '@/app/models/FAQ';
import connectDB from '@/app/config/db';

// GET - Get all FAQs or filter by category
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Create query - REMOVE the default isActive: true filter
    let query: any = {};
    
    // Only filter by isActive if includeInactive is not explicitly true
    if (!includeInactive) {
      query.isActive = true;
    }
    
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
    
    // Get all unique categories (from active FAQs only for dropdown)
    const categories = await FAQ.distinct('category', { isActive: true });
    
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


// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.question || !data.answer || !data.category) {
      return NextResponse.json(
        { status: false, message: 'Question, answer, and category are required' },
        { status: 400 }
      );
    }
    
    // Check if FAQ with same question already exists
    const existingFAQ = await FAQ.findOne({ 
      question: { $regex: `^${data.question}$`, $options: 'i' }
    });
    
    if (existingFAQ) {
      return NextResponse.json(
        { status: false, message: 'FAQ with this question already exists' },
        { status: 400 }
      );
    }
    
    // Create new FAQ
    const faq = new FAQ({
      question: data.question,
      answer: data.answer,
      category: data.category,
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
    
    await faq.save();
    
    return NextResponse.json({
      status: true,
      message: 'FAQ created successfully',
      data: faq
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || 'Failed to create FAQ'
      },
      { status: 500 }
    );
  }
}