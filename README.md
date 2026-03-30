# Base Web App

Plantilla de aplicación web administrativa construida con Next.js 14 y Tailwind CSS.

## Características

- Autenticación custom (localStorage)
- Dashboard con gráficos y estadísticas
- Diseño responsivo (light/dark mode)
- Rutas protegidas
- Menús dinámicos según rol
- UI Components (tablas, formularios, botones)

## Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Gráficos**: Recharts

## Estructura del Proyecto

```
app/
├── (auth)/login/          # Página de login
├── api/auth/             # API routes (login, logout)
├── dashboard/             # Dashboard y páginas protegidas
│   ├── roles/
│   ├── users/
│   ├── menus/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   └── ui-elements/
├── hooks/                 # Custom hooks
│   ├── useMenus.ts
│   └── useSessionTimeout.ts
└── utils/                 # Utilidades
    └── iconMap.tsx

components/
├── layout/                # Navbar, Sidebar
├── providers/             # ThemeProvider
└── SessionWarningModal.tsx
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear archivo `.env.local` con las variables de entorno necesarias
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Autenticación

El sistema usa autenticación custom:
- **Login**: POST `/api/auth/login` con `{ username, password }`
- **Token**: Se guarda en `localStorage` como `auth_token`
- **Usuario**: Se guarda en `localStorage` como `auth_user`

## Rutas

- `/login` - Login
- `/dashboard` - Dashboard principal
- `/dashboard/roles` - Gestión de roles
- `/dashboard/users` - Gestión de usuarios
- `/dashboard/menus` - Gestión de menús
- `/dashboard/forms` - Formularios demo
- `/dashboard/tables` - Tablas demo
- `/dashboard/charts` - Gráficos demo
- `/dashboard/ui-elements/buttons` - Botones demo

## Licencia

MIT
