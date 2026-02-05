/**
 * Weather Service - Real-time Agricultural Weather Data
 * 
 * Provides weather-based farming recommendations using OpenWeatherMap API.
 * This is a KEY DIFFERENTIATOR from the original project - adds IoT/environmental
 * intelligence for smart agriculture decisions.
 * 
 * Features:
 * - Current weather conditions
 * - 5-day forecast for crop planning
 * - Agricultural alerts (frost, heat stress, rain)
 * - Irrigation recommendations based on precipitation
 * 
 * @module WeatherService
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export const WeatherDataSchema = z.object({
    location: z.object({
        city: z.string(),
        state: z.string().optional(),
        country: z.string(),
        lat: z.number(),
        lon: z.number(),
    }),
    current: z.object({
        temperature: z.number(), // Celsius
        feelsLike: z.number(),
        humidity: z.number(), // Percentage
        windSpeed: z.number(), // m/s
        windDirection: z.string(),
        description: z.string(),
        icon: z.string(),
        pressure: z.number(), // hPa
        visibility: z.number(), // meters
        uvIndex: z.number().optional(),
    }),
    forecast: z.array(z.object({
        date: z.string(),
        tempMin: z.number(),
        tempMax: z.number(),
        humidity: z.number(),
        precipitation: z.number(), // mm
        description: z.string(),
        icon: z.string(),
    })),
    alerts: z.array(z.object({
        type: z.enum(["frost", "heat", "rain", "storm", "drought", "wind"]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        message: z.string(),
        recommendation: z.string(),
    })),
    agriculture: z.object({
        irrigationNeeded: z.boolean(),
        irrigationReason: z.string(),
        sprayingConditions: z.enum(["good", "moderate", "poor"]),
        harvestConditions: z.enum(["good", "moderate", "poor"]),
        soilMoistureEstimate: z.enum(["dry", "optimal", "wet", "saturated"]),
        cropStressRisk: z.enum(["low", "moderate", "high"]),
    }),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

// ============================================================================
// Weather Service
// ============================================================================

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Major Indian agricultural regions with coordinates
const MANDI_LOCATIONS: Record<string, { lat: number; lon: number; state: string }> = {
    "Delhi": { lat: 28.6139, lon: 77.2090, state: "Delhi" },
    "Mumbai": { lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
    "Pune": { lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
    "Nashik": { lat: 19.9975, lon: 73.7898, state: "Maharashtra" },
    "Nagpur": { lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
    "Lucknow": { lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
    "Kanpur": { lat: 26.4499, lon: 80.3319, state: "Uttar Pradesh" },
    "Varanasi": { lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
    "Jaipur": { lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
    "Ahmedabad": { lat: 23.0225, lon: 72.5714, state: "Gujarat" },
    "Surat": { lat: 21.1702, lon: 72.8311, state: "Gujarat" },
    "Indore": { lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
    "Bhopal": { lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
    "Chennai": { lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
    "Coimbatore": { lat: 11.0168, lon: 76.9558, state: "Tamil Nadu" },
    "Bangalore": { lat: 12.9716, lon: 77.5946, state: "Karnataka" },
    "Hyderabad": { lat: 17.3850, lon: 78.4867, state: "Telangana" },
    "Kolkata": { lat: 22.5726, lon: 88.3639, state: "West Bengal" },
    "Patna": { lat: 25.5941, lon: 85.1376, state: "Bihar" },
    "Chandigarh": { lat: 30.7333, lon: 76.7794, state: "Punjab" },
    "Amritsar": { lat: 31.6340, lon: 74.8723, state: "Punjab" },
    "Ludhiana": { lat: 30.9010, lon: 75.8573, state: "Punjab" },
};

/**
 * Get weather data for a specific city/region
 */
export async function getWeatherData(cityName: string): Promise<WeatherData> {
    // Find matching location
    const normalizedCity = Object.keys(MANDI_LOCATIONS).find(
        city => city.toLowerCase() === cityName.toLowerCase()
    );

    const location = normalizedCity
        ? MANDI_LOCATIONS[normalizedCity]
        : { lat: 28.6139, lon: 77.2090, state: "Delhi" }; // Default to Delhi

    const cityDisplay = normalizedCity || cityName;

    // If no API key, return simulated data
    if (!OPENWEATHERMAP_API_KEY) {
        return generateSimulatedWeather(cityDisplay, location);
    }

    try {
        // Fetch current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
        );

        if (!currentResponse.ok) {
            throw new Error("Weather API request failed");
        }

        const currentData = await currentResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
        );

        const forecastData = await forecastResponse.json();

        return processWeatherResponse(cityDisplay, location, currentData, forecastData);
    } catch (error) {
        console.error("Weather API error:", error);
        return generateSimulatedWeather(cityDisplay, location);
    }
}

/**
 * Process OpenWeatherMap API response
 */
function processWeatherResponse(
    city: string,
    location: { lat: number; lon: number; state: string },
    current: any,
    forecast: any
): WeatherData {
    const windDirection = getWindDirection(current.wind?.deg || 0);

    // Process forecast - get daily summaries
    const dailyForecast = processDailyForecast(forecast.list || []);

    // Generate agricultural alerts
    const alerts = generateAgriculturalAlerts(current, dailyForecast);

    // Generate agriculture recommendations
    const agriculture = generateAgricultureRecommendations(current, dailyForecast);

    return {
        location: {
            city,
            state: location.state,
            country: "India",
            lat: location.lat,
            lon: location.lon,
        },
        current: {
            temperature: Math.round(current.main?.temp || 25),
            feelsLike: Math.round(current.main?.feels_like || 25),
            humidity: current.main?.humidity || 60,
            windSpeed: current.wind?.speed || 3,
            windDirection,
            description: current.weather?.[0]?.description || "Clear sky",
            icon: current.weather?.[0]?.icon || "01d",
            pressure: current.main?.pressure || 1013,
            visibility: current.visibility || 10000,
            uvIndex: current.uvi,
        },
        forecast: dailyForecast,
        alerts,
        agriculture,
    };
}

/**
 * Process hourly forecast into daily summaries
 */
function processDailyForecast(hourlyList: any[]): WeatherData["forecast"] {
    const dailyMap = new Map<string, any[]>();

    hourlyList.forEach((item: any) => {
        const date = item.dt_txt?.split(" ")[0] || new Date().toISOString().split("T")[0];
        if (!dailyMap.has(date)) {
            dailyMap.set(date, []);
        }
        dailyMap.get(date)?.push(item);
    });

    const forecast: WeatherData["forecast"] = [];

    dailyMap.forEach((items, date) => {
        const temps = items.map((i: any) => i.main?.temp || 25);
        const humidities = items.map((i: any) => i.main?.humidity || 60);
        const precipitations = items.map((i: any) => (i.rain?.["3h"] || 0) + (i.snow?.["3h"] || 0));

        forecast.push({
            date,
            tempMin: Math.round(Math.min(...temps)),
            tempMax: Math.round(Math.max(...temps)),
            humidity: Math.round(humidities.reduce((a: number, b: number) => a + b, 0) / humidities.length),
            precipitation: Math.round(precipitations.reduce((a: number, b: number) => a + b, 0) * 10) / 10,
            description: items[Math.floor(items.length / 2)]?.weather?.[0]?.description || "Clear",
            icon: items[Math.floor(items.length / 2)]?.weather?.[0]?.icon || "01d",
        });
    });

    return forecast.slice(0, 5);
}

/**
 * Generate agricultural alerts based on weather conditions
 */
function generateAgriculturalAlerts(current: any, forecast: WeatherData["forecast"]): WeatherData["alerts"] {
    const alerts: WeatherData["alerts"] = [];
    const temp = current.main?.temp || 25;
    const humidity = current.main?.humidity || 60;
    const windSpeed = current.wind?.speed || 3;

    // Frost alert
    if (temp < 5) {
        alerts.push({
            type: "frost",
            severity: temp < 0 ? "critical" : "high",
            message: `Low temperature warning: ${Math.round(temp)}°C`,
            recommendation: "Cover sensitive crops with frost cloth. Delay irrigation to prevent ice formation.",
        });
    }

    // Heat stress alert
    if (temp > 38) {
        alerts.push({
            type: "heat",
            severity: temp > 42 ? "critical" : "high",
            message: `Extreme heat warning: ${Math.round(temp)}°C`,
            recommendation: "Increase irrigation frequency. Provide shade for livestock. Avoid field work during peak hours.",
        });
    }

    // Rain forecast alert
    const upcomingRain = forecast.filter(f => f.precipitation > 10);
    if (upcomingRain.length > 0) {
        const totalRain = upcomingRain.reduce((sum, f) => sum + f.precipitation, 0);
        alerts.push({
            type: "rain",
            severity: totalRain > 50 ? "high" : "medium",
            message: `Rain expected: ${Math.round(totalRain)}mm in next ${upcomingRain.length} days`,
            recommendation: "Delay harvesting if possible. Prepare drainage systems. Postpone pesticide application.",
        });
    }

    // High wind alert
    if (windSpeed > 10) {
        alerts.push({
            type: "wind",
            severity: windSpeed > 15 ? "high" : "medium",
            message: `High wind alert: ${Math.round(windSpeed)} m/s`,
            recommendation: "Secure greenhouse covers. Delay spraying operations. Support tall crops.",
        });
    }

    // Drought conditions
    const noRainDays = forecast.filter(f => f.precipitation < 1).length;
    if (noRainDays >= 4 && humidity < 40) {
        alerts.push({
            type: "drought",
            severity: noRainDays === 5 ? "high" : "medium",
            message: `Dry conditions expected for ${noRainDays} days`,
            recommendation: "Plan irrigation schedule. Mulch around plants to retain moisture. Consider drought-resistant varieties.",
        });
    }

    return alerts;
}

/**
 * Generate agriculture-specific recommendations
 */
function generateAgricultureRecommendations(current: any, forecast: WeatherData["forecast"]): WeatherData["agriculture"] {
    const temp = current.main?.temp || 25;
    const humidity = current.main?.humidity || 60;
    const windSpeed = current.wind?.speed || 3;
    const upcomingRain = forecast.reduce((sum, f) => sum + f.precipitation, 0);

    // Irrigation decision
    const irrigationNeeded = humidity < 50 && upcomingRain < 5;
    const irrigationReason = irrigationNeeded
        ? `Low humidity (${humidity}%) and minimal rain expected (${Math.round(upcomingRain)}mm)`
        : upcomingRain > 10
            ? `Rain expected (${Math.round(upcomingRain)}mm) - delay irrigation`
            : `Current moisture levels adequate`;

    // Spraying conditions
    let sprayingConditions: "good" | "moderate" | "poor" = "good";
    if (windSpeed > 8 || upcomingRain > 5) {
        sprayingConditions = "poor";
    } else if (windSpeed > 5 || temp > 35 || humidity > 80) {
        sprayingConditions = "moderate";
    }

    // Harvest conditions
    let harvestConditions: "good" | "moderate" | "poor" = "good";
    if (upcomingRain > 20 || humidity > 85) {
        harvestConditions = "poor";
    } else if (upcomingRain > 10 || humidity > 70) {
        harvestConditions = "moderate";
    }

    // Soil moisture estimate
    let soilMoistureEstimate: "dry" | "optimal" | "wet" | "saturated" = "optimal";
    if (humidity < 40 && upcomingRain < 5) {
        soilMoistureEstimate = "dry";
    } else if (upcomingRain > 30) {
        soilMoistureEstimate = "saturated";
    } else if (upcomingRain > 15 || humidity > 80) {
        soilMoistureEstimate = "wet";
    }

    // Crop stress risk
    let cropStressRisk: "low" | "moderate" | "high" = "low";
    if (temp > 40 || temp < 5 || humidity < 30) {
        cropStressRisk = "high";
    } else if (temp > 35 || temp < 10 || humidity < 40 || windSpeed > 10) {
        cropStressRisk = "moderate";
    }

    return {
        irrigationNeeded,
        irrigationReason,
        sprayingConditions,
        harvestConditions,
        soilMoistureEstimate,
        cropStressRisk,
    };
}

/**
 * Generate simulated weather data when API is unavailable
 */
function generateSimulatedWeather(
    city: string,
    location: { lat: number; lon: number; state: string }
): WeatherData {
    // Seasonal variation based on current month
    const month = new Date().getMonth();
    const isWinter = month >= 10 || month <= 1;
    const isMonsoon = month >= 5 && month <= 9;
    const isSummer = month >= 2 && month <= 4;

    const baseTemp = isWinter ? 18 : isSummer ? 35 : 28;
    const baseHumidity = isMonsoon ? 80 : isWinter ? 45 : 55;
    const basePrecipitation = isMonsoon ? 25 : isWinter ? 0 : 5;

    const temp = baseTemp + (Math.random() * 6 - 3);
    const humidity = baseHumidity + (Math.random() * 20 - 10);

    const forecast: WeatherData["forecast"] = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        forecast.push({
            date: date.toISOString().split("T")[0],
            tempMin: Math.round(temp - 5 + Math.random() * 4),
            tempMax: Math.round(temp + 5 + Math.random() * 4),
            humidity: Math.round(humidity + (Math.random() * 10 - 5)),
            precipitation: Math.round(basePrecipitation * Math.random() * 10) / 10,
            description: isMonsoon ? "Scattered showers" : isWinter ? "Clear sky" : "Partly cloudy",
            icon: isMonsoon ? "10d" : "01d",
        });
    }

    const current = {
        temperature: Math.round(temp),
        feelsLike: Math.round(temp + 2),
        humidity: Math.round(humidity),
        windSpeed: Math.round(3 + Math.random() * 5),
        windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
        description: isMonsoon ? "Light rain" : isWinter ? "Clear sky" : "Sunny",
        icon: isMonsoon ? "10d" : "01d",
        pressure: 1013 + Math.floor(Math.random() * 10 - 5),
        visibility: 10000,
        uvIndex: isSummer ? 9 : 5,
    };

    const alerts = generateAgriculturalAlerts({ main: { temp, humidity }, wind: { speed: current.windSpeed } }, forecast);
    const agriculture = generateAgricultureRecommendations({ main: { temp, humidity }, wind: { speed: current.windSpeed } }, forecast);

    return {
        location: {
            city,
            state: location.state,
            country: "India",
            lat: location.lat,
            lon: location.lon,
        },
        current,
        forecast,
        alerts,
        agriculture,
    };
}

/**
 * Convert wind degrees to direction
 */
function getWindDirection(degrees: number): string {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

/**
 * Get weather for voice response (simplified for TTS)
 */
export async function getWeatherForVoice(cityName: string, language: string = "en"): Promise<string> {
    const weather = await getWeatherData(cityName);

    const translations: Record<string, Record<string, string>> = {
        en: {
            weather: "Weather in",
            temp: "Temperature is",
            humidity: "Humidity is",
            irrigation: "Irrigation",
            needed: "is recommended",
            notNeeded: "is not needed",
        },
        hi: {
            weather: "में मौसम",
            temp: "तापमान है",
            humidity: "आर्द्रता है",
            irrigation: "सिंचाई",
            needed: "की सिफारिश है",
            notNeeded: "की जरूरत नहीं है",
        },
    };

    const t = translations[language] || translations.en;

    const irrigationStatus = weather.agriculture.irrigationNeeded
        ? `${t.irrigation} ${t.needed}`
        : `${t.irrigation} ${t.notNeeded}`;

    if (language === "hi") {
        return `${weather.location.city} ${t.weather}। ${t.temp} ${weather.current.temperature} डिग्री, ${t.humidity} ${weather.current.humidity} प्रतिशत। ${irrigationStatus}।`;
    }

    return `${t.weather} ${weather.location.city}: ${t.temp} ${weather.current.temperature}°C, ${t.humidity} ${weather.current.humidity}%. ${irrigationStatus}.`;
}
