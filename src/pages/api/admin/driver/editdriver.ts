import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

async function authenticateAndGetRole(cookies: any) {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");
  if (!accessToken || !refreshToken) {
    return { error: new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 }) };
  }
  const { data: dataAuth, error: errorAuth } = await supabase.auth.setSession({
    refresh_token: refreshToken.value,
    access_token: accessToken.value,
  });
  if (errorAuth) {
    return { error: new Response(JSON.stringify({ error: "Sesión inválida" }), { status: 401 }) };
  }
  const idAuth = dataAuth?.user?.id ?? "";
  const { data: roleData } = await supabase
    .from("profiles")
    .select("roleesp")
    .eq("id", idAuth)
    .single();
  const minRole = roleData?.roleesp;
  if (minRole == null || minRole > 1) {
    return { error: new Response(JSON.stringify({ error: "No autorizado" }), { status: 403 }) };
  }
  return { idAuth, minRole };
}

async function getUserRole(userId: string) {
  const { data: profileData } = await supabase
    .from("profiles")
    .select("roleesp")
    .eq("id", userId)
    .single();
  return profileData?.roleesp;
}

function validateRoleChange(new_role_id: FormDataEntryValue | null, minRole: number, currentRole: number) {
  if (new_role_id) {
    const newRole = Number(new_role_id);
    if (newRole === 2) {
      return { error: new Response(JSON.stringify({ error: "No se puede asignar el rol Team Manager (2) desde aquí" }), { status: 403 }) };
    }
    if (![1, 3].includes(newRole)) {
      return { error: new Response(JSON.stringify({ error: "Rol no permitido" }), { status: 403 }) };
    }
    if (minRole === 1 && currentRole === 1) {
      return { error: new Response(JSON.stringify({ error: "No puedes quitar el rol de Admin a otro Admin" }), { status: 403 }) };
    }
  }
  return {};
}

async function updateDriverProfile(driver_id: string, full_name: FormDataEntryValue | null, steam_id: FormDataEntryValue | null, new_role_id: FormDataEntryValue | null, minRole: number, currentRole: number) {
  const updateData: any = {
    ...(full_name && { full_name: full_name }),
    ...(steam_id && { steam_id: steam_id }),
  };
  if (new_role_id && (minRole === 0 || (minRole === 1 && currentRole !== 1))) {
    updateData.roleesp = Number(new_role_id);
  }
  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", driver_id);
    if (updateError) throw updateError;
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();

    const driver_idValue = formData.get("driver_id");
    const driver_id = typeof driver_idValue === "string" ? driver_idValue : undefined;
    const full_name = formData.get("name");
    const steam_id = formData.get("steamID");
    const new_role_id = formData.get("role");

    if (!driver_id) {
      return new Response(JSON.stringify({ error: "ID de carrera no proporcionado" }),{ status: 400 });
    }

    const authResult = await authenticateAndGetRole(cookies);
    if ("error" in authResult) return authResult.error as Response;
    const { minRole } = authResult;

    const currentRoleRaw = await getUserRole(driver_id);
    const currentRole = typeof currentRoleRaw === "number" ? currentRoleRaw : 0;

    const roleValidation = validateRoleChange(new_role_id, minRole, currentRole);
    if ("error" in roleValidation) return roleValidation.error as Response;

    await updateDriverProfile(driver_id, full_name, steam_id, new_role_id, minRole, currentRole);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el piloto:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar el piloto: " }), { status: 500 });
  }
};