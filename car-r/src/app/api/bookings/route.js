// ✅ Clean imports with aliases:
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// ... rest of your booking API code (same as before)

// GET /api/bookings - Get bookings
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filter by user role
    if (searchParams.get('customerId')) {
      filter.customerId = searchParams.get('customerId');
    }
    
    if (searchParams.get('hostId')) {
      filter.hostId = searchParams.get('hostId');
    }
    
    if (searchParams.get('status')) {
      filter.status = searchParams.get('status');
    }
    
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('carId', 'name brand images')
      .populate('customerId', 'name email')
      .populate('hostId', 'name email')
      .lean();
    
    const total = await Booking.countDocuments(filter);
    
    return Response.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Bookings API error:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/bookings - Create new booking
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const booking = new Booking(body);
    await booking.save();
    
    return Response.json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create booking error:', error);
    return Response.json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    }, { status: 400 });
  }
}
// Note: Additional routes for PUT, DELETE, etc. can be added similarly.