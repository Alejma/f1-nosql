# 📋 REQUERIMIENTOS FUNCIONALES - F1 Pro API

## 1. DESCRIPCIÓN GENERAL DEL PROYECTO

### 1.1 Objetivo
Desarrollar una API REST para la gestión de datos de Fórmula 1 utilizando MongoDB como base de datos principal y Redis únicamente como capa de caché para resultados de lectura costosa o repetitiva. No se usa Redis para monitoreo o telemetría en tiempo real.

### 1.2 Alcance
El sistema debe gestionar:
- Información de pilotos (drivers)
- Información de escuderías (teams)
- Registro de carreras (races)
- Temporadas y standings históricos

Fuera de alcance:
- Telemetría o datos en tiempo real
- Leaderboard en tiempo real

### 1.3 Tecnologías
- **Backend**: Node.js con Express  
- **Base de Datos Principal**: MongoDB (Mongoose)  
- **Caché**: Redis (ioredis)  
- **Documentación**: Swagger/OpenAPI  
- **Arquitectura**: REST API  

---

## 2. REQUERIMIENTOS FUNCIONALES POR MÓDULO

### 2.1 MÓDULO DE PILOTOS (Drivers)

#### RF-DRIVER-01: Crear Piloto
El sistema debe permitir registrar un nuevo piloto con sus atributos: nombre, nacionalidad, número de auto, escudería, puntos y estado activo.

#### RF-DRIVER-02: Consultar Pilotos
Debe permitir obtener la lista de todos los pilotos. Si los datos existen en Redis bajo la clave `drivers:all`, se deben devolver desde allí. Si no, se obtienen de MongoDB, se guardan en Redis y se devuelven.

#### RF-DRIVER-03: Consultar Piloto por ID
Permite obtener la información de un piloto específico. Se intentará obtener primero desde la clave `driver:{id}` en Redis.

#### RF-DRIVER-04: Actualizar Piloto
Debe permitir la actualización de puntos o escudería de un piloto. Al hacerlo, el sistema debe invalidar las claves `driver:{id}`, `drivers:all` y `standings:*`.

#### RF-DRIVER-05: Eliminar Piloto
Debe permitir eliminar un piloto y eliminar de Redis las claves asociadas (`driver:{id}`, `drivers:all`, `standings:*`).

---

### 2.2 MÓDULO DE EQUIPOS (Teams)

#### RF-TEAM-01: Crear Equipo
Permitir registrar una escudería con nombre, país, año de fundación y pilotos asociados.

#### RF-TEAM-02: Consultar Equipos
Recuperar lista de equipos, priorizando lectura desde Redis (`teams:all`).

#### RF-TEAM-03: Consultar Equipo por ID
Recuperar equipo individual usando `team:{id}` en Redis.

#### RF-TEAM-04: Actualizar Equipo
Permitir actualizar nombre, país o pilotos. Invalida claves `team:{id}`, `teams:all`, `drivers:all`, `standings:*`.

#### RF-TEAM-05: Eliminar Equipo
Eliminar un equipo y sus pilotos asociados. Invalida claves `team:{id}`, `teams:all`, `drivers:all`, `standings:*`.

---

### 2.3 MÓDULO DE CARRERAS (Races)

#### RF-RACE-01: Registrar Carrera
Registrar los resultados de una carrera (posición final, puntos otorgados, fecha, circuito, temporada).

#### RF-RACE-02: Consultar Carreras por Temporada
Obtener listado de carreras de un año específico. Lectura desde `races:list:{year}` en Redis si existe.

#### RF-RACE-03: Consultar Carrera por ID
Recuperar una carrera específica (`race:{id}`).

#### RF-RACE-04: Actualizar Resultados
Actualizar resultados o puntos de una carrera y luego invalidar `races:list:{year}`, `race:{id}`, `standings:{year}`.

---

### 2.4 MÓDULO DE STANDINGS Y CACHÉ

#### RF-STANDINGS-01: Obtener Standings Actuales
**Descripción**: El sistema debe permitir obtener la tabla de posiciones actual usando caché.

**Procesamiento**:
1. Generar clave `standings:{year or latest}`.  
2. Intentar leer desde Redis.  
3. Si existe, devolver datos desde caché.  
4. Si no, consultar MongoDB, calcular standings, guardar en Redis con TTL y devolver.  

**Datos de salida**:
- `source`: "redis" o "mongodb"  
- `year`: Año de la temporada consultada  
- `standings`: Array con top 10 posiciones  

**Endpoint**:
- `GET /standings/current`

**Notas**:
- Invalidar caché cuando cambian resultados o puntos.

---

### 2.5 MÓDULO DE TEMPORADAS (Seasons)

#### RF-SEASON-01: Crear Temporada
Registrar nueva temporada con año, carreras y pilotos participantes.

#### RF-SEASON-02: Consultar Temporadas
Listar temporadas registradas en MongoDB.

#### RF-SEASON-03: Consultar Temporada por Año
Obtener información completa de una temporada específica, con resumen de carreras y standings finales.

---

## 3. REQUERIMIENTOS DE DESNORMALIZACIÓN
Las entidades Piloto, Equipo y Carrera deben incluir campos redundantes para optimizar lecturas frecuentes.  
Ejemplo: los puntos del equipo pueden almacenarse en cada piloto para reducir agregaciones repetitivas.

---

## 4. REQUERIMIENTOS DE SINCRONIZACIÓN
Las actualizaciones de puntos y posiciones deben mantenerse consistentes entre pilotos, equipos y standings.  
Toda actualización de carrera debe disparar recalculo e invalidación de cache en standings.

---

## 5. REQUERIMIENTOS DE REDIS (Caché)

### RF-REDIS-01: Gestión de Conexión a Redis
- Conexión lazy bajo demanda.  
- Reintentos exponenciales hasta 10 intentos.  
- Timeout de 5 segundos.  
- Cliente mock si Redis no está disponible.  
- La aplicación debe seguir operativa sin Redis.

### RF-REDIS-02: Patrón de Caché
- Patrón **cache-aside** para lecturas.  
- Claves recomendadas:
  - `drivers:all`
  - `teams:all`
  - `races:list:{year}`
  - `standings:{year or latest}`
  - `driver:{id}`
  - `team:{id}`
  - `race:{id}`
- TTL: 300 s para listados, 120 s para entidades individuales.

### RF-REDIS-03: Invalicación de Caché
- Al crear/actualizar/eliminar:
  - Piloto → `driver:{id}`, `drivers:all`, `standings:*`
  - Equipo → `team:{id}`, `teams:all`, `drivers:all`, `standings:*`
  - Carrera → `race:{id}`, `races:list:*`, `standings:*`
  - Temporada → `standings:{year}`
- Invalida antes de persistir cambios.

### RF-REDIS-04: Serialización y Tamaño
- JSON stringificado.  
- Si excede límite de tamaño, no cachear y registrar advertencia.

---

## 6. REQUERIMIENTOS TÉCNICOS
- Node.js con Express y Mongoose.  
- Swagger para documentación.  
- Variables de entorno para configuración de Redis y MongoDB.  
- Middleware común para manejo de errores.  
- TTL configurable en `.env`.

---

## 7. CASOS DE USO

### CU-01: Crear Piloto con Equipo  
1. El usuario envía solicitud con datos del piloto.  
2. El sistema guarda el piloto en MongoDB e invalida claves `drivers:all` y `standings:*`.

### CU-02: Registrar Carrera y Actualizar Standings  
1. El usuario registra resultados.  
2. El sistema actualiza puntos, recalcula standings e invalida caché correspondiente.

### CU-03: Actualizar Puntos de un Piloto  
1. Se actualizan puntos del piloto.  
2. Se invalidan claves `driver:{id}`, `standings:*`.

### CU-04: Obtener Standings con Caché  
1. Usuario consulta standings actuales.  
2. Sistema busca `standings:{year}` en Redis.  
3. Si existe, responde desde Redis.  
4. Si no, consulta MongoDB, guarda en Redis y devuelve datos.

### CU-05: Lecturas de Listas con Caché  
1. Usuario solicita pilotos/equipos/carreras.  
2. Sistema busca en Redis.  
3. Si no hay datos, consulta MongoDB, guarda y devuelve.

---

## 8. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Rendimiento
- Consultas optimizadas con desnormalización y Redis.  
- Redis acelera lecturas repetitivas.

### RNF-02: Disponibilidad
- La aplicación funciona sin Redis.  
- MongoDB es crítico.

### RNF-03: Escalabilidad
- Lecturas horizontales con caché.  
- Invalicación selectiva para coherencia.

### RNF-04: Mantenibilidad
- Middleware de caché reutilizable.  
- Métricas de aciertos y fallos de caché.

---

## 9. RESTRICCIONES Y VALIDACIONES
- Todos los campos obligatorios deben validarse antes de guardar.  
- IDs únicos por piloto, equipo y carrera.  
- Las fechas deben estar en formato ISO 8601.  
- Los puntos deben ser valores numéricos positivos.

---

## 10. ENDPOINTS COMPLETOS

### Drivers
- `POST /drivers`
- `GET /drivers`
- `GET /drivers/:id`
- `PUT /drivers/:id`
- `DELETE /drivers/:id`

### Teams
- `POST /teams`
- `GET /teams`
- `GET /teams/:id`
- `PUT /teams/:id`
- `DELETE /teams/:id`

### Races
- `POST /races`
- `GET /races`
- `GET /races/:id`
- `PUT /races/:id`
- `DELETE /races/:id`

### Standings
- `GET /standings/current`

### Health
- `GET /health`

---

## 11. ESTRUCTURA DE DATOS

### Ejemplo: Driver
```
{
  _id: ObjectId,
  name: String,
  number: Number (único),
  nationality: String,
  teamName: String (desnormalizado),
  teamId: ObjectId,
  team: {
    name: String (desnormalizado),
    country: String (desnormalizado),
    points: Number (desnormalizado)
  },
  points: Number,
  currentPosition: Number,
  createdAt: Date,
  updatedAt: Date
}
```
### Teamipt
```
{
  _id: ObjectId,
  name: String (único),
  country: String,
  points: Number,
  drivers: [{
    driverId: ObjectId,
    driverName: String (desnormalizado),
    driverPoints: Number (desnormalizado)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Race
```
{
  _id: ObjectId,
  name: String,
  circuit: String,
  date: Date,
  results: [{
    driverId: ObjectId,
    driverName: String (desnormalizado),
    teamName: String (desnormalizado),
    position: Number,
    points: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```
### Season
```
{
  _id: ObjectId,
  year: Number (único),
  races: [{
    raceId: ObjectId,
    raceName: String (desnormalizado),
    winnerName: String (desnormalizado)
  }],
  standings: [{
    driverId: ObjectId,
    driverName: String (desnormalizado),
    teamName: String (desnormalizado),
    points: Number,
    position: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Versión del Documento**: 1.0  
**Fecha**: 2025  
**Autor**: F1 Pro API Development Team
