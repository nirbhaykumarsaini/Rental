// app/api/v1/privacy-policy/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/config/db";
import PrivacyPolicy from "@/app/models/PrivacyPolicy";

// GET - Get active privacy policy (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const version = searchParams.get('version');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    let query: any = { isActive: true };
    
    if (version) {
      query = { version }; // Get specific version
    }

    if (includeHistory) {
      // Get all policies sorted by version
      const policies = await PrivacyPolicy.find({})
        .sort({ version: -1 })
        .select('-__v')
        .lean();
      
      return NextResponse.json({
        status: true,
        message: "Privacy policies retrieved successfully",
        data: {
          active: policies.find(p => p.isActive),
          history: policies.filter(p => !p.isActive),
          totalVersions: policies.length
        }
      }, { status: 200 });
    }

    // Get only active policy
    const policy = await PrivacyPolicy.findOne(query)
      .select('-_id -__v')
      .lean();

    if (!policy) {
      return NextResponse.json({
        status: false,
        message: "No active privacy policy found",
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      message: "Privacy policy retrieved successfully",
      data: policy
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching privacy policy:", error);
    return NextResponse.json({
      status: false,
      message: error.message || "Failed to fetch privacy policy"
    }, { status: 500 });
  }
}

// POST - Create new privacy policy (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      title, 
      content, 
      version, 
      summary,
      effectiveDate,
    } = body;

    // Validate required fields
    if (!title || !content || !version) {
      return NextResponse.json(
        { status: false, message: "Title, content, and version are required" },
        { status: 400 }
      );
    }

    // Check if version already exists
    const existingVersion = await PrivacyPolicy.findOne({ version });
    if (existingVersion) {
      return NextResponse.json(
        { status: false, message: `Version ${version} already exists` },
        { status: 400 }
      );
    }

    // Deactivate all previous policies
    await PrivacyPolicy.updateMany(
      { isActive: true },
      { $set: { isActive: false, deactivatedAt: new Date() } }
    );

    // Create new policy
    const newPolicy = await PrivacyPolicy.create({
      title,
      content,
      version,
      summary: summary || `Privacy Policy Version ${version}`,
      effectiveDate: effectiveDate || new Date(),
      isActive: true
    });

    return NextResponse.json({
      status: true,
      message: "Privacy policy created successfully",
      data: {
        id: newPolicy._id,
        title: newPolicy.title,
        version: newPolicy.version,
        effectiveDate: newPolicy.effectiveDate,
        isActive: newPolicy.isActive,
        createdAt: newPolicy.createdAt
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error creating privacy policy:", error);
    return NextResponse.json({
      status: false,
      message: error.message || "Failed to create privacy policy"
    }, { status: 500 });
  }
}

// PUT - Update privacy policy (admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      id, 
      title, 
      content, 
      summary,
      effectiveDate,
    } = body;

    if (!id) {
      return NextResponse.json(
        { status: false, message: "Policy ID is required" },
        { status: 400 }
      );
    }

    const policy = await PrivacyPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { status: false, message: "Privacy policy not found" },
        { status: 404 }
      );
    }

    // Update policy
    const updates: any = {
      updatedAt: new Date()
    };

    if (title) updates.title = title;
    if (content) updates.content = content;
    if (summary) updates.summary = summary;
    if (effectiveDate) updates.effectiveDate = effectiveDate;

    const updatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({
      status: true,
      message: "Privacy policy updated successfully",
      data: {
        id: updatedPolicy?._id,
        title: updatedPolicy?.title,
        version: updatedPolicy?.version,
        effectiveDate: updatedPolicy?.effectiveDate,
        isActive: updatedPolicy?.isActive,
        updatedAt: updatedPolicy?.updatedAt
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating privacy policy:", error);
    return NextResponse.json({
      status: false,
      message: error.message || "Failed to update privacy policy"
    }, { status: 500 });
  }
}

// DELETE - Delete privacy policy (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { status: false, message: "Policy ID is required" },
        { status: 400 }
      );
    }

    const policy = await PrivacyPolicy.findById(id);
    if (!policy) {
      return NextResponse.json(
        { status: false, message: "Privacy policy not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion of active policy
    if (policy.isActive) {
      return NextResponse.json(
        { status: false, message: "Cannot delete active privacy policy" },
        { status: 400 }
      );
    }

    await PrivacyPolicy.findByIdAndDelete(id);

    return NextResponse.json({
      status: true,
      message: "Privacy policy deleted successfully",
      data: null
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting privacy policy:", error);
    return NextResponse.json({
      status: false,
      message: error.message || "Failed to delete privacy policy"
    }, { status: 500 });
  }
}