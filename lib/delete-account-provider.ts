export interface UserModel {
    id: string
    fullname: string
    email: string
    role: string
    image?: { url?: string; path?: string }
    accessToken: string
}

export interface LoginResponse {
    success: boolean
    accessToken?: string
    fullname?: string
    image?: { url?: string; path?: string }
    message?: string
}

export interface DeleteResponse {
    success: boolean
    message?: string
}

// Re-use logic from partnership page to get API URL
export const getApiBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL
    }
    if (typeof window === 'undefined') {
        // return 'http://localhost:3001'
        return 'https://api.classz.co'
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // return 'http://localhost:3001'
        return 'https://api.classz.co'
    }
    return ''
}

const API_BASE_URL = getApiBaseUrl()

export async function loginUser(email: string, password: string, role: string): Promise<LoginResponse> {
    const apiUrl = '/api/auth/loginfordelete'

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        })

        const data = await res.json()
        if (!res.ok) {
            return { success: false, message: data.message || 'Login failed' }
        }

        return {
            success: true,
            accessToken: data.accessToken,
            fullname: data.fullname,
            image: data.image,
        }
    } catch (error: any) {
        return { success: false, message: error.message || 'Network error' }
    }
}

export async function deleteAccount(userId: string, role: string, token: string): Promise<DeleteResponse> {
    const apiUrl = `/api/auth/delete/${userId}/${role}`

    try {
        const res = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': token
            },
        })

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { success: false, message: data.message || 'Failed to delete account' }
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, message: error.message || 'Network error' }
    }
}
