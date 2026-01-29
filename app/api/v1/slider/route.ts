// app/api/v1/slider/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/config/db';
import Slider from '@/app/models/Slider';
import { uploadToCloudinary } from '@/app/utils/cloudinary';

// POST - Create new slider
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    
    // Handle slider image upload
    const sliderImage = formData.get('slider_images') as File;
    
    if (!sliderImage || sliderImage.size === 0) {
      return NextResponse.json(
        { status: false, message: 'Slider image is required' },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    let uploadedImage = '';
    try {
      const uploaded = await uploadToCloudinary(sliderImage, 'slider');
      uploadedImage = uploaded.secure_url;
    } catch (uploadError) {
      console.error('Error uploading slider image:', uploadError);
      return NextResponse.json(
        { status: false, message: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get isActive from form data
    const isActive = formData.get('isActive') === 'true';

    // Create slider data
    const sliderData = {
      slider_images: uploadedImage,
      isActive: isActive
    };

    // Create slider
    const slider = await Slider.create(sliderData);

    return NextResponse.json({
      status: true,
      message: 'Slider created successfully',
      data: slider
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating slider:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { status: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to create slider' },
      { status: 500 }
    );
  }
}

// GET - Fetch all sliders
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');
    
    // Build query
    const query: any = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const sliders = await Slider.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      status: true,
      message: 'Sliders fetched successfully',
      data: sliders
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching sliders:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}

// PUT - Update slider
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const isActive = formData.get('isActive') as string;
    const sliderImage = formData.get('slider_images') as File;

    if (!id) {
      return NextResponse.json(
        { status: false, message: 'Slider ID is required' },
        { status: 400 }
      );
    }

    // Find slider
    const slider = await Slider.findById(id);
    if (!slider) {
      return NextResponse.json(
        { status: false, message: 'Slider not found' },
        { status: 404 }
      );
    }

    // Update data
    const updateData: any = {};

    // Update image if provided
    if (sliderImage && sliderImage.size > 0) {
      try {
        const uploaded = await uploadToCloudinary(sliderImage, 'slider');
        updateData.slider_images = uploaded.secure_url;
      } catch (uploadError) {
        console.error('Error uploading slider image:', uploadError);
        return NextResponse.json(
          { status: false, message: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // Update isActive if provided
    if (isActive !== null) {
      updateData.isActive = isActive === 'true';
    }

    // Update slider
    const updatedSlider = await Slider.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      status: true,
      message: 'Slider updated successfully',
      data: updatedSlider
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating slider:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to update slider' },
      { status: 500 }
    );
  }
}

// DELETE - Delete slider
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { status: false, message: 'Slider ID is required' },
        { status: 400 }
      );
    }

    const slider = await Slider.findById(id);
    if (!slider) {
      return NextResponse.json(
        { status: false, message: 'Slider not found' },
        { status: 404 }
      );
    }

    await Slider.findByIdAndDelete(id);

    return NextResponse.json({
      status: true,
      message: 'Slider deleted successfully',
      data: null
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting slider:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to delete slider' },
      { status: 500 }
    );
  }
}