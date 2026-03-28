'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'

export default function FormsPage() {
  const [showContraseña, setShowContraseña] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    bio: '',
    terms: false,
    newsletter: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Form Elements</h1>
        <p className="text-muted-foreground">Ejemplos de componentes de formulario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario Básico */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Formulario Básico</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Apellido</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Correo electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showContraseña ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 pr-12 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowContraseña(!showContraseña)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showContraseña ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">País</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select country</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Biografía</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Acepto los términos y condiciones</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Suscribirse al boletín</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>

        {/* Form States */}
        <div className="space-y-6">
          {/* Por defecto Input */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Estados de Input</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Por defecto</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Por defecto input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Éxito</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 pr-10 bg-secondary rounded-lg border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Éxito input"
                  />
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Error</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Error input"
                />
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Deshabilitado</label>
                <input
                  type="text"
                  disabled
                  className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border cursor-not-allowed opacity-50"
                  placeholder="Deshabilitado input"
                />
              </div>
            </div>
          </div>

          {/* Tamaños de Input */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Tamaños de Input</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pequeño</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Pequeño input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Por defecto</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Por defecto input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Grande</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-lg bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Grande input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
