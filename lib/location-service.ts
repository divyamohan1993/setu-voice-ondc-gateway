/**
 * Location Service
 * 
 * Provides real location-based services using Google Maps API.
 * Finds the nearest mandi from the user's current location.
 * 
 * REAL IMPLEMENTATION - No Simulation
 * 
 * @module location-service
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Mandi location with coordinates
 */
export interface MandiLocation {
    name: string;
    state: string;
    district: string;
    coordinates?: Coordinates;
    distanceKm?: number;
    durationMinutes?: number;
}

/**
 * Distance calculation result from Google Maps
 */
interface DistanceResult {
    destination: string;
    distanceKm: number;
    durationMinutes: number;
}

/**
 * Cache for mandi locations to avoid repeated API calls
 */
let mandiLocationsCache: MandiLocation[] = [];
let cacheTimestamp: Date | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch all available mandis from data.gov.in
 * This gets the list of all mandis/markets from the government API
 */
export async function fetchAllMandisFromGovAPI(): Promise<MandiLocation[]> {
    const apiKey = process.env.DATA_GOV_IN_API_KEY;

    // Check cache first
    if (mandiLocationsCache.length > 0 && cacheTimestamp) {
        const cacheAge = Date.now() - cacheTimestamp.getTime();
        if (cacheAge < CACHE_DURATION_MS) {
            console.log(`[LOCATION] Using cached mandi list (${mandiLocationsCache.length} mandis)`);
            return mandiLocationsCache;
        }
    }

    if (!apiKey) {
        console.warn("[LOCATION] DATA_GOV_IN_API_KEY not set, using default mandi list");
        return getDefaultMandiList();
    }

    try {
        console.log("[LOCATION] Fetching all mandis from data.gov.in...");

        // Fetch unique markets from the API
        const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
        const apiUrl = new URL(`https://api.data.gov.in/resource/${resourceId}`);
        apiUrl.searchParams.set("api-key", apiKey);
        apiUrl.searchParams.set("format", "json");
        apiUrl.searchParams.set("limit", "500"); // Get more records to extract unique markets

        const response = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (!data.records || data.records.length === 0) {
            console.warn("[LOCATION] No records from API, using default mandi list");
            return getDefaultMandiList();
        }

        // Extract unique markets
        const uniqueMarkets = new Map<string, MandiLocation>();

        for (const record of data.records) {
            const key = `${record.market}-${record.state}`;
            if (!uniqueMarkets.has(key) && record.market && record.state) {
                uniqueMarkets.set(key, {
                    name: record.market,
                    state: record.state,
                    district: record.district || ""
                });
            }
        }

        mandiLocationsCache = Array.from(uniqueMarkets.values());
        cacheTimestamp = new Date();

        console.log(`[LOCATION] Fetched ${mandiLocationsCache.length} unique mandis from government API`);
        return mandiLocationsCache;

    } catch (error) {
        console.error("[LOCATION] Failed to fetch mandis from API:", error);
        return getDefaultMandiList();
    }
}

/**
 * Get default mandi list when API is unavailable
 */
function getDefaultMandiList(): MandiLocation[] {
    return [
        { name: "Lasalgaon", state: "Maharashtra", district: "Nasik" },
        { name: "Vashi", state: "Maharashtra", district: "Mumbai" },
        { name: "Pune", state: "Maharashtra", district: "Pune" },
        { name: "Azadpur", state: "Delhi", district: "Delhi" },
        { name: "Yeshwantpur", state: "Karnataka", district: "Bengaluru" },
        { name: "Koyambedu", state: "Tamil Nadu", district: "Chennai" },
        { name: "Rajkot", state: "Gujarat", district: "Rajkot" },
        { name: "Ludhiana", state: "Punjab", district: "Ludhiana" },
        { name: "Indore", state: "Madhya Pradesh", district: "Indore" },
        { name: "Jaipur", state: "Rajasthan", district: "Jaipur" },
        { name: "Howrah", state: "West Bengal", district: "Howrah" },
        { name: "Kurnool", state: "Andhra Pradesh", district: "Kurnool" },
        { name: "Hyderabad", state: "Telangana", district: "Hyderabad" },
        { name: "Lucknow", state: "Uttar Pradesh", district: "Lucknow" },
        { name: "Patna", state: "Bihar", district: "Patna" }
    ];
}

/**
 * Get coordinates for a mandi using Google Maps Geocoding API
 * 
 * @param mandi - The mandi to geocode
 * @returns Mandi with coordinates or undefined if geocoding failed
 */
export async function geocodeMandi(mandi: MandiLocation): Promise<MandiLocation> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("[LOCATION] GOOGLE_MAPS_API_KEY not set, cannot geocode mandi");
        return mandi;
    }

    try {
        const address = `${mandi.name} Mandi, ${mandi.district}, ${mandi.state}, India`;
        const encodedAddress = encodeURIComponent(address);

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Geocoding API returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                ...mandi,
                coordinates: {
                    lat: location.lat,
                    lng: location.lng
                }
            };
        }

        console.warn(`[LOCATION] Could not geocode: ${address}`);
        return mandi;

    } catch (error) {
        console.error(`[LOCATION] Geocoding failed for ${mandi.name}:`, error);
        return mandi;
    }
}

/**
 * Calculate distance between user location and mandis using Google Maps Distance Matrix API
 * 
 * @param userLocation - User's coordinates
 * @param mandis - List of mandis to calculate distance to
 * @returns Mandis sorted by distance with distance info
 */
export async function calculateDistancesToMandis(
    userLocation: Coordinates,
    mandis: MandiLocation[]
): Promise<MandiLocation[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("[LOCATION] GOOGLE_MAPS_API_KEY not set, using Haversine distance");
        return calculateHaversineDistances(userLocation, mandis);
    }

    try {
        console.log(`[LOCATION] Calculating distances from user location to ${mandis.length} mandis...`);

        // Google Distance Matrix API allows max 25 destinations per request
        const batchSize = 25;
        const results: MandiLocation[] = [];

        for (let i = 0; i < mandis.length; i += batchSize) {
            const batch = mandis.slice(i, i + batchSize);

            // Build destinations string
            const destinations = batch.map(m => {
                if (m.coordinates) {
                    return `${m.coordinates.lat},${m.coordinates.lng}`;
                }
                return `${m.name} Mandi, ${m.district}, ${m.state}, India`;
            }).join("|");

            const origin = `${userLocation.lat},${userLocation.lng}`;

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error(`Distance Matrix API returned status ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "OK" && data.rows.length > 0) {
                const elements = data.rows[0].elements;

                for (let j = 0; j < elements.length; j++) {
                    const element = elements[j];
                    const mandi = batch[j];

                    if (element.status === "OK") {
                        results.push({
                            ...mandi,
                            distanceKm: element.distance.value / 1000,
                            durationMinutes: element.duration.value / 60
                        });
                    } else {
                        results.push(mandi);
                    }
                }
            }
        }

        // Sort by distance
        results.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));

        console.log(`[LOCATION] Nearest mandi: ${results[0]?.name} (${results[0]?.distanceKm?.toFixed(1)} km)`);

        return results;

    } catch (error) {
        console.error("[LOCATION] Distance calculation failed:", error);
        return calculateHaversineDistances(userLocation, mandis);
    }
}

/**
 * Fallback: Calculate distances using Haversine formula (when Google Maps API unavailable)
 */
function calculateHaversineDistances(
    userLocation: Coordinates,
    mandis: MandiLocation[]
): MandiLocation[] {
    // Known mandi coordinates (approximate)
    const knownCoordinates: Record<string, Coordinates> = {
        "Lasalgaon": { lat: 20.1486, lng: 74.2114 },
        "Vashi": { lat: 19.0760, lng: 72.9990 },
        "Pune": { lat: 18.5204, lng: 73.8567 },
        "Azadpur": { lat: 28.7189, lng: 77.1806 },
        "Yeshwantpur": { lat: 13.0288, lng: 77.5400 },
        "Koyambedu": { lat: 13.0708, lng: 80.1936 },
        "Rajkot": { lat: 22.3039, lng: 70.8022 },
        "Ludhiana": { lat: 30.9010, lng: 75.8573 },
        "Indore": { lat: 22.7196, lng: 75.8577 },
        "Jaipur": { lat: 26.9124, lng: 75.7873 },
        "Howrah": { lat: 22.5958, lng: 88.2636 },
        "Kurnool": { lat: 15.8281, lng: 78.0373 },
        "Hyderabad": { lat: 17.3850, lng: 78.4867 },
        "Lucknow": { lat: 26.8467, lng: 80.9462 },
        "Patna": { lat: 25.5941, lng: 85.1376 }
    };

    const results = mandis.map(mandi => {
        const coords = knownCoordinates[mandi.name];
        if (coords) {
            const distance = haversineDistance(userLocation, coords);
            return {
                ...mandi,
                coordinates: coords,
                distanceKm: distance
            };
        }
        return mandi;
    });

    results.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));

    return results;
}

/**
 * Haversine formula to calculate distance between two coordinates
 */
function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Find the nearest mandis from user's location
 * 
 * REAL IMPLEMENTATION:
 * 1. Fetches mandi list from data.gov.in
 * 2. Uses Google Maps Distance Matrix API for accurate distance calculation
 * 3. Returns mandis sorted by distance
 * 
 * @param userLocation - User's current coordinates
 * @param limit - Maximum number of mandis to return (default: 5)
 * @returns Nearest mandis sorted by distance
 */
export async function findNearestMandis(
    userLocation: Coordinates,
    limit: number = 5
): Promise<MandiLocation[]> {
    console.log(`[LOCATION] Finding nearest mandis from (${userLocation.lat}, ${userLocation.lng})...`);

    // Step 1: Fetch all mandis from government API
    const allMandis = await fetchAllMandisFromGovAPI();

    // Step 2: Calculate distances using Google Maps API
    const mandisWithDistance = await calculateDistancesToMandis(userLocation, allMandis);

    // Step 3: Return top N nearest mandis
    return mandisWithDistance.slice(0, limit);
}

/**
 * Get the nearest mandi for a given commodity
 * 
 * @param userLocation - User's coordinates
 * @param commodity - The commodity to find prices for
 * @returns The nearest mandi that has the commodity
 */
export async function findNearestMandiForCommodity(
    userLocation: Coordinates,
    commodity: string
): Promise<MandiLocation | null> {
    const apiKey = process.env.DATA_GOV_IN_API_KEY;

    if (!apiKey) {
        console.warn("[LOCATION] DATA_GOV_IN_API_KEY not set");
        const nearestMandis = await findNearestMandis(userLocation, 1);
        return nearestMandis[0] || null;
    }

    try {
        console.log(`[LOCATION] Finding nearest mandi for ${commodity}...`);

        // Fetch mandis that have the commodity
        const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
        const apiUrl = new URL(`https://api.data.gov.in/resource/${resourceId}`);
        apiUrl.searchParams.set("api-key", apiKey);
        apiUrl.searchParams.set("format", "json");
        apiUrl.searchParams.set("limit", "100");
        apiUrl.searchParams.set("filters[commodity]", commodity.charAt(0).toUpperCase() + commodity.slice(1).toLowerCase());

        const response = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (!data.records || data.records.length === 0) {
            console.warn(`[LOCATION] No mandis found for ${commodity}, using general nearest mandi`);
            const nearestMandis = await findNearestMandis(userLocation, 1);
            return nearestMandis[0] || null;
        }

        // Extract unique mandis that have this commodity
        const uniqueMarkets = new Map<string, MandiLocation>();

        for (const record of data.records) {
            const key = `${record.market}-${record.state}`;
            if (!uniqueMarkets.has(key)) {
                uniqueMarkets.set(key, {
                    name: record.market,
                    state: record.state,
                    district: record.district || ""
                });
            }
        }

        const mandisWithCommodity = Array.from(uniqueMarkets.values());

        // Calculate distances and find nearest
        const mandisWithDistance = await calculateDistancesToMandis(userLocation, mandisWithCommodity);

        return mandisWithDistance[0] || null;

    } catch (error) {
        console.error(`[LOCATION] Failed to find mandi for ${commodity}:`, error);
        const nearestMandis = await findNearestMandis(userLocation, 1);
        return nearestMandis[0] || null;
    }
}
