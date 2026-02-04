import { NextRequest, NextResponse } from 'next/server';
import FAQ from '@/app/models/FAQ';
import connectDB from '@/app/config/db';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT - Update FAQ by ID
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: `Invalid FAQ ID: ${id}` },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return NextResponse.json(
        { status: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    // Check if another FAQ already has this question
    if (data.question && data.question !== faq.question) {
      const existingFAQ = await FAQ.findOne({ 
        question: { $regex: `^${data.question}$`, $options: 'i' },
        _id: { $ne: id }
      });
      
      if (existingFAQ) {
        return NextResponse.json(
          { status: false, message: 'Another FAQ with this question already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update fields
    if (data.question !== undefined) faq.question = data.question;
    if (data.answer !== undefined) faq.answer = data.answer;
    if (data.category !== undefined) faq.category = data.category;
    if (data.order !== undefined) faq.order = data.order;
    if (data.isActive !== undefined) faq.isActive = data.isActive;
    
    await faq.save();
    
    return NextResponse.json({
      status: true,
      message: 'FAQ updated successfully',
      data: faq
    });
    
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || 'Failed to update FAQ'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete FAQ by ID
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: `Invalid FAQ ID: ${id}` },
        { status: 400 }
      );
    }
    
    // Soft delete by setting isActive to false
    const faq = await FAQ.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!faq) {
      return NextResponse.json(
        { status: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: true,
      message: 'FAQ deleted successfully',
      data: faq
    });
    
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || 'Failed to delete FAQ'
      },
      { status: 500 }
    );
  }
}

// GET - Get single FAQ by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: false, message: `Invalid FAQ ID: ${id}` },
        { status: 400 }
      );
    }
    
    const faq = await FAQ.findOne({ _id: id, isActive: true });
    
    if (!faq) {
      return NextResponse.json(
        { status: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: true,
      message: 'FAQ fetched successfully',
      data: faq
    });
    
  } catch (error: any) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || 'Failed to fetch FAQ'
      },
      { status: 500 }
    );
  }
}