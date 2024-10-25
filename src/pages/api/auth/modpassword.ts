import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const old_pass = formData.get("old_pass")?.toString();
  const new_pass = formData.get("new_pass")?.toString();
  const repeat_new_pass = formData.get("repeat_new_pass")?.toString();

  return redirect("/");
};