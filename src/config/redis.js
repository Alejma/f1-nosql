const Redis = require('ioredis');

let redisClient;
let isRedisAvailable = false;

const connectRedis = () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    // Detect common Upstash host and ensure TLS (rediss) is used when needed
    let effectiveRedisUrl = redisUrl;
    try {
      const parsed = new URL(redisUrl);
      const host = parsed.hostname || '';
      // If host looks like upstash and protocol is plain redis, prefer rediss
      if (host.endsWith('upstash.io') && parsed.protocol === 'redis:') {
        effectiveRedisUrl = redisUrl.replace(/^redis:/, 'rediss:');
        console.log('ℹ️  Redis: detected Upstash host, switching to rediss:// for TLS');
      }
    } catch (e) {
      // ignore URL parse errors and use original
      effectiveRedisUrl = redisUrl;
    }
    
    redisClient = new Redis(effectiveRedisUrl, {
      retryStrategy: (times) => {
        // Si falla más de 10 veces, no reintentar más
        if (times > 10) {
          console.warn('⚠️  Redis: Se han agotado los reintentos. Redis no está disponible.');
          return null; // Dejar de reintentar
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false, // No hacer cola si está offline
      lazyConnect: true, // Conectar bajo demanda
      connectTimeout: 5000, // Timeout de 5 segundos
    });

    // If effective URL uses rediss scheme but client options need explicit TLS
    try {
      const parsed2 = new URL(effectiveRedisUrl);
      if (parsed2.protocol === 'rediss:') {
        // ioredis will use TLS for rediss://, but ensure we have tls option for environments
        redisClient.options.tls = redisClient.options.tls || {};
      }
    } catch (e) {
      // ignore
    }

    redisClient.on('connect', () => {
      console.log('✅ Conectado a Redis');
      isRedisAvailable = true;
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      // Solo mostrar error si es diferente a ECONNREFUSED (conexión rechazada)
      if (err.code !== 'ECONNREFUSED') {
        console.error('❌ Error en Redis:', err.message);
      } else {
        console.warn('⚠️  Redis no está disponible (conexión rechazada). La aplicación continuará sin Redis.');
      }
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
      console.warn('⚠️  Conexión a Redis cerrada');
    });

    // Intentar conectar, pero no bloquear si falla
    // Solo intentar conectar si no estamos en modo "lazyConnect"
    // El modo lazyConnect significa que se conectará cuando se necesite
    if (!redisClient.options.lazyConnect) {
      redisClient.connect().catch((err) => {
        isRedisAvailable = false;
        if (err.code !== 'ECONNREFUSED') {
          console.error('❌ Error conectando a Redis:', err.message);
        } else {
          console.warn('⚠️  Redis no está disponible. La aplicación continuará sin funcionalidades de Redis.');
        }
      });
    } else {
      // En modo lazyConnect, solo mostrar mensaje
      console.log('ℹ️  Redis configurado en modo lazyConnect (se conectará cuando se necesite)');
    }

    return redisClient;
  } catch (error) {
    console.error('❌ Error inicializando Redis:', error);
    isRedisAvailable = false;
    // Crear un cliente mock para evitar errores
    return createMockRedisClient();
  }
};

// Cliente mock para cuando Redis no está disponible
const createMockRedisClient = () => {
  return {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    on: () => {},
    connect: async () => {},
    disconnect: async () => {},
    quit: async () => {},
  };
};

// Inicializar conexión
if (!redisClient) {
  redisClient = connectRedis();
}

// Función helper para verificar si Redis está disponible
const isRedisConnected = () => isRedisAvailable;

module.exports = redisClient;
module.exports.isRedisConnected = isRedisConnected;

