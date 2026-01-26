/**
 * Icon Mapper Utility for Setu Voice-to-ONDC Gateway
 * Maps commodity names to their corresponding icon paths
 */

/**
 * Commodity icon mapping
 * Maps various commodity names (including Hindi/Hinglish variants) to icon paths
 */
export const COMMODITY_ICON_MAP: Record<string, string> = {
  // Onion variants
  onion: '/icons/onion.png',
  onions: '/icons/onion.png',
  pyaaz: '/icons/onion.png',
  pyaz: '/icons/onion.png',
  
  // Mango variants
  mango: '/icons/mango.png',
  mangoes: '/icons/mango.png',
  aam: '/icons/mango.png',
  alphonso: '/icons/mango.png',
  
  // Tomato variants
  tomato: '/icons/tomato.png',
  tomatoes: '/icons/tomato.png',
  tamatar: '/icons/tomato.png',
  
  // Potato variants
  potato: '/icons/potato.png',
  potatoes: '/icons/potato.png',
  aloo: '/icons/potato.png',
  
  // Wheat variants
  wheat: '/icons/wheat.png',
  gehun: '/icons/wheat.png',
  gehu: '/icons/wheat.png',
};

/**
 * Logistics provider logo mapping
 */
export const LOGISTICS_LOGO_MAP: Record<string, string> = {
  'india post': '/logos/india-post.png',
  'india-post': '/logos/india-post.png',
  indiapost: '/logos/india-post.png',
  
  delhivery: '/logos/delhivery.png',
  
  bluedart: '/logos/bluedart.png',
  'blue dart': '/logos/bluedart.png',
  'blue-dart': '/logos/bluedart.png',
};

/**
 * Buyer logo mapping
 */
export const BUYER_LOGO_MAP: Record<string, string> = {
  reliance: '/logos/reliance.png',
  'reliance fresh': '/logos/reliance.png',
  'reliance-fresh': '/logos/reliance.png',
  
  bigbasket: '/logos/bigbasket.png',
  'big basket': '/logos/bigbasket.png',
  'big-basket': '/logos/bigbasket.png',
  
  paytm: '/logos/paytm.png',
  'paytm mall': '/logos/paytm.png',
  'paytm-mall': '/logos/paytm.png',
  
  flipkart: '/logos/flipkart.png',
  'flipkart grocery': '/logos/flipkart.png',
  'flipkart-grocery': '/logos/flipkart.png',
};

/**
 * Default fallback icon for unknown commodities
 */
export const DEFAULT_COMMODITY_ICON = '/icons/wheat.png';

/**
 * Default fallback logo for unknown logistics providers
 */
export const DEFAULT_LOGISTICS_LOGO = '/logos/india-post.png';

/**
 * Default fallback logo for unknown buyers
 */
export const DEFAULT_BUYER_LOGO = '/logos/reliance.png';

/**
 * Get commodity icon path from commodity name
 * Handles case-insensitive matching and returns default if not found
 * 
 * @param commodityName - The name of the commodity (e.g., "onion", "pyaaz", "Mango")
 * @returns The path to the commodity icon
 * 
 * @example
 * getCommodityIcon("pyaaz") // returns "/icons/onion.png"
 * getCommodityIcon("Alphonso") // returns "/icons/mango.png"
 * getCommodityIcon("unknown") // returns "/icons/wheat.png" (default)
 */
export function getCommodityIcon(commodityName: string): string {
  const normalizedName = commodityName.toLowerCase().trim();
  return COMMODITY_ICON_MAP[normalizedName] || DEFAULT_COMMODITY_ICON;
}

/**
 * Get logistics provider logo path from provider name
 * Handles case-insensitive matching and returns default if not found
 * 
 * @param providerName - The name of the logistics provider
 * @returns The path to the logistics provider logo
 * 
 * @example
 * getLogisticsLogo("India Post") // returns "/logos/india-post.png"
 * getLogisticsLogo("delhivery") // returns "/logos/delhivery.png"
 */
export function getLogisticsLogo(providerName: string): string {
  const normalizedName = providerName.toLowerCase().trim();
  return LOGISTICS_LOGO_MAP[normalizedName] || DEFAULT_LOGISTICS_LOGO;
}

/**
 * Get buyer logo path from buyer name
 * Handles case-insensitive matching and returns default if not found
 * 
 * @param buyerName - The name of the buyer
 * @returns The path to the buyer logo
 * 
 * @example
 * getBuyerLogo("BigBasket") // returns "/logos/bigbasket.png"
 * getBuyerLogo("Paytm Mall") // returns "/logos/paytm.png"
 */
export function getBuyerLogo(buyerName: string): string {
  const normalizedName = buyerName.toLowerCase().trim();
  return BUYER_LOGO_MAP[normalizedName] || DEFAULT_BUYER_LOGO;
}

/**
 * Extract commodity name from product descriptor
 * Attempts to identify the commodity from a product name string
 * 
 * @param productName - The full product name (e.g., "Nasik Onions", "Alphonso Mango")
 * @returns The identified commodity name or the original name if not found
 * 
 * @example
 * extractCommodityName("Nasik Onions") // returns "onions"
 * extractCommodityName("Alphonso Aam") // returns "aam"
 */
export function extractCommodityName(productName: string): string {
  const normalizedName = productName.toLowerCase();
  
  // Check each commodity variant
  for (const commodity of Object.keys(COMMODITY_ICON_MAP)) {
    if (normalizedName.includes(commodity)) {
      return commodity;
    }
  }
  
  return productName;
}

/**
 * Get commodity icon from product descriptor
 * Convenience function that extracts commodity name and returns icon
 * 
 * @param productName - The full product name
 * @returns The path to the commodity icon
 * 
 * @example
 * getCommodityIconFromProduct("Nasik Onions") // returns "/icons/onion.png"
 * getCommodityIconFromProduct("Fresh Alphonso Mango") // returns "/icons/mango.png"
 */
export function getCommodityIconFromProduct(productName: string): string {
  const commodityName = extractCommodityName(productName);
  return getCommodityIcon(commodityName);
}
