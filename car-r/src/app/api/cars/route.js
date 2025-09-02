import dbConnect from '@/lib/mongodb';
import Car from '@/models/Car';

export async function GET(request) {
  console.log('🚗 Cars API GET called'); // This will show in debug console
  
  try {
    await dbConnect();
    console.log('✅ Database connected');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { status: 'active' };
    
    if (searchParams.get('type')) {
      filter.type = searchParams.get('type');
    }
    
    if (searchParams.get('location')) {
      filter.location = searchParams.get('location');
    }
    
    if (searchParams.get('available')) {
      filter.available = searchParams.get('available') === 'true';
    }
    
    console.log('🔍 Filter applied:', filter);
    
    const cars = await Car.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Car.countDocuments(filter);
    
    console.log(`📊 Found ${cars.length} cars out of ${total} total`);
    
    return Response.json({
      success: true,
      data: cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Cars API error:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch cars',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  console.log('🚗 Cars API POST called');
  
  try {
    await dbConnect();
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const car = new Car(body);
    await car.save();
    
    console.log('✅ Car created:', car._id);
    
    return Response.json({
      success: true,
      message: 'Car created successfully',
      data: car
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Create car error:', error);
    return Response.json({
      success: false,
      message: 'Failed to create car',
      error: error.message
    }, { status: 400 });
  }
}
