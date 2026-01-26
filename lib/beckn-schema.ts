import { z } from "zod";

/**
 * Beckn Protocol Schema Definitions
 * 
 * This file contains Zod schemas for validating Beckn Protocol catalog items
 * as per the ONDC specification. These schemas ensure type safety and runtime
 * validation for all catalog data.
 */

/**
 * BecknDescriptorSchema
 * 
 * Represents the descriptor object in a Beckn catalog item.
 * Contains the product name and a symbol (image URL).
 * 
 * @property name - The product name (required, non-empty string)
 * @property symbol - URL to the product image (required, valid URL)
 */
export const BecknDescriptorSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  symbol: z.string().url("Symbol must be a valid URL")
});

/**
 * BecknPriceSchema
 * 
 * Represents the price object in a Beckn catalog item.
 * Contains the price value and currency code.
 * 
 * @property value - The price value (required, must be positive)
 * @property currency - ISO 4217 currency code (required, 3-letter code, defaults to "INR")
 */
export const BecknPriceSchema = z.object({
  value: z.number().positive("Price must be positive"),
  currency: z.string().length(3, "Currency must be 3-letter code").default("INR")
});

/**
 * BecknQuantitySchema
 * 
 * Represents the quantity object in a Beckn catalog item.
 * Contains the available count and unit of measurement.
 * 
 * @property available - Object containing the count of available items
 * @property available.count - Number of available items (required, must be positive)
 * @property unit - Unit of measurement (required, non-empty string, e.g., "kg", "piece", "liter")
 */
export const BecknQuantitySchema = z.object({
  available: z.object({
    count: z.number().positive("Count must be positive")
  }),
  unit: z.string().min(1, "Unit is required")
});

/**
 * BecknTagsSchema
 * 
 * Represents the tags object in a Beckn catalog item.
 * Contains optional metadata about the product.
 * 
 * @property grade - Quality grade of the product (optional, e.g., "A", "B", "Premium")
 * @property perishability - Perishability level (optional, enum: "low", "medium", "high")
 * @property logistics_provider - Name of the logistics provider (optional, e.g., "India Post", "Delhivery")
 */
export const BecknTagsSchema = z.object({
  grade: z.string().optional(),
  perishability: z.enum(["low", "medium", "high"]).optional(),
  logistics_provider: z.string().optional()
});

/**
 * BecknCatalogItemSchema
 * 
 * Complete schema for a Beckn Protocol catalog item.
 * Combines all sub-schemas to represent a full product listing.
 * 
 * @property descriptor - Product descriptor with name and image
 * @property price - Price information with value and currency
 * @property quantity - Quantity information with available count and unit
 * @property tags - Optional metadata tags
 */
export const BecknCatalogItemSchema = z.object({
  descriptor: BecknDescriptorSchema,
  price: BecknPriceSchema,
  quantity: BecknQuantitySchema,
  tags: BecknTagsSchema
});

/**
 * TypeScript type inferred from BecknCatalogItemSchema
 * Use this type for type-safe catalog item handling throughout the application
 */
export type BecknCatalogItem = z.infer<typeof BecknCatalogItemSchema>;

/**
 * TypeScript type inferred from BecknDescriptorSchema
 */
export type BecknDescriptor = z.infer<typeof BecknDescriptorSchema>;

/**
 * TypeScript type inferred from BecknPriceSchema
 */
export type BecknPrice = z.infer<typeof BecknPriceSchema>;

/**
 * TypeScript type inferred from BecknQuantitySchema
 */
export type BecknQuantity = z.infer<typeof BecknQuantitySchema>;

/**
 * TypeScript type inferred from BecknTagsSchema
 */
export type BecknTags = z.infer<typeof BecknTagsSchema>;
