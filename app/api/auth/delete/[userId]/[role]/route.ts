import { NextRequest, NextResponse } from 'next/server'

function getBackendUrl() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL
    }

    // return 'http://localhost:3000'
    return 'https://api.classz.co'
}

const BACKEND_URL = getBackendUrl()

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string; role: string }> }
) {
    try {
        const { userId, role } = await params

        // Explicitly provided backend endpoint for deleting account
        const backendEndpoint = `${BACKEND_URL}/api/auth/delete/${userId}/${role}`

        // Extract auth-token header from incoming request
        const authToken = request.headers.get('auth-token')
        console.log('Incoming auth-token Header:', authToken)

        const fetchOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'auth-token': authToken } : {}),
            },
        }
        console.log('Outgoing Fetch Options:', fetchOptions)

        const response = await fetch(backendEndpoint, fetchOptions)

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

        const data = await response.json().catch(() => ({ success: true }))
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
                message: error.message || 'Failed to delete account',
            },
            { status: 500 }
        )
    }
}
