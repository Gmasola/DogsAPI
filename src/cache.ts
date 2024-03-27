// src/cache.ts
interface Cache {
    [key: string]: any;
  }
  
  let cache: Cache = {};
  
  export const getCachedData = (key: string): any => {
    return cache[key];
  };
  
  export const cacheData = (key: string, data: any): void => {
    cache[key] = data;
  };
  
  export const purgeCache = (key: string): void => {
    delete cache[key];
  };
  
  export const purgeCacheByStatus = (status: string): void => {
    for (const key in cache) {
      if (cache[key].status === status) {
        delete cache[key];
      }
    }
  };