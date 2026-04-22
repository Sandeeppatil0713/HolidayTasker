import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  username: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  updated_at: string | null;
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  },

  async upsertProfile(userId: string, updates: Partial<Omit<Profile, "id" | "updated_at">>): Promise<{ error: any }> {
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, ...updates, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    return { error };
  },

  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: any }> {
    const ext  = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return { url: null, error };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache bust so the new image shows immediately
    return { url: `${data.publicUrl}?t=${Date.now()}`, error: null };
  },
};
