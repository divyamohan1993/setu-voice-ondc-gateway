"use server";

/**
 * Smart Agriculture Actions
 * 
 * Server actions for the new smart agriculture features:
 * - Weather-based farming recommendations
 * - Crop health analysis using vision AI
 * 
 * These are KEY DIFFERENTIATORS for the AgriVox platform.
 * 
 * @module SmartAgricultureActions
 */

import { getWeatherData, getWeatherForVoice, type WeatherData } from "@/lib/weather-service";
import {
    analyzeCropHealth,
    getCropHealthVoiceResponse,
    getCropDiseaseInfo,
    type CropHealthAnalysis
} from "@/lib/crop-health-analyzer";

// ============================================================================
// Weather Actions
// ============================================================================

export interface WeatherActionResult {
    success: boolean;
    data?: WeatherData;
    voiceResponse?: string;
    error?: string;
}

/**
 * Get weather data and agricultural recommendations for a location
 */
export async function getWeatherAction(
    cityName: string,
    language: string = "en"
): Promise<WeatherActionResult> {
    try {
        // Get full weather data
        const data = await getWeatherData(cityName);

        // Generate voice-friendly response
        const voiceResponse = await getWeatherForVoice(cityName, language);

        return {
            success: true,
            data,
            voiceResponse,
        };
    } catch (error) {
        console.error("Weather action error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get weather data",
        };
    }
}

/**
 * Get irrigation recommendation based on weather
 */
export async function getIrrigationAdviceAction(
    cityName: string,
    cropType: string,
    language: string = "en"
): Promise<{ success: boolean; advice: string; shouldIrrigate: boolean }> {
    try {
        const weather = await getWeatherData(cityName);

        const shouldIrrigate = weather.agriculture.irrigationNeeded;

        // Crop-specific adjustments
        const waterIntensiveCrops = ["rice", "sugarcane", "banana"];
        const droughtResistantCrops = ["bajra", "jowar", "cotton"];

        const normalizedCrop = cropType.toLowerCase();
        let adjustedAdvice = weather.agriculture.irrigationReason;

        if (waterIntensiveCrops.some(c => normalizedCrop.includes(c))) {
            adjustedAdvice += ` Note: ${cropType} requires more water than average crops.`;
        } else if (droughtResistantCrops.some(c => normalizedCrop.includes(c))) {
            adjustedAdvice += ` Note: ${cropType} is drought-resistant, reduce irrigation frequency.`;
        }

        const advice = language === "hi"
            ? `${cityName} के लिए सिंचाई सलाह: ${adjustedAdvice}`
            : `Irrigation advice for ${cityName}: ${adjustedAdvice}`;

        return {
            success: true,
            advice,
            shouldIrrigate,
        };
    } catch (error) {
        console.error("Irrigation advice error:", error);
        return {
            success: false,
            advice: "Unable to get irrigation advice",
            shouldIrrigate: false,
        };
    }
}

// ============================================================================
// Crop Health Actions
// ============================================================================

export interface CropHealthActionResult {
    success: boolean;
    analysis?: CropHealthAnalysis;
    voiceResponse?: string;
    error?: string;
}

/**
 * Analyze crop health from an uploaded image
 */
export async function analyzeCropHealthAction(
    imageBase64: string,
    mimeType: string = "image/jpeg",
    cropContext?: string,
    language: string = "en"
): Promise<CropHealthActionResult> {
    try {
        // Analyze the image
        const analysis = await analyzeCropHealth(imageBase64, mimeType, cropContext);

        // Generate voice response
        const voiceResponse = await getCropHealthVoiceResponse(analysis, language);

        return {
            success: true,
            analysis,
            voiceResponse,
        };
    } catch (error) {
        console.error("Crop health action error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to analyze crop health",
        };
    }
}

/**
 * Get disease information for a specific crop (offline)
 */
export async function getCropDiseaseInfoAction(
    cropName: string
): Promise<{ success: boolean; diseases: any[]; error?: string }> {
    try {
        const diseases = getCropDiseaseInfo(cropName);

        return {
            success: true,
            diseases: diseases || [],
        };
    } catch (error) {
        console.error("Crop disease info error:", error);
        return {
            success: false,
            diseases: [],
            error: error instanceof Error ? error.message : "Failed to get disease info",
        };
    }
}

// ============================================================================
// Combined Smart Farming Actions
// ============================================================================

export interface SmartFarmingAdvice {
    weather: WeatherData;
    irrigationAdvice: string;
    sprayingAdvice: string;
    harvestAdvice: string;
    alerts: string[];
}

/**
 * Get comprehensive smart farming advice
 */
export async function getSmartFarmingAdviceAction(
    cityName: string,
    cropType: string,
    language: string = "en"
): Promise<{ success: boolean; advice?: SmartFarmingAdvice; error?: string }> {
    try {
        const weather = await getWeatherData(cityName);

        // Generate specific advice
        const irrigationAdvice = weather.agriculture.irrigationNeeded
            ? language === "hi"
                ? "आज सिंचाई करें - मिट्टी सूखी है"
                : "Irrigate today - soil is dry"
            : language === "hi"
                ? "सिंचाई की जरूरत नहीं"
                : "No irrigation needed";

        const sprayingAdvice = weather.agriculture.sprayingConditions === "good"
            ? language === "hi" ? "छिड़काव के लिए अच्छी स्थिति" : "Good conditions for spraying"
            : weather.agriculture.sprayingConditions === "moderate"
                ? language === "hi" ? "सावधानी से छिड़काव करें" : "Spray with caution"
                : language === "hi" ? "आज छिड़काव से बचें" : "Avoid spraying today";

        const harvestAdvice = weather.agriculture.harvestConditions === "good"
            ? language === "hi" ? "कटाई के लिए अच्छी स्थिति" : "Good conditions for harvest"
            : weather.agriculture.harvestConditions === "moderate"
                ? language === "hi" ? "कटाई में देरी करें" : "Delay harvest if possible"
                : language === "hi" ? "आज कटाई न करें" : "Do not harvest today";

        const alerts = weather.alerts.map(a =>
            language === "hi" ? a.recommendation : a.message
        );

        return {
            success: true,
            advice: {
                weather,
                irrigationAdvice,
                sprayingAdvice,
                harvestAdvice,
                alerts,
            },
        };
    } catch (error) {
        console.error("Smart farming advice error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get farming advice",
        };
    }
}
