const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      console.log('✅ Conectado a Redis');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Error en Redis:', err);
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Error inicializando Redis:', error);
    throw error;
  }
};

// Inicializar conexión
if (!redisClient) {
  redisClient = connectRedis();
}

module.exports = redisClient;

