import { getDatabase } from './init';
import { Profile } from './types';

export const createProfile = async (
  userId: string,
  name: string,
  bio?: string,
  country?: string,
  travelInterests?: string[]
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO profiles (id, name, bio, country, travel_interests) VALUES (?, ?, ?, ?, ?)',
    [
      userId,
      name,
      bio || null,
      country || null,
      JSON.stringify(travelInterests || []),
    ]
  );
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Profile>(
    'SELECT * FROM profiles WHERE id = ?',
    [userId]
  );
  if (result) {
    console.log('[Profiles] Raw profile from DB:', {
      id: result.id,
      name: result.name,
      bio: result.bio,
      country: result.country,
      profile_picture: result.profile_picture,
    });
    // Ensure all fields are properly typed and not mixed up
    const profile: Profile = {
      ...result,
      name: String(result.name || ''),
      bio: result.bio ? String(result.bio) : null,
      country: result.country ? String(result.country) : null,
      profile_picture: result.profile_picture ? String(result.profile_picture) : null,
    };
    
    if (typeof profile.travel_interests === 'string') {
      try {
        profile.travel_interests = JSON.parse(profile.travel_interests);
      } catch {
        profile.travel_interests = [];
      }
    } else if (!profile.travel_interests) {
      profile.travel_interests = [];
    }
    console.log('[Profiles] Processed profile:', {
      name: profile.name,
      bio: profile.bio ? 'has bio' : 'no bio',
      country: profile.country,
      profile_picture: profile.profile_picture ? 'has picture' : 'no picture',
    });
    return profile;
  }
  return null;
};

export const getAllProfiles = async (excludeUserId?: string): Promise<Profile[]> => {
  const db = await getDatabase();
  let query = 'SELECT * FROM profiles ORDER BY created_at DESC';
  let params: any[] = [];
  
  if (excludeUserId) {
    query = 'SELECT * FROM profiles WHERE id != ? ORDER BY created_at DESC';
    params = [excludeUserId];
  }
  
  const results = await db.getAllAsync<Profile>(query, params);
  return results.map((profile) => {
    if (typeof profile.travel_interests === 'string') {
      try {
        profile.travel_interests = JSON.parse(profile.travel_interests);
      } catch {
        profile.travel_interests = [];
      }
    } else if (!profile.travel_interests) {
      profile.travel_interests = [];
    }
    return profile;
  });
};

export const updateProfile = async (
  userId: string,
  updates: Partial<{
    name: string;
    bio: string;
    country: string;
    travel_interests: string[];
    profile_picture: string;
  }>
): Promise<void> => {
  console.log('[Profiles] updateProfile called with:', { userId, updates });
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(String(updates.name));
  }
  if (updates.bio !== undefined) {
    fields.push('bio = ?');
    values.push(updates.bio ? String(updates.bio) : null);
  }
  if (updates.country !== undefined) {
    fields.push('country = ?');
    values.push(updates.country ? String(updates.country) : null);
  }
  if (updates.travel_interests !== undefined) {
    fields.push('travel_interests = ?');
    values.push(JSON.stringify(updates.travel_interests));
  }
  if (updates.profile_picture !== undefined) {
    fields.push('profile_picture = ?');
    values.push(updates.profile_picture ? String(updates.profile_picture) : null);
  }

  fields.push('updated_at = datetime(\'now\')');
  values.push(userId);

  const query = `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`;
  console.log('[Profiles] Update query:', query);
  console.log('[Profiles] Update values:', values);
  
  try {
    await db.runAsync(query, values);
    console.log('[Profiles] Profile updated successfully');
  } catch (error) {
    console.error('[Profiles] Error updating profile:', error);
    throw error;
  }
};

export const getProfileCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM profiles'
  );
  return result?.count || 0;
};

export const searchProfiles = async (
  searchTerm: string,
  excludeUserId?: string
): Promise<Profile[]> => {
  const db = await getDatabase();
  // Make search case-insensitive and trim the search term
  const trimmedSearch = searchTerm.trim();
  if (!trimmedSearch) {
    return [];
  }
  const searchPattern = `%${trimmedSearch}%`;
  
  let query = `
    SELECT * FROM profiles 
    WHERE (
      LOWER(name) LIKE LOWER(?) OR 
      LOWER(country) LIKE LOWER(?) OR 
      LOWER(travel_interests) LIKE LOWER(?)
    )
    ORDER BY created_at DESC
  `;
  let params: any[] = [searchPattern, searchPattern, searchPattern];
  
  if (excludeUserId) {
    query = `
      SELECT * FROM profiles 
      WHERE id != ? AND (
        LOWER(name) LIKE LOWER(?) OR 
        LOWER(country) LIKE LOWER(?) OR 
        LOWER(travel_interests) LIKE LOWER(?)
      )
      ORDER BY created_at DESC
    `;
    params = [excludeUserId, searchPattern, searchPattern, searchPattern];
  }
  
  const results = await db.getAllAsync<Profile>(query, params);
  
  // Additional client-side filtering for travel_interests since they're JSON
  const filteredResults = results.filter((profile) => {
    const nameMatch = profile.name?.toLowerCase().includes(trimmedSearch.toLowerCase());
    const countryMatch = profile.country?.toLowerCase().includes(trimmedSearch.toLowerCase());
    
    let interestsMatch = false;
    if (typeof profile.travel_interests === 'string') {
      try {
        const interests = JSON.parse(profile.travel_interests);
        interestsMatch = Array.isArray(interests) && 
          interests.some((interest: string) => 
            interest.toLowerCase().includes(trimmedSearch.toLowerCase())
          );
      } catch {
        // Ignore parse errors
      }
    } else if (Array.isArray(profile.travel_interests)) {
      interestsMatch = profile.travel_interests.some((interest: string) => 
        interest.toLowerCase().includes(trimmedSearch.toLowerCase())
      );
    }
    
    return nameMatch || countryMatch || interestsMatch;
  });
  
  return filteredResults.map((profile) => {
    if (typeof profile.travel_interests === 'string') {
      try {
        profile.travel_interests = JSON.parse(profile.travel_interests);
      } catch {
        profile.travel_interests = [];
      }
    } else if (!profile.travel_interests) {
      profile.travel_interests = [];
    }
    return profile;
  });
};
