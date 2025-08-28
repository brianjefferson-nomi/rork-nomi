import { Collection } from '@/types/restaurant';

/**
 * Helper functions for member-related operations
 * Standardizes the logic for working with collection members
 */

export interface MemberInfo {
  id: string;
  name?: string;
  isCreator: boolean;
}

/**
 * Get the total number of members in a collection
 * @param collection - The collection object
 * @returns Total member count (collaborators + creator)
 */
export const getMemberCount = (collection: Collection | any): number => {
  // Handle null/undefined collection
  if (!collection) {
    return 0;
  }
  
  const collaboratorCount = collection.collaborators && Array.isArray(collection.collaborators) 
    ? collection.collaborators.length 
    : 0;
  const totalMembers = collaboratorCount + 1; // +1 for the creator
  
  return totalMembers;
};

/**
 * Get all member IDs in a collection (collaborators + creator)
 * @param collection - The collection object
 * @returns Array of member IDs
 */
export const getMemberIds = (collection: Collection | any): string[] => {
  // Handle null/undefined collection
  if (!collection) {
    return [];
  }
  
  const collaborators = collection.collaborators && Array.isArray(collection.collaborators) 
    ? collection.collaborators 
    : [];
  const creatorId = collection.created_by || collection.creator_id;
  
  if (creatorId && !collaborators.includes(creatorId)) {
    return [creatorId, ...collaborators];
  }
  return collaborators;
};

/**
 * Check if a user is a member of a collection
 * @param collection - The collection object
 * @param userId - The user ID to check
 * @returns True if user is a member (creator or collaborator)
 */
export const isMember = (collection: Collection | any, userId: string): boolean => {
  if (!userId || !collection) return false;
  
  const memberIds = getMemberIds(collection);
  return memberIds.includes(userId);
};

/**
 * Check if a user is the creator of a collection
 * @param collection - The collection object
 * @param userId - The user ID to check
 * @returns True if user is the creator
 */
export const isCreator = (collection: Collection | any, userId: string): boolean => {
  if (!userId || !collection) return false;
  
  const creatorId = collection.created_by || collection.creator_id;
  return creatorId === userId;
};

/**
 * Check if a user can manage restaurants in a collection
 * @param collection - The collection object
 * @param userId - The user ID to check
 * @returns True if user can add/remove restaurants
 */
export const canManageRestaurants = (collection: Collection | any, userId: string): boolean => {
  if (!userId || !collection) return false;
  
  // For public collections, only the creator can manage
  if (collection.is_public) {
    return isCreator(collection, userId);
  }
  
  // For private collections, creator and members can manage
  return isMember(collection, userId);
};

/**
 * Get member information for display
 * @param collection - The collection object
 * @param userId - The user ID to get info for
 * @returns Member info object
 */
export const getMemberInfo = (collection: Collection | any, userId: string): MemberInfo | null => {
  if (!userId || !collection) return null;
  
  return {
    id: userId,
    name: 'Unknown', // This would be populated from user data
    isCreator: isCreator(collection, userId)
  };
};

/**
 * Format member count for display
 * @param count - The member count
 * @returns Formatted string
 */
export const formatMemberCount = (count: number): string => {
  return count.toString();
};

/**
 * Get member count text for UI display
 * @param collection - The collection object
 * @returns Formatted member count text
 */
export const getMemberCountText = (collection: Collection | any): string => {
  const count = getMemberCount(collection);
  return formatMemberCount(count);
};
