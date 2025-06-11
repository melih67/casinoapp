import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get cookies and authorization header from the request to forward authentication
    const cookies = request.headers.get('cookie') || '';
    const authorization = request.headers.get('authorization') || '';
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authentication headers if present
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    if (authorization) {
      headers['Authorization'] = authorization;
    }
    
    const response = await fetch(`${backendUrl}/api/games/bet`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    // Forward the response status and data
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}