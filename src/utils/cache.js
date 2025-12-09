const redisClient = require('../config/redis');

// TTL según requerimientos RF-REDIS-02
const TTL_LIST = 300; // 5 minutos para listados
const TTL_ITEM = 120; // 2 minutos para entidades individuales
const MAX_CACHE_SIZE = 512 * 1024; // 512KB límite según RF-REDIS-04

/**
 * Obtener datos del caché (patrón cache-aside)
 * @param {string} key - Clave de Redis
 * @returns {Promise<Object|null>} - Datos desde caché o null si no existe
 */
const getFromCache = async (key) => {
  try {
    if (!redisClient || typeof redisClient.get !== 'function') {
      return null;
    }
    
    const cached = await redisClient.get(key);
    if (!cached) {
      return null;
    }
    
    return JSON.parse(cached);
  } catch (error) {
    // No fallar si Redis tiene problemas
    console.warn(`⚠️ Error leyendo caché (${key}):`, error.message);
    return null;
  }
};

/**
 * Guardar datos en caché con TTL
 * @param {string} key - Clave de Redis
 * @param {Object} data - Datos a cachear
 * @param {number} ttl - Tiempo de vida en segundos
 * @returns {Promise<boolean>} - true si se cacheó exitosamente
 */
const setCache = async (key, data, ttl = TTL_ITEM) => {
  try {
    if (!redisClient || typeof redisClient.setex !== 'function') {
      return false;
    }
    
    const serialized = JSON.stringify(data);
    
    // Validar tamaño según RF-REDIS-04
    if (serialized.length > MAX_CACHE_SIZE) {
      console.warn(`⚠️ Datos demasiado grandes para cachear (${key}): ${serialized.length} bytes`);
      return false;
    }
    
    await redisClient.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    // No fallar si Redis tiene problemas
    console.warn(`⚠️ Error guardando en caché (${key}):`, error.message);
    return false;
  }
};

/**
 * Eliminar una clave del caché
 * @param {string} key - Clave de Redis a eliminar
 * @returns {Promise<boolean>} - true si se eliminó exitosamente
 */
const deleteCache = async (key) => {
  try {
    if (!redisClient || typeof redisClient.del !== 'function') {
      return false;
    }
    
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.warn(`⚠️ Error eliminando caché (${key}):`, error.message);
    return false;
  }
};

/**
 * Eliminar múltiples claves que coincidan con un patrón
 * @param {string} pattern - Patrón de claves (ej: 'standings:*')
 * @returns {Promise<number>} - Número de claves eliminadas
 */
const deleteCachePattern = async (pattern) => {
  try {
    if (!redisClient || typeof redisClient.keys !== 'function') {
      return 0;
    }
    
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    
    await redisClient.del(...keys);
    return keys.length;
  } catch (error) {
    console.warn(`⚠️ Error eliminando patrón de caché (${pattern}):`, error.message);
    return 0;
  }
};

/**
 * Implementación del patrón cache-aside para listados
 * @param {string} key - Clave de caché
 * @param {Function} fetchFunction - Función que obtiene datos de MongoDB
 * @returns {Promise<Object>} - Datos desde caché o MongoDB
 */
const cacheAsideList = async (key, fetchFunction) => {
  // Intentar obtener del caché
  const cached = await getFromCache(key);
  if (cached !== null) {
    return { data: cached, source: 'redis' };
  }
  
  // Si no está en caché, obtener de MongoDB
  const data = await fetchFunction();
  
  // Guardar en caché para próximas consultas
  await setCache(key, data, TTL_LIST);
  
  return { data, source: 'mongodb' };
};

/**
 * Implementación del patrón cache-aside para entidades individuales
 * @param {string} key - Clave de caché
 * @param {Function} fetchFunction - Función que obtiene datos de MongoDB
 * @returns {Promise<Object>} - Datos desde caché o MongoDB
 */
const cacheAsideItem = async (key, fetchFunction) => {
  // Intentar obtener del caché
  const cached = await getFromCache(key);
  if (cached !== null) {
    return { data: cached, source: 'redis' };
  }
  
  // Si no está en caché, obtener de MongoDB
  const data = await fetchFunction();
  
  // Guardar en caché para próximas consultas
  await setCache(key, data, TTL_ITEM);
  
  return { data, source: 'mongodb' };
};

module.exports = {
  getFromCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  cacheAsideList,
  cacheAsideItem,
  TTL_LIST,
  TTL_ITEM
};

