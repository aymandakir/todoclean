import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) {
      setDisplayName(data.display_name);
      setAvatarUrl(data.avatar_url);
    }
  }, []);

  return { displayName, avatarUrl, fetchProfile };
}
