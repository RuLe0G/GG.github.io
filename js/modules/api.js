import {Cache} from './cache.js';

class Api {
    static async fetchData(url, cacheKey = null) {
        if (cacheKey) {
            const cachedData = Cache.get(cacheKey);
            if (cachedData) return cachedData;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            if (cacheKey) Cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
    static clear() {
        try {
            Cache.clearAll();
        } catch (error) {
            console.error('clear all error:', error);
            throw error;
        }
    }
}

export default Api;
