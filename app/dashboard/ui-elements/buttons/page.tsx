'use client'

import React from 'react'

export default function ButtonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buttons</h1>
        <p className="text-muted-foreground">Ejemplos de componentes de botones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Botones Básicos */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Botones Básicos</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Primary
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              Secondary
            </button>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors">
              Destructive
            </button>
            <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
              Outline
            </button>
            <button className="px-4 py-2 hover:bg-accent rounded-lg transition-colors">
              Ghost
            </button>
            <button className="px-4 py-2 underline-offset-4 hover:underline transition-colors">
              Link
            </button>
          </div>
        </div>

        {/* Tamaños de Botones */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Tamaños de Botones</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded-lg">
              Small
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Default
            </button>
            <button className="px-6 py-3 text-lg bg-primary text-primary-foreground rounded-lg">
              Large
            </button>
          </div>
        </div>

        {/* Botones con Iconos */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Botones con Iconos</h3>
          <div className="flex flex-wrap gap-3">
            <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-2 border border-border rounded-lg hover:bg-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Estados de Botones */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Estados de Botones</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Normal
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg opacity-50 cursor-not-allowed" disabled>
              Disabled
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80">
              Active
            </button>
            <button className="px-4 py-2 border border-dashed border-border rounded-lg">
              Cargando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
