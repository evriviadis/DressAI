/**
 * Weather integration for outfit suggestions.
 * Uses ip-api.com for geolocation and OpenWeatherMap for weather data.
 */

export interface WeatherData {
    temp_celsius: number;
    feels_like: number;
    description: string;
    humidity: number;
    wind_speed: number;
    city: string;
    country: string;
}

interface IpApiResponse {
    lat: number;
    lon: number;
    city: string;
    country: string;
}

interface OwmResponse {
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
    };
    weather: { description: string }[];
    wind: { speed: number };
}

/**
 * Detect the user's location via IP geolocation and fetch current weather.
 * Returns null if either API call fails — the suggest flow should still work without weather.
 */
export async function getWeatherForUser(): Promise<WeatherData | null> {
    try {
        // Step 1: IP-based geolocation (no key required, 45 req/min)
        const geoRes = await fetch('http://ip-api.com/json/?fields=lat,lon,city,country', {
            signal: AbortSignal.timeout(5_000),
        });

        if (!geoRes.ok) {
            console.warn('[Weather] IP geolocation failed:', geoRes.status);
            return null;
        }

        const geo: IpApiResponse = await geoRes.json();

        if (!geo.lat || !geo.lon) {
            console.warn('[Weather] IP geolocation returned no coordinates');
            return null;
        }

        // Step 2: OpenWeatherMap Current Weather
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        if (!apiKey) {
            console.warn('[Weather] OPENWEATHERMAP_API_KEY not set — skipping weather');
            return null;
        }

        const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${geo.lat}&lon=${geo.lon}&units=metric&appid=${apiKey}`;
        const weatherRes = await fetch(owmUrl, {
            signal: AbortSignal.timeout(5_000),
        });

        if (!weatherRes.ok) {
            console.log(geo.lat + geo.lon);
            console.warn('[Weather] OpenWeatherMap failed:', weatherRes.status);
            return null;
        }

        const owm: OwmResponse = await weatherRes.json();

        const weather: WeatherData = {
            temp_celsius: Math.round(owm.main.temp),
            feels_like: Math.round(owm.main.feels_like),
            description: owm.weather?.[0]?.description ?? 'unknown',
            humidity: owm.main.humidity,
            wind_speed: Math.round(owm.wind.speed * 10) / 10,
            city: geo.city,
            country: geo.country,
        };

        console.log(`[Weather] ${weather.city}, ${weather.country}: ${weather.temp_celsius}°C, ${weather.description}`);
        return weather;
    } catch (err) {
        console.warn('[Weather] Failed to fetch weather data:', err);
        return null;
    }
}
