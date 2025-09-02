import dbConnect from '@/lib/mongodb';

export async function GET() {
  console.log('🔧 Test DB API called');
  
  try {
    await dbConnect();
    console.log('✅ Database connection successful');
    
    return Response.json({
      success: true,
      message: 'Connected to MongoDB successfully!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return Response.json({
      success: false,
      message: 'Failed to connect to MongoDB',
      error: error.message
    }, { status: 500 });
  }
}
