import { createClient, User } from '@supabase/supabase-js';
import { PublishedApp } from '../types';

const SUPABASE_URL = 'https://dgbrdmccaxgsknluxcre.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYnJkbWNjYXhnc2tubHV4Y3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNzg0OTAsImV4cCI6MjA3Mjg1NDQ5MH0.k7gU0a67nWOApF7DdDSH_x2Ihsy64M8ZRbby7qnrc2U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USER_ID_KEY = 'silo_user_id';

// --- Auth ---

async function linkAnonymousProfile(newAuthUserId: string) {
    const anonymousId = localStorage.getItem(USER_ID_KEY);
    if (!anonymousId) return;

    // Check if a profile exists for the anonymous ID
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', anonymousId)
        .single();

    if (existingProfile) {
        // Profile exists, update its user_id to the new authenticated user ID
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ user_id: newAuthUserId })
            .eq('id', existingProfile.id);
        
        if (updateError) {
            console.error("Error linking anonymous profile:", updateError);
        } else {
            // Success, remove the old anonymous ID
            localStorage.removeItem(USER_ID_KEY);
        }
    }
}

export const auth = {
  onAuthStateChange: supabase.auth.onAuthStateChange,
  
  async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  async getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
  },

  async signUp(credentials: {email: string, password: string}) {
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) throw error;
    if (data.user) {
        await linkAnonymousProfile(data.user.id);
    }
    return data;
  },

  async signInWithPassword(credentials: {email: string, password: string}) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  },

  async signInWithOAuth(provider: 'google' | 'github') {
    const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};


// --- User Management ---
function getAnonymousUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export async function getUserId(): Promise<string> {
  const user = await auth.getUser();
  if (user) {
    return user.id;
  }
  return getAnonymousUserId();
}


export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching profile:', error);
    }
    return data;
}

export async function uploadProfileImage(file: File, userId: string, type: 'avatar' | 'banner'): Promise<string> {
    const bucket = `${type}s`;
    const fileName = `${userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) {
        console.error(`Error uploading ${type}:`, error);
        throw error;
    }

    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

export async function createOrUpdateProfile(userId: string, updates: { username?: string, avatar_url?: string, banner_url?: string }) {
    const updateData: { user_id: string; [key: string]: any } = { user_id: userId };
    
    // Only include fields that are being updated
    if (updates.username) updateData.username = updates.username;
    if (updates.avatar_url) updateData.avatar_url = updates.avatar_url;
    if (updates.banner_url) updateData.banner_url = updates.banner_url;

    // Ensure there's more than just user_id to update
    if (Object.keys(updateData).length <= 1) {
        return getProfile(userId); // Nothing to update, return current profile
    }

    const { data, error } = await supabase
        .from('profiles')
        .upsert(updateData, { onConflict: 'user_id' })
        .select()
        .single();
        
    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
    return data;
}


// --- App Publishing ---
export async function publishApp(
    authorUserId: string,
    appData: {
        prompt: string;
        summary: string[];
        html_content: string;
        preview_html: string;
    }
) {
    const profile = await getProfile(authorUserId);
    if (!profile) {
        throw new Error("User profile not found. Please create a profile first.");
    }
    
    const { data, error } = await supabase
        .from('published_apps')
        .insert({
            author_id: profile.id,
            prompt: appData.prompt,
            summary: appData.summary,
            html_content: appData.html_content,
            preview_html: appData.preview_html,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error publishing app:', error);
        throw error;
    }
    return data;
}

// --- Marketplace ---
export async function getMarketplaceApps(page = 1, limit = 20): Promise<PublishedApp[]> {
    const { data, error } = await supabase
        .from('published_apps')
        .select(`
            *,
            profiles (
                username,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        console.error('Error fetching marketplace apps:', error);
        throw error;
    }
    return data as PublishedApp[];
}

export async function getUserApps(profileId: string) {
    const { data, error } = await supabase
        .from('published_apps')
        .select('*')
        .eq('author_id', profileId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user apps:', error);
        throw error;
    }
    return data;
}

// --- Liking ---
export async function hasUserLikedApp(appId: string, userId: string) {
    const { data, error } = await supabase
        .from('app_likes')
        .select('app_id')
        .eq('app_id', appId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error checking if user liked app:', error);
    }
    return !!data;
}

export async function toggleLike(appId: string, userId: string, hasLiked: boolean): Promise<number> {
    if (hasLiked) {
        // Unlike
        const { error: rpcError } = await supabase.rpc('decrement_likes', { app_id_to_decrement: appId });
        if(rpcError) throw rpcError;

        const { error: deleteError } = await supabase
            .from('app_likes')
            .delete()
            .match({ app_id: appId, user_id: userId });
        if(deleteError) throw deleteError;
    } else {
        // Like
        const { error: rpcError } = await supabase.rpc('increment_likes', { app_id_to_increment: appId });
        if(rpcError) throw rpcError;

        const { error: insertError } = await supabase
            .from('app_likes')
            .insert({ app_id: appId, user_id: userId });
        if(insertError) throw insertError;
    }
    
    const { data, error } = await supabase.from('published_apps').select('likes').eq('id', appId).single();
    if(error) throw error;
    return data.likes;
}
