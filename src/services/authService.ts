import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      // If profile doesn't exist but user is logged in, we might need to handle it
      // For now, return null or handle appropriately
      return null;
    }

    return profile as UserProfile;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async onAuthStateChange(callback: (profile: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        callback(profile as UserProfile || null);
      } else {
        callback(null);
      }
    });
  }
};
