/**
 * Helper functions for collection-related operations
 * Standardizes terminology between "plan" and "collection"
 */

/**
 * Convert plan terminology to collection terminology
 * This helps standardize the codebase to use "collection" everywhere
 */

export interface CollectionData {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  creator_id?: string;
  collaborators?: string[];
  restaurant_ids?: string[];
  is_public?: boolean;
  [key: string]: any;
}

/**
 * Standardize function parameter names from plan to collection
 * @param planId - The plan ID to convert
 * @returns The collection ID (same value, different semantic meaning)
 */
export const toCollectionId = (planId: string): string => {
  return planId; // Same value, different semantic meaning
};

/**
 * Standardize function parameter names from collection to plan (for backward compatibility)
 * @param collectionId - The collection ID to convert
 * @returns The plan ID (same value, different semantic meaning)
 */
export const toPlanId = (collectionId: string): string => {
  return collectionId; // Same value, different semantic meaning
};

/**
 * Get collection by ID from a list of collections/plans
 * @param collections - Array of collections or plans
 * @param collectionId - The collection ID to find
 * @returns The collection or undefined if not found
 */
export const getCollectionById = (collections: CollectionData[], collectionId: string): CollectionData | undefined => {
  return collections.find(c => c.id === collectionId);
};

/**
 * Check if a collection exists by ID
 * @param collections - Array of collections or plans
 * @param collectionId - The collection ID to check
 * @returns True if collection exists
 */
export const hasCollection = (collections: CollectionData[], collectionId: string): boolean => {
  return collections.some(c => c.id === collectionId);
};

/**
 * Get collection name by ID
 * @param collections - Array of collections or plans
 * @param collectionId - The collection ID
 * @returns The collection name or undefined if not found
 */
export const getCollectionName = (collections: CollectionData[], collectionId: string): string | undefined => {
  const collection = getCollectionById(collections, collectionId);
  return collection?.name;
};

/**
 * Standardize error messages to use "collection" terminology
 * @param message - The error message to standardize
 * @returns Standardized error message
 */
export const standardizeErrorMessage = (message: string): string => {
  return message
    .replace(/plan/gi, 'collection')
    .replace(/Plan/gi, 'Collection')
    .replace(/PLAN/gi, 'COLLECTION');
};

/**
 * Standardize log messages to use "collection" terminology
 * @param message - The log message to standardize
 * @returns Standardized log message
 */
export const standardizeLogMessage = (message: string): string => {
  return message
    .replace(/plan/gi, 'collection')
    .replace(/Plan/gi, 'Collection')
    .replace(/PLAN/gi, 'COLLECTION');
};
