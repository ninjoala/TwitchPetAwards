// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbizimgkquugfzcyohpl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXppbWdrcXV1Z2Z6Y3lvaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MjM4MjUsImV4cCI6MjA2MDQ5OTgyNX0.iVpvxh2mzxcLZxXrsz-KkFW3uT8cDoLWcBgX4qwXqX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
