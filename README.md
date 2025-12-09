# 🏎️ F1 Pro API

[![CI - Verificación del Proyecto](https://github.com/USERNAME/f1-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/f1-pro/actions/workflows/ci.yml)

API REST para la gestión de datos de **Fórmula 1**, implementada con **MongoDB** (base de datos desnormalizada) y **Redis** como sistema de **caché** para optimizar el rendimiento en consultas frecuentes.

---

## 📋 Descripción

**F1 Pro API** ofrece una arquitectura eficiente y escalable para gestionar información sobre la Fórmula 1.  
El sistema combina una base de datos **MongoDB** para la persistencia de datos con **Redis** para cachear resultados de consultas costosas o repetitivas, mejorando la velocidad de respuesta y reduciendo la carga sobre la base de datos.

### Entidades principales

- **Pilotos (Drivers):** información de cada piloto, incluyendo puntos, escudería y posición actual.  
- **Escuderías (Teams):** equipos con sus pilotos asociados y puntos totales.  
- **Carreras (Races):** registro de resultados y estadísticas por carrera.  
- **Temporadas (Seasons):** gestión de carreras, posiciones y campeonatos por año.  

---

## ⚙️ Características principales

- ✅ **Desnormalización intencional:** los datos se almacenan con cierta redundancia para mejorar el rendimiento de lectura.  
- ✅ **MongoDB para persistencia:** almacena la información histórica y estructural del campeonato.  
- ✅ **Redis como caché inteligente:**  
  - Cacheo de resultados de consultas frecuentes como:
    - Puntos por piloto  
    - Puntos por escudería  
    - Clasificación general de pilotos o equipos  
  - Expiración configurable (TTL) para mantener datos actualizados.  
- ✅ **Sincronización automática:** mecanismos que invalidan la caché al actualizar datos en MongoDB.  
- ✅ **API RESTful completa:** endpoints organizados para CRUD y consultas especializadas.  

---

## 🧩 Arquitectura general

                      ┌────────────────────────────┐
                      │         Cliente/API        │
                      └─────────────┬──────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │    F1 Pro API     │
                          │   (Spring Boot)   │
                          └─────────┬─────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           │                                                 │
    ┌──────▼──────┐                                   ┌──────▼──────┐
    │   MongoDB   │ ← Persistencia                    │    Redis    │ ← Caché de consultas
    │ (Datos F1)  │                                   │ (Cache Layer)│
    └─────────────┘                                   └──────────────┘



## 🚀 Instalación

### Prerrequisitos

- Node.js (v14 o superior)
- MongoDB (v4.4 o superior)
- Redis (v6 o superior)

### Pasos

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
   - El archivo `.env` ya está incluido con valores por defecto
   - Ajusta `MONGO_URI` y `REDIS_URL` si es necesario

4. **Iniciar MongoDB y Redis**:
```bash
# MongoDB (en una terminal)
mongod

# Redis (en otra terminal)
redis-server
```

5. **Iniciar el servidor**:
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:4000`

## 📖 Documentación Swagger

La API incluye documentación interactiva con Swagger. Una vez que el servidor esté corriendo, puedes acceder a la documentación en:

**http://localhost:4000/api-docs**

Desde aquí podrás:
- Ver todos los endpoints disponibles
- Probar los endpoints directamente desde el navegador
- Ver los esquemas de datos (schemas)
- Ver ejemplos de requests y responses

## 📦 Dependencias

- **express**: Framework web para Node.js
- **mongoose**: ODM para MongoDB
- **ioredis**: Cliente Redis para Node.js
- **dotenv**: Gestión de variables de entorno
- **cors**: Middleware para habilitar CORS
- **axios**: Cliente HTTP (opcional)
- **swagger-ui-express**: Interfaz UI de Swagger
- **swagger-jsdoc**: Generador de documentación Swagger desde comentarios JSDoc
- **nodemon**: Herramienta de desarrollo (dev dependency)

## 📚 Endpoints

### Pilotos (Drivers)

#### `POST /drivers`
Crear un nuevo piloto

**Body:**
```json
{
  "name": "Max Verstappen",
  "number": 33,
  "nationality": "Dutch",
  "teamId": "507f1f77bcf86cd799439011",
  "points": 0,
  "currentPosition": 0
}
```

#### `GET /drivers`
Obtener todos los pilotos (ordenados por puntos)

#### `GET /drivers/:id`
Obtener piloto por ID

#### `PUT /drivers/:id`
Actualizar piloto

**Body:**
```json
{
  "points": 410,
  "teamId": "507f1f77bcf86cd799439011"
}
```

#### `DELETE /drivers/:id`
Eliminar piloto

### Equipos (Teams)

#### `POST /teams`
Crear un nuevo equipo

**Body:**
```json
{
  "name": "Red Bull Racing",
  "country": "Austria",
  "points": 0
}
```

#### `GET /teams`
Obtener todos los equipos (ordenados por puntos)

#### `GET /teams/:id`
Obtener equipo por ID

#### `PUT /teams/:id`
Actualizar equipo

#### `DELETE /teams/:id`
Eliminar equipo

### Carreras (Races)

#### `POST /races`
Registrar una nueva carrera

**Body:**
```json
{
  "name": "Gran Premio de Mónaco",
  "circuit": "Circuit de Monaco",
  "date": "2025-05-25T14:00:00Z",
  "results": [
    {
      "driverId": "507f1f77bcf86cd799439011",
      "position": 1,
      "points": 25
    },
    {
      "driverId": "507f1f77bcf86cd799439012",
      "position": 2,
      "points": 18
    }
  ]
}
```

#### `GET /races`
Obtener todas las carreras (ordenadas por fecha)

#### `GET /races/:id`
Obtener carrera por ID

#### `PUT /races/:id`
Actualizar carrera

#### `DELETE /races/:id`
Eliminar carrera

### Standings

#### `GET /standings/current`
Obtener tabla de posiciones actual

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "source": "mongodb",
    "year": 2025,
    "raceActive": false,
    "standings": [
      {
        "driverName": "Max Verstappen",
        "team": "Red Bull Racing",
        "points": 410,
        "position": 1
      },
      {
        "driverName": "Lando Norris",
        "team": "McLaren",
        "points": 290,
        "position": 2
      }
    ]
  }
}
```

#### `PUT /standings/leaderboard`
Actualizar leaderboard en Redis (para carrera activa)

**Body:**
```json
[
  {
    "driverId": "507f1f77bcf86cd799439011",
    "driverName": "Max Verstappen",
    "position": 1,
    "currentLap": 42
  },
  {
    "driverId": "507f1f77bcf86cd799439012",
    "driverName": "Lando Norris",
    "position": 2,
    "currentLap": 42
  }
]
```

### Health Check

#### `GET /health`
Verificar estado del servidor

## 🗄️ Estructura de Base de Datos

### Modelo Driver (Piloto)
```javascript
{
  name: String,
  number: Number (único),
  nationality: String,
  teamName: String, // Redundante
  teamId: ObjectId,
  points: Number,
  currentPosition: Number
}
```

### Modelo Team (Escudería)
```javascript
{
  name: String (único),
  country: String,
  points: Number,
  drivers: [{
    driverId: ObjectId,
    driverName: String, // Redundante
    driverPoints: Number // Redundante
  }]
}
```

### Modelo Race (Carrera)
```javascript
{
  name: String,
  circuit: String,
  date: Date,
  results: [{
    driverId: ObjectId,
    driverName: String, // Redundante
    teamName: String, // Redundante
    position: Number,
    points: Number
  }]
}
```

### Modelo Season (Temporada)
```javascript
{
  year: Number (único),
  races: [{
    raceId: ObjectId,
    raceName: String, // Redundante
    winnerName: String // Redundante
  }],
  standings: [{
    driverId: ObjectId,
    driverName: String, // Redundante
    teamName: String, // Redundante
    points: Number,
    position: Number
  }]
}
```

## 🔄 Sincronización de Datos

El sistema incluye funciones automáticas de sincronización que se ejecutan cuando se actualizan datos:

- **`updateDriverInTeams()`**: Actualiza datos del piloto en su equipo
- **`updateDriverInRaces()`**: Actualiza datos del piloto en todas las carreras
- **`updateDriverInSeason()`**: Actualiza datos del piloto en todas las temporadas
- **`updateTeamInDrivers()`**: Actualiza datos del equipo en todos sus pilotos
- **`syncDriverData()`**: Sincroniza todos los datos redundantes de un piloto
- **`syncTeamData()`**: Sincroniza todos los datos redundantes de un equipo

Estas funciones se ejecutan automáticamente después de:
- Actualizar puntos de un piloto
- Cambiar el equipo de un piloto
- Actualizar datos de un equipo

## 📁 Estructura del Proyecto

```
src/
├── config/
│   ├── mongo.js          # Configuración MongoDB
│   └── redis.js          # Configuración Redis
├── models/
│   ├── Driver.js         # Modelo de piloto
│   ├── Team.js           # Modelo de equipo
│   ├── Race.js           # Modelo de carrera
│   └── Season.js         # Modelo de temporada
├── controllers/
│   ├── driverController.js
│   ├── teamController.js
│   ├── raceController.js
│   └── standingsController.js
├── services/
│   ├── driverService.js
│   ├── teamService.js
│   ├── raceService.js
│   └── standingsService.js
├── routes/
│   ├── driverRoutes.js
│   ├── teamRoutes.js
│   ├── raceRoutes.js
│   └── standingsRoutes.js
├── utils/
│   └── updateHelpers.js  # Funciones de sincronización
└── server.js             # Servidor principal
```

## 🧪 Ejemplos de Uso

### 1. Crear un equipo y un piloto

```bash
# Crear equipo
curl -X POST http://localhost:4000/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Bull Racing",
    "country": "Austria"
  }'

# Crear piloto (usar el _id del equipo creado)
curl -X POST http://localhost:4000/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max Verstappen",
    "number": 33,
    "nationality": "Dutch",
    "teamId": "ID_DEL_EQUIPO"
  }'
```

### 2. Registrar una carrera

```bash
curl -X POST http://localhost:4000/races \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gran Premio de Mónaco",
    "circuit": "Circuit de Monaco",
    "date": "2025-05-25T14:00:00Z",
    "results": [
      {
        "driverId": "ID_DEL_PILOTO",
        "position": 1,
        "points": 25
      }
    ]
  }'
```

### 3. Actualizar puntos de un piloto (sincronización automática)

```bash
curl -X PUT http://localhost:4000/drivers/ID_DEL_PILOTO \
  -H "Content-Type: application/json" \
  -d '{
    "points": 410
  }'
```

Esto actualizará automáticamente:
- Puntos del piloto en su equipo
- Puntos del equipo total
- Datos del piloto en todas las carreras donde aparezca
- Datos del piloto en todas las temporadas

### 4. Obtener standings actuales

```bash
curl http://localhost:4000/standings/current
```

## 🔧 Configuración

### Variables de Entorno (.env)

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/f1db
REDIS_URL=redis://localhost:6379
```

## 📝 Notas

- La desnormalización se usa intencionalmente para mejorar el rendimiento de lectura
- Las funciones de sincronización mantienen la consistencia de datos redundantes
- Redis se usa para datos en tiempo real (telemetría y leaderboard durante carreras)
- MongoDB se usa para persistencia de datos históricos

## 🔄 CI/CD

El proyecto incluye workflows de GitHub Actions que se ejecutan automáticamente en cada push y pull request:

- **CI**: Verifica que el proyecto compile correctamente, valida la sintaxis, verifica que todos los módulos se carguen y comprueba la estructura de archivos
- **Lint**: Verifica la calidad básica del código

Los workflows se ejecutan en Node.js 18.x y 20.x para asegurar compatibilidad.

## 🐛 Troubleshooting

### Error de conexión a MongoDB
- Verifica que MongoDB esté corriendo: `mongod`
- Verifica la URI en `.env`

### Error de conexión a Redis
- Verifica que Redis esté corriendo: `redis-server`
- Verifica la URL en `.env`

### Error de validación
- Asegúrate de que todos los campos requeridos estén presentes
- Verifica que los IDs referenciados existan

## 📄 Licencia

ISC

## 👨‍💻 Autor

Proyecto desarrollado para gestión de datos de Fórmula 1 con MongoDB y Redis.

