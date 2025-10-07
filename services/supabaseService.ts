import { createClient } from '@supabase/supabase-js';
import { PublishedApp } from '../types';

const SUPABASE_URL = 'https://dgbrdmccaxgsknluxcre.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYnJkbWNjYXhnc2tubHV4Y3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNzg0OTAsImV4cCI6MjA3Mjg1NDQ5MH0.k7gU0a67nWOApF7DdDSH_x2Ihsy64M8ZRbby7qnrc2U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USER_ID_KEY = 'silo_user_id';

// --- User Management ---
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
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

export async function createOrUpdateProfile(userId: string, username: string, avatar_url?: string) {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, username, avatar_url }, { onConflict: 'user_id' })
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