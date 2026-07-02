const CACHE_VERSION = "1.0.0";

export class Cache {
    static checkVersion() {
        const current = localStorage.getItem("cacheVersion");

        if (current !== CACHE_VERSION) {
            localStorage.clear();
            localStorage.setItem("cacheVersion", CACHE_VERSION);

            console.log("[Cache] Кэш очищен.");
        }
    }
    static get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Ошибка при получении кэша для ${key}:`, error);
            return null;
        }
    }

    static set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn(`Не удалось кэшировать данные для ключа "${key}": ${error.message}`);
        }
    }

    static clear(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Ошибка при очистке кэша для ${key}:`, error);
        }
    }
    static clearAll() {
        try {
            localStorage.clear();
            console.log('[Cache] Пользовательский кэш успешно очищен!');
        } catch (error) {
            console.error('Ошибка при полной очистке кэша:', error);
        }
    }
}
