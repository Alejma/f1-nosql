# Configuración de Variables de Entorno

## Archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/f1db
REDIS_URL=redis://localhost:6379
```

## Importante

- Asegúrate de que MongoDB esté corriendo antes de iniciar el servidor
- Asegúrate de que Redis esté corriendo antes de iniciar el servidor
- La URI de MongoDB debe comenzar con `mongodb://` o `mongodb+srv://`

## Verificar conexión

Si MongoDB está corriendo en localhost:27017, puedes usar:
```
MONGO_URI=mongodb://localhost:27017/f1db
```

Si usas MongoDB Atlas (cloud), usa:
```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/f1db
```

