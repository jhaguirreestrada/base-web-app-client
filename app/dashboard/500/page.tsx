export default function Error500Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">500</h1>
        <p className="text-xl text-muted-foreground mt-4">Error interno del servidor</p>
      </div>
    </div>
  )
}
