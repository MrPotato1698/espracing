import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, is_team_manager } = body;
    if (typeof id !== 'string' || typeof is_team_manager !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Parámetros inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { error } = await supabase
      .from('profiles')
      .update({ is_team_manager, roleesp: is_team_manager ? 2 : 3 })
      .eq('id', id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('PUT /api/admin/myteam error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, teamId } = body;
    if (!userId || !teamId) {
      return new Response(JSON.stringify({ error: 'Parámetros inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { error } = await supabase.from("profiles").update({"is_team_manager": false, "team": null, "roleesp": 3}).eq("id", userId);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("DELETE /api/admin/myteam error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};