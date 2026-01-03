import { NextRequest, NextResponse } from 'next/server'

// Get backend URL from environment variable or default to localhost
function getBackendUrl() {
  // Priority: NEXT_PUBLIC_API_BASE_URL > BACKEND_URL > localhost
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL
  }
  // Default to localhost for development
  return 'http://localhost:3000'
}

const BACKEND_URL = getBackendUrl()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const backendEndpoint = `${BACKEND_URL}/api/parent/contact-form`
    console.log('Proxying contact form request to backend:', backendEndpoint)
    console.log('Request body:', body)

    // Forward request to backend
    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Backend error response:', response.status, errorText)
      
      // Try to parse as JSON
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(errorData, { status: response.status })
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: `Backend error (${response.status}): ${errorText.substring(0, 200)}`,
          },
          { status: response.status }
        )
      }
    }

    const data = await response.json()
    console.log('Backend response status:', response.status)
    console.log('Backend response data:', data)

    // Return the backend response
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Error proxying contact form request:', error)
    
    // Check if it's a network error
    if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot connect to backend at ${BACKEND_URL}. Please check if the backend is running.`,
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to submit contact form',
      },
      { status: 500 }
    )
  }
}

