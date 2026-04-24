import { NextResponse } from 'next/server'

const NESTJS_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const response = await fetch(`${NESTJS_API_URL}/users/${id}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          message: error.message || 'Error al cambiar la contraseña',
          error: error.error || 'Bad Request',
          statusCode: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { message: 'Error al conectar con el servidor' },
      { status: 500 }
    )
  }
}