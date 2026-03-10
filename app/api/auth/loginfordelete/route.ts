import { NextRequest, NextResponse } from 'next/server'

function getBackendUrl() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL
    }
    if (process.env.BACKEND_URL) {
        return process.env.BACKEND_URL
    }
    // return 'http://localhost:3001'
    return 'https://api.classz.co'
}

const BACKEND_URL = getBackendUrl()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Explicitly provided backend endpoint for login
        const backendEndpoint = `${BACKEND_URL}/api/auth/loginfordelete`

        const response = await fetch(backendEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')
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
        return NextResponse.json(data, { status: response.status })
    } catch (error: any) {
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
                message: error.message || 'Failed to login',
            },
            { status: 500 }
        )
    }
}
