# Base Web App - Documentación para Agentes

## Autenticación

### Sistema actual
- **Tipo**: Custom (no NextAuth)
- **Almacenamiento**: localStorage + cookies
- **Backend**: NestJS en puerto 3000
- **Frontend**: Next.js en puerto 3001

### Funcionamiento

1. **Login** (`/login`)
   - Endpoint: `POST /api/auth/login`
   - Body: `{ username, password }`
   - Respuesta: `{ access_token, user }`
   - Guardar en localStorage:
     - `auth_token`: access_token
     - `auth_user`: objeto user completo

2. **Rutas protegidas**
   - Verificar `localStorage.getItem('auth_token')`
   - Si no existe → redirigir a `/login`

3. **Logout**
   - Limpiar localStorage: `auth_token`, `auth_user`
   - Llamar a `POST /api/auth/logout`

### Estructura del usuario

```json
{
  "id_user": 1,
  "username": "admin",
  "email": "admin@mail.com",
  "role": {
    "id_role": 1,
    "name": "ADMIN"
  }
}
```

### APIs relevantes

- `GET /roles/{id_role}/menus` - Obtener menús del rol
- `GET /roles` - Listar roles
- `GET /users` - Listar usuarios

### Rutas

- `/login` - Login
- `/dashboard` - Dashboard (ruta principal después de login)
- `/dashboard/roles` - Roles
- `/dashboard/users` - Usuarios
- etc.

### Notas importantes

1. NO usar NextAuth - la app tiene auth custom
2. NO usar cookies para leer datos del usuario - usar localStorage
3. Las cookies se usan solo para enviar token al backend
4. El token se envía en header: `Authorization: Bearer {token}`

### Archivos clave

- `app/(auth)/login/page.tsx` - Página de login
- `app/dashboard/layout.tsx` - Layout del dashboard (protección de rutas)
- `app/hooks/useMenus.ts` - Hook para obtener menús
- `components/layout/Sidebar.tsx` - Sidebar con menús dinámicos
- `app/api/auth/login/route.ts` - API de login
- `app/api/auth/logout/route.ts` - API de logout

### Errores comunes

- **Menús no cargan**: Verificar que el rol tenga menús asignados en el backend
- **Loop login/dashboard**: No mezclar NextAuth con auth custom
- **Token null**: Usar localStorage, no cookies (las cookies httpOnly no son accesibles desde JS)
