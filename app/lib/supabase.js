import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://vagalyiqnhutxxgvnkkf.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZ2FseWlxbmh1dHh4Z3Zua2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTE2NDcsImV4cCI6MjEwMTgyNzY0N30.rW4vImNMjezBXqIkgY6RcxRjdoXuMgWd0XuFNVEba_Q";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: Platform.OS === "web" ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
