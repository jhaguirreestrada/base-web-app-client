import { NextResponse } from 'next/server'

const NESTJS_API_URL = 'http://localhost:3000/auth/logout'
const AUTH_COOKIE_NAME = 'auth_token'
const AUTH_COOKIE_CLIENT = 'auth_token_client'
const USER_COOKIE_NAME = 'auth_user'

export async function POST(request: Request) {
  try {
    const cookieStore = request.headers.get('cookie')
    const token = cookieStore?.match(/auth_token=([^;]+)/)?.[1]

    try {
      await fetch(NESTJS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
    } catch (nestError) {
      console.error('NestJS logout error:', nestError)
    }

    const nextResponse = NextResponse.json({ message: 'Logged out' })

    nextResponse.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
    })

    nextResponse.cookies.set(AUTH_COOKIE_CLIENT, '', {
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
    })

    nextResponse.cookies.set(USER_COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
    })

    return nextResponse
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
