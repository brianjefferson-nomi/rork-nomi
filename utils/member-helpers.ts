import { CollectionMember } from '@/types/restaurant';

export function calculateMemberCount(collaborators: string[] | CollectionMember[]): number {
  if (!collaborators) return 0;
  
  if (Array.isArray(collaborators) && collaborators.length > 0) {
    // If it's an array of strings (user IDs), return the length
    if (typeof collaborators[0] === 'string') {
      return collaborators.length;
    }
    // If it's an array of CollectionMember objects, return the length
    else if (typeof collaborators[0] === 'object') {
      return collaborators.length;
    }
  }
  
  return 0;
}

export function isUserMember(userId: string, collaborators: string[] | CollectionMember[]): boolean {
  if (!collaborators || !userId) return false;
  
  if (Array.isArray(collaborators) && collaborators.length > 0) {
    // If it's an array of strings (user IDs)
    if (typeof collaborators[0] === 'string') {
      return (collaborators as string[]).includes(userId);
    }
    // If it's an array of CollectionMember objects
    else if (typeof collaborators[0] === 'object') {
      return (collaborators as CollectionMember[]).some((member) => member.userId === userId);
    }
  }
  
  return false;
}

// Alias for backward compatibility
export function isMember(userId: string, collaborators: string[] | CollectionMember[]): boolean {
  return isUserMember(userId, collaborators);
}

export function getUserRole(userId: string, collaborators: string[] | CollectionMember[]): 'admin' | 'member' | null {
  if (!collaborators || !userId) return null;
  
  if (Array.isArray(collaborators) && collaborators.length > 0) {
    // If it's an array of CollectionMember objects
    if (typeof collaborators[0] === 'object') {
      const member = (collaborators as CollectionMember[]).find((member) => member.userId === userId);
      return member?.role || null;
    }
  }
  
  // Default to member if it's just a string array
  return isUserMember(userId, collaborators) ? 'member' : null;
}

export function getMemberNames(collaborators: string[] | CollectionMember[]): string[] {
  if (!collaborators) return [];
  
  if (Array.isArray(collaborators) && collaborators.length > 0) {
    // If it's an array of CollectionMember objects
    if (typeof collaborators[0] === 'object') {
      return collaborators.map((member: any) => member.name);
    }
  }
  
  return [];
}

// Add missing functions that are being imported
export function getMemberIds(collaborators: string[] | CollectionMember[]): string[] {
  if (!collaborators) return [];
  
  if (Array.isArray(collaborators) && collaborators.length > 0) {
    // If it's an array of strings (user IDs)
    if (typeof collaborators[0] === 'string') {
      return collaborators as string[];
    }
    // If it's an array of CollectionMember objects
    else if (typeof collaborators[0] === 'object') {
      return (collaborators as CollectionMember[]).map((member) => member.userId);
    }
  }
  
  return [];
}

export function isCreator(userId: string, collection: any): boolean {
  return collection?.created_by === userId;
}

export function canManageRestaurants(userId: string, collection: any): boolean {
  return isCreator(userId, collection) || getUserRole(userId, collection.collaborators) === 'admin';
}

export function getMemberCount(collaborators: string[] | CollectionMember[]): number {
  return calculateMemberCount(collaborators);
}
