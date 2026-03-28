import { NextResponse } from 'next/server'

const NESTJS_API_URL = 'http://localhost:3000/auth/login'
const AUTH_COOKIE_NAME = 'auth_token'
const AUTH_COOKIE_CLIENT = 'auth_token_client'
const USER_COOKIE_NAME = 'auth_user'
const USER_COOKIE_CLIENT = 'auth_user_client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(NESTJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: error.message || 'Credenciales inválidas' },
        { status: response.status }
      )
    }

    const data = await response.json()


    const nextResponse = NextResponse.json(data)

    nextResponse.cookies.set(AUTH_COOKIE_NAME, data.access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })

    nextResponse.cookies.set(AUTH_COOKIE_CLIENT, 'true', {
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
    })

    nextResponse.cookies.set(USER_COOKIE_CLIENT, JSON.stringify(data.user), {
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
    })

    nextResponse.cookies.set(USER_COOKIE_NAME, JSON.stringify(data.user), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })

    return nextResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
