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


### 1.3 Tecnologías
- **Backend**: Node.js con Express  
- **Base de Datos Principal**: MongoDB (Mongoose)  
- **Caché**: Redis (ioredis)  
- **Documentación**: Swagger/OpenAPI  
- **Arquitectura**: REST API  

---

#### RF-DRIVER-01: Crear Piloto
**Descripción**: El sistema debe permitir crear un nuevo piloto en la base de datos.

**Precondiciones**:
- Debe existir un equipo válido (teamId)
- El número del piloto debe ser único

**Datos de Entrada**:
- `name` (String, requerido): Nombre completo del piloto
- `number` (Number, requerido, único): Número del piloto
- `nationality` (String, requerido): Nacionalidad del piloto
- `teamId` (ObjectId, requerido): ID del equipo al que pertenece
- `points` (Number, opcional, default: 0): Puntos totales
- `currentPosition` (Number, opcional, default: 0): Posición actual en el campeonato

**Procesamiento**:
1. Validar que el equipo existe
2. Crear el piloto con información desnormalizada del equipo
3. Agregar el piloto al array de drivers del equipo
4. Recalcular puntos totales del equipo
5. Guardar información del equipo en el documento del piloto (team.name, team.country, team.points)

**Datos de Salida**:
- Piloto creado con toda su información incluyendo datos del equipo desnormalizados

**Endpoints**:
- `POST /drivers`

---

#### RF-DRIVER-02: Obtener Todos los Pilotos
**Descripción**: El sistema debe permitir obtener una lista de todos los pilotos.

**Procesamiento**:
1. Obtener todos los pilotos ordenados por puntos (descendente)
2. Verificar y actualizar información desnormalizada del equipo si es necesario
3. Retornar lista completa

**Datos de Salida**:
- Lista de pilotos con información completa del equipo desnormalizada

**Endpoints**:
- `GET /drivers`

---

#### RF-DRIVER-03: Obtener Piloto por ID
**Descripción**: El sistema debe permitir obtener la información de un piloto específico.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID del piloto

**Procesamiento**:
1. Buscar piloto por ID
2. Verificar y actualizar información desnormalizada del equipo si es necesario
3. Retornar información completa del piloto

**Datos de Salida**:
- Información completa del piloto con datos del equipo desnormalizados

**Endpoints**:
- `GET /drivers/:id`

---

#### RF-DRIVER-04: Actualizar Piloto
**Descripción**: El sistema debe permitir actualizar la información de un piloto.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID del piloto
- Campos a actualizar (opcionales):
  - `name`, `number`, `nationality`, `teamId`, `points`, `currentPosition`

**Procesamiento**:
1. Validar que el piloto existe
2. Si se actualiza `teamId`:
   - Validar que el nuevo equipo existe
   - Remover piloto del equipo anterior
   - Agregar piloto al nuevo equipo
   - Actualizar información desnormalizada del equipo
3. Si se actualizan `points`:
   - Actualizar puntos del piloto
   - Recalcular puntos del equipo
   - Actualizar información desnormalizada en el piloto
4. Sincronizar datos redundantes en todas las entidades relacionadas

**Datos de Salida**:
- Piloto actualizado con información sincronizada

**Endpoints**:
- `PUT /drivers/:id`

---

#### RF-DRIVER-05: Eliminar Piloto
**Descripción**: El sistema debe permitir eliminar un piloto de la base de datos.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID del piloto

**Procesamiento**:
1. Validar que el piloto existe
2. Remover piloto del equipo
3. Recalcular puntos del equipo
4. Eliminar piloto de la base de datos

**Datos de Salida**:
- Confirmación de eliminación

**Endpoints**:
- `DELETE /drivers/:id`

---

### 2.2 MÓDULO DE EQUIPOS (Teams)

#### RF-TEAM-01: Crear Equipo
**Descripción**: El sistema debe permitir crear un nuevo equipo.

**Datos de Entrada**:
- `name` (String, requerido, único): Nombre del equipo
- `country` (String, requerido): País de origen del equipo
- `points` (Number, opcional, default: 0): Puntos totales del equipo

**Procesamiento**:
1. Validar que el nombre del equipo es único
2. Crear el equipo
3. Inicializar array de drivers vacío

**Datos de Salida**:
- Equipo creado

**Endpoints**:
- `POST /teams`

---

#### RF-TEAM-02: Obtener Todos los Equipos
**Descripción**: El sistema debe permitir obtener una lista de todos los equipos.

**Procesamiento**:
1. Obtener todos los equipos ordenados por puntos (descendente)

**Datos de Salida**:
- Lista de equipos con sus pilotos y puntos

**Endpoints**:
- `GET /teams`

---

#### RF-TEAM-03: Obtener Equipo por ID
**Descripción**: El sistema debe permitir obtener la información de un equipo específico.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID del equipo

**Procesamiento**:
1. Buscar equipo por ID
2. Retornar información completa incluyendo lista de pilotos

**Datos de Salida**:
- Información completa del equipo con lista de pilotos

**Endpoints**:
- `GET /teams/:id`

---

#### RF-TEAM-04: Actualizar Equipo
**Descripción**: El sistema debe permitir actualizar la información de un equipo.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID del equipo
- Campos a actualizar (opcionales): `name`, `country`, `points`

**Procesamiento**:
1. Validar que el equipo existe
2. Actualizar campos del equipo
3. Sincronizar información en todos los pilotos del equipo (actualizar datos desnormalizados)

**Datos de Salida**:
- Equipo actualizado con información sincronizada

**Endpoints**:
- `PUT /teams/:id`

---

#### RF-TEAM-05: Eliminar Equipo
**Descripción**: El sistema debe permitir eliminar un equipo de la base de datos.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID del equipo

**Procesamiento**:
1. Validar que el equipo existe
2. Eliminar equipo de la base de datos

**Datos de Salida**:
- Confirmación de eliminación

**Endpoints**:
- `DELETE /teams/:id`

---

### 2.3 MÓDULO DE CARRERAS (Races)

#### RF-RACE-01: Registrar Carrera
**Descripción**: El sistema debe permitir registrar una nueva carrera con sus resultados.

**Datos de Entrada**:
- `name` (String, requerido): Nombre del Gran Premio
- `circuit` (String, requerido): Nombre del circuito
- `date` (Date, requerido): Fecha y hora de la carrera
- `results` (Array, opcional): Array de resultados con:
  - `driverId` (ObjectId, requerido): ID del piloto
  - `position` (Number, requerido): Posición final
  - `points` (Number, requerido): Puntos obtenidos

**Procesamiento**:
1. Validar que todos los pilotos en los resultados existen
2. Crear la carrera con información desnormalizada de pilotos (nombre y equipo)
3. Agregar la carrera a la temporada correspondiente (año de la fecha)
4. Actualizar puntos de los pilotos
5. Actualizar standings de la temporada
6. Reordenar posiciones en los standings
7. Identificar y guardar el ganador de la carrera

**Datos de Salida**:
- Carrera creada con resultados completos

**Endpoints**:
- `POST /races`

---

#### RF-RACE-02: Obtener Todas las Carreras
**Descripción**: El sistema debe permitir obtener una lista de todas las carreras.

**Procesamiento**:
1. Obtener todas las carreras ordenadas por fecha (descendente)

**Datos de Salida**:
- Lista de carreras con resultados completos

**Endpoints**:
- `GET /races`

---

#### RF-RACE-03: Obtener Carrera por ID
**Descripción**: El sistema debe permitir obtener la información de una carrera específica.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID de la carrera

**Procesamiento**:
1. Buscar carrera por ID
2. Retornar información completa con resultados

**Datos de Salida**:
- Información completa de la carrera con resultados

**Endpoints**:
- `GET /races/:id`

---

#### RF-RACE-04: Actualizar Carrera
**Descripción**: El sistema debe permitir actualizar la información de una carrera.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID de la carrera
- Campos a actualizar: `name`, `circuit`, `date`, `results`

**Procesamiento**:
1. Validar que la carrera existe
2. Validar que los pilotos en los resultados existen
3. Actualizar información desnormalizada de pilotos
4. Actualizar la carrera

**Datos de Salida**:
- Carrera actualizada

**Endpoints**:
- `PUT /races/:id`

---

#### RF-RACE-05: Eliminar Carrera
**Descripción**: El sistema debe permitir eliminar una carrera de la base de datos.

**Datos de Entrada**:
- `id` (ObjectId, requerido): ID de la carrera

**Procesamiento**:
1. Validar que la carrera existe
2. Eliminar carrera de la base de datos

**Datos de Salida**:
- Confirmación de eliminación

**Endpoints**:
- `DELETE /races/:id`

---


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

#### RF-SEASON-01: Gestión Automática de Temporadas
**Descripción**: El sistema debe gestionar automáticamente las temporadas basándose en el año de las carreras.

**Procesamiento**:
1. Al registrar una carrera, identificar el año de la fecha
2. Buscar o crear la temporada correspondiente al año
3. Agregar la carrera a la temporada con información desnormalizada:
   - `raceId`: ID de la carrera
   - `raceName`: Nombre de la carrera (desnormalizado)
   - `winnerName`: Nombre del ganador (desnormalizado)
4. Actualizar standings de la temporada con información desnormalizada:
   - `driverId`: ID del piloto
   - `driverName`: Nombre del piloto (desnormalizado)
   - `teamName`: Nombre del equipo (desnormalizado)
   - `points`: Puntos acumulados
   - `position`: Posición en el campeonato
5. Reordenar standings por puntos (descendente)
6. Actualizar posiciones numéricas

---

## 3. REQUERIMIENTOS DE DESNORMALIZACIÓN

### RF-DENORM-01: Desnormalización en Pilotos
**Descripción**: El sistema debe almacenar información del equipo directamente en el documento del piloto.

**Datos Desnormalizados**:
- `teamName`: Nombre del equipo (String)
- `team.name`: Nombre del equipo (String)
- `team.country`: País del equipo (String)
- `team.points`: Puntos totales del equipo (Number)

**Procesamiento**:
- Al crear un piloto, se debe guardar información completa del equipo
- Al actualizar un equipo, se debe actualizar información en todos sus pilotos
- Al obtener un piloto, se debe verificar y actualizar información desnormalizada si es necesario

---

### RF-DENORM-02: Desnormalización en Equipos
**Descripción**: El sistema debe almacenar información de los pilotos directamente en el documento del equipo.

**Datos Desnormalizados**:
- `drivers[].driverId`: ID del piloto (ObjectId)
- `drivers[].driverName`: Nombre del piloto (String)
- `drivers[].driverPoints`: Puntos del piloto (Number)

**Procesamiento**:
- Al crear un piloto, se debe agregar al array de drivers del equipo
- Al actualizar un piloto, se debe actualizar información en el equipo
- Los puntos del equipo se calculan automáticamente sumando los puntos de sus pilotos

---

### RF-DENORM-03: Desnormalización en Carreras
**Descripción**: El sistema debe almacenar información de pilotos directamente en los resultados de la carrera.

**Datos Desnormalizados**:
- `results[].driverId`: ID del piloto (ObjectId)
- `results[].driverName`: Nombre del piloto (String)
- `results[].teamName`: Nombre del equipo (String)

**Procesamiento**:
- Al registrar una carrera, se debe guardar nombre del piloto y equipo en cada resultado
- Al actualizar un piloto, se debe actualizar información en todas las carreras donde aparezca

---

### RF-DENORM-04: Desnormalización en Temporadas
**Descripción**: El sistema debe almacenar información desnormalizada en las temporadas.

**Datos Desnormalizados**:
- `races[].raceId`: ID de la carrera (ObjectId)
- `races[].raceName`: Nombre de la carrera (String)
- `races[].winnerName`: Nombre del ganador (String)
- `standings[].driverId`: ID del piloto (ObjectId)
- `standings[].driverName`: Nombre del piloto (String)
- `standings[].teamName`: Nombre del equipo (String)
- `standings[].points`: Puntos acumulados (Number)
- `standings[].position`: Posición en el campeonato (Number)

**Procesamiento**:
- Al registrar una carrera, se debe actualizar la temporada con información desnormalizada
- Al actualizar un piloto, se debe actualizar información en todas las temporadas donde aparezca

---

## 4. REQUERIMIENTOS DE SINCRONIZACIÓN

### RF-SYNC-01: Sincronización Automática de Datos de Pilotos
**Descripción**: El sistema debe sincronizar automáticamente los datos redundantes cuando se actualiza un piloto.

**Funciones de Sincronización**:
- `updateDriverInTeams()`: Actualiza datos del piloto en su equipo
- `updateDriverInRaces()`: Actualiza datos del piloto en todas las carreras
- `updateDriverInSeason()`: Actualiza datos del piloto en todas las temporadas
- `syncDriverData()`: Ejecuta todas las sincronizaciones de un piloto

**Disparadores**:
- Al actualizar puntos de un piloto
- Al cambiar el equipo de un piloto
- Al actualizar nombre de un piloto

---

### RF-SYNC-02: Sincronización Automática de Datos de Equipos
**Descripción**: El sistema debe sincronizar automáticamente los datos redundantes cuando se actualiza un equipo.

**Funciones de Sincronización**:
- `updateTeamInDrivers()`: Actualiza datos del equipo en todos sus pilotos
- `syncTeamData()`: Ejecuta todas las sincronizaciones de un equipo

**Disparadores**:
- Al actualizar nombre de un equipo
- Al actualizar país de un equipo
- Al actualizar puntos de un equipo

---

### RF-SYNC-03: Actualización de Puntos del Equipo
**Descripción**: El sistema debe recalcular automáticamente los puntos totales de un equipo.

**Procesamiento**:
- Los puntos del equipo se calculan sumando los puntos de todos sus pilotos
- Se debe actualizar tanto en el documento del equipo como en la información desnormalizada de los pilotos

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

### RF-TECH-01: API REST
**Descripción**: El sistema debe implementar una API REST estándar.

**Requerimientos**:
- Endpoints RESTful
- Códigos de estado HTTP apropiados
- Respuestas en formato JSON
- Manejo de errores consistente

---

### RF-TECH-02: Documentación Swagger
**Descripción**: El sistema debe incluir documentación interactiva con Swagger.

**Requerimientos**:
- Documentación disponible en `/api-docs`
- Esquemas de datos documentados
- Ejemplos de requests y responses
- Posibilidad de probar endpoints desde la interfaz

---

### RF-TECH-03: Validación de Datos
**Descripción**: El sistema debe validar todos los datos de entrada.

**Requerimientos**:
- Validación de campos requeridos
- Validación de tipos de datos
- Validación de referencias (IDs existentes)
- Validación de valores únicos
- Mensajes de error descriptivos

---

### RF-TECH-04: Manejo de Errores
**Descripción**: El sistema debe manejar errores de manera consistente.

**Requerimientos**:
- Códigos de estado HTTP apropiados
- Mensajes de error descriptivos
- Logging de errores
- Respuestas de error en formato JSON

---

### RF-TECH-05: Índices en Base de Datos
**Descripción**: El sistema debe utilizar índices para optimizar consultas.

**Índices Requeridos**:
- Driver: `teamId`, `points` (descendente), `name`, `number` (único)
- Team: `points` (descendente), `name` (único)
- Race: `date` (descendente), `name`
- Season: `year` (único)

---

## 7. CASOS DE USO

### CU-01: Crear Piloto con Equipo
1. Usuario crea un equipo
2. Usuario crea un piloto asignándolo al equipo
3. Sistema valida que el equipo existe
4. Sistema crea el piloto con información desnormalizada del equipo
5. Sistema agrega el piloto al equipo
6. Sistema recalcula puntos del equipo

---

### CU-02: Registrar Carrera y Actualizar Standings
1. Usuario registra una carrera con resultados
2. Sistema valida que todos los pilotos existen
3. Sistema crea la carrera con información desnormalizada
4. Sistema actualiza puntos de los pilotos
5. Sistema actualiza o crea la temporada correspondiente
6. Sistema actualiza standings de la temporada
7. Sistema reordena posiciones en los standings

---

### CU-03: Actualizar Puntos de un Piloto
1. Usuario actualiza puntos de un piloto
2. Sistema actualiza puntos del piloto
3. Sistema recalcula puntos del equipo
4. Sistema sincroniza datos en todas las carreras donde aparece el piloto
5. Sistema sincroniza datos en todas las temporadas donde aparece el piloto
6. Sistema actualiza información desnormalizada en el equipo

---

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
- Las consultas de lectura deben ser rápidas gracias a la desnormalización
- Redis debe proporcionar datos en tiempo real con latencia mínima
- Las operaciones de sincronización no deben bloquear las respuestas

### RNF-02: Disponibilidad
- La aplicación debe funcionar aunque Redis no esté disponible
- MongoDB es crítico para la funcionalidad básica
- Redis es opcional para funcionalidades en tiempo real

### RNF-03: Escalabilidad
- La estructura desnormalizada permite escalar lecturas
- Redis permite manejar múltiples consultas concurrentes
- Los índices optimizan las consultas frecuentes

### RNF-04: Mantenibilidad
- Código modular y bien estructurado
- Funciones de sincronización reutilizables
- Documentación completa (Swagger)

---

## 9. RESTRICCIONES Y VALIDACIONES

### REST-01: Unicidad
- El número de piloto debe ser único
- El nombre del equipo debe ser único
- El año de temporada debe ser único

### REST-02: Referencias
- Un piloto debe pertenecer a un equipo válido
- Los resultados de carrera deben referenciar pilotos válidos
- Las temporadas deben referenciar carreras válidas

### REST-03: Integridad de Datos
- Los puntos no pueden ser negativos
- Las posiciones deben ser números positivos
- Las fechas deben ser válidas

---

## 10. ENDPOINTS COMPLETOS

### Drivers
- `POST /drivers` - Crear piloto
- `GET /drivers` - Obtener todos los pilotos
- `GET /drivers/:id` - Obtener piloto por ID
- `PUT /drivers/:id` - Actualizar piloto
- `DELETE /drivers/:id` - Eliminar piloto

### Teams
- `POST /teams` - Crear equipo
- `GET /teams` - Obtener todos los equipos
- `GET /teams/:id` - Obtener equipo por ID
- `PUT /teams/:id` - Actualizar equipo
- `DELETE /teams/:id` - Eliminar equipo

### Races
- `POST /races` - Registrar carrera
- `GET /races` - Obtener todas las carreras
- `GET /races/:id` - Obtener carrera por ID
- `PUT /races/:id` - Actualizar carrera
- `DELETE /races/:id` - Eliminar carrera

### Standings
- `GET /standings/current` - Obtener standings actuales
- `PUT /standings/leaderboard` - Actualizar leaderboard

### Health
- `GET /health` - Verificar estado del servidor

---

## 11. ESTRUCTURA DE DATOS

### Driver
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

**Versión del Documento**: 2.0  
**Fecha**: 2025  
**Autor**: F1 Pro API Development Team
