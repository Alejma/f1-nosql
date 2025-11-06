# Configuración de GitHub Actions con Secrets

## Configuración de Secrets

Para usar secrets en GitHub Actions, necesitas configurarlos en tu repositorio:

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega los siguientes secrets:

### Secrets Recomendados

- **`MONGO_URI`**: URI de conexión a MongoDB
  - Ejemplo local: `mongodb://localhost:27017/f1db`
  - Ejemplo Atlas: `mongodb+srv://usuario:password@cluster.mongodb.net/f1db`
  - Ejemplo con Docker: `mongodb://localhost:27017/test`

- **`REDIS_URL`**: URL de conexión a Redis
  - Ejemplo local: `redis://localhost:6379`
  - Ejemplo con password: `redis://:password@localhost:6379`
  - Ejemplo remoto: `redis://usuario:password@redis.example.com:6379`

- **`PORT`** (opcional): Puerto del servidor (por defecto: 4000)

## Configuración Actual

Los workflows (`ci.yml` y `lint.yml`) están configurados para usar **Secrets** de GitHub.

### ¿Cómo Funciona?

1. **Si los secrets están configurados**: Los workflows usan las URIs de tus secrets
2. **Si los secrets NO están configurados**: Los workflows usan valores por defecto locales (útil para desarrollo, pero no funcionará en CI sin servicios reales)

### Configuración Requerida

**⚠️ IMPORTANTE**: Para que los workflows funcionen correctamente en GitHub Actions, debes configurar los secrets:

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Agrega los secrets necesarios (ver sección arriba)

### Ejemplo de Secrets

- **MONGO_URI**: `mongodb+srv://usuario:password@cluster.mongodb.net/f1db?retryWrites=true&w=majority`
- **REDIS_URL**: `redis://usuario:password@redis.example.com:6379`
- **PORT**: `4000` (opcional)

### Nota sobre Conexiones

Si usas MongoDB Atlas o Redis Cloud, asegúrate de:
- ✅ Agregar la IP de GitHub Actions a las whitelist de tu base de datos
- ✅ Usar conexiones seguras (SSL/TLS)
- ✅ Verificar que las credenciales sean correctas

## Configuración Local

Para desarrollo local, crea un archivo `.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/f1db
REDIS_URL=redis://localhost:6379
```

## Notas Importantes

- ⚠️ **No subas secrets a tu código**: Nunca incluyas URIs con passwords en el código
- ✅ **Usa secrets para producción**: En entornos de producción, siempre usa secrets
- ✅ **Servicios Docker son seguros**: Los servicios Docker en GitHub Actions son temporales y aislados
- ✅ **El código maneja errores**: Si Redis no está disponible, la aplicación continuará funcionando

## Troubleshooting

### Error: "connect ECONNREFUSED"
- **Causa**: Redis o MongoDB no están corriendo
- **Solución**: 
  - En local: Inicia los servicios antes de correr la aplicación
  - En CI: Los servicios Docker se inician automáticamente

### Error: "Secrets not found"
- **Causa**: No has configurado los secrets en GitHub
- **Solución**: Configura los secrets como se describe arriba, o usa los servicios Docker

