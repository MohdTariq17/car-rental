// ✅ Clean imports with aliases:
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// ... rest of your users API code (same as before)


// GET /api/users - Get users (admin only)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (searchParams.get('role')) {
      filter.role = searchParams.get('role');
    }
    
    if (searchParams.get('status')) {
      filter.status = searchParams.get('status');
    }
    
    if (searchParams.get('search')) {
      filter.$or = [
        { name: { $regex: searchParams.get('search'), $options: 'i' } },
        { email: { $regex: searchParams.get('search'), $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await User.countDocuments(filter);
    
    return Response.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Users API error:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return Response.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 400 });
    }
    
    const user = new User(body);
    await user.save();
    
    return Response.json({
      success: true,
      message: 'User created successfully',
      data: user
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create user error:', error);
    return Response.json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    }, { status: 400 });
  }
}
// Note: Additional routes for PUT, DELETE, etc. can be added similarly.