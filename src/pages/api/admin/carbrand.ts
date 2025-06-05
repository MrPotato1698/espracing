import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data, error: getListError } = await supabase.rpc("get_car_brands_with_model_count");

    if (getListError) throw getListError;

    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Error al actualizar la marca:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la marca' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const foundation = parseInt(formData.get('foundation') as string)
    const imageFile = formData.get('imageFile') as File

    const { data: getLastbrandID } = await supabase
      .from('carbrand')
      .select('id')
      .order('id', { ascending: true });

    if(!getLastbrandID) throw new Error("Error al obtener el último ID de Sistema de Puntos");
    let findID = false;
    let i = 1;
    while (!findID && i < getLastbrandID.length) {
      if (getLastbrandID[i-1].id === i) {
        i++;
      } else {
        findID = true;
      }
    }
    if (!findID) i++;
    const lastBrandID = getLastbrandID ? i : 1;

    const publicURL = await uploadImage(lastBrandID, imageFile);

    const { error: insertError } = await supabase
      .from('carbrand')
      .insert({
        id: lastBrandID,
        name,
        location,
        foundation,
        imgbrand: publicURL
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), { status: 201,headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error in POST /api/admin/carbrand:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const brand_id = formData.get('brand_id');
  const name = formData.get('name');
  const location = formData.get('location');
  const foundation = formData.get('foundation');

  if (!brand_id || !name || typeof name !== 'string') {
    return new Response(JSON.stringify({ error: 'ID de marca y nombre son obligatorios' }), { status: 400 });
  }

  try {
    const { error: updateError } = await supabase
      .from('carbrand')
      .update({
        name: name,
        location: typeof location === 'string' ? location : '',
        foundation: Number(foundation) || null
      })
      .eq('id', Number(brand_id));

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la marca:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la marca' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: "ID de marca es obligatorio" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }    // Check if brand has associated models
    const { data: carCount } = await supabase
      .from("car")
      .select("id", { count: 'exact' })
      .eq("brand", id);

    if (carCount && carCount.length > 0) {
      return new Response(JSON.stringify({
        error: `No se puede eliminar esta marca porque tiene ${carCount.length} modelo${carCount.length > 1 ? 's' : ''} asociado${carCount.length > 1 ? 's' : ''}. Elimina primero los modelos de esta marca.` 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const { data: files } = await supabase.storage
        .from("carbrands")
        .list("", { search: `brand_${id}_` });

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => file.name);
        await supabase.storage.from("carbrands").remove(filesToDelete);
      }
    } catch (e) {
      console.error("Error eliminando imágenes del storage:", e);
    }

    // Delete the brand
    const { error: deleteError } = await supabase
      .from("carbrand")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting brand:", deleteError);
      return new Response(JSON.stringify({ error: "Error al eliminar la marca" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Marca eliminada correctamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const uploadImage = async (brandId: number, imageFile: File): Promise<string | null> => {
  if (!imageFile) return null;
  try {
    const compressedImage = await compressImage(imageFile);
    const timestamp = new Date().getTime();
    const fileName = `team_${brandId}_${timestamp}.webp`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('carbrands')
      .upload(filePath, compressedImage, {
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrl  } = supabase.storage
      .from('carbrands')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const compressImage = async (file: File): Promise<Blob> => {
  try {
    // Convert File to ArrayBuffer then to Blob for server-side processing
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    return blob;
  } catch (error) {
    console.error("Error comprimiendo imagen:", error);
    throw error;
  }
};

// Cargar imagen desde un data URL
const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Error al cargar la imagen"));
    img.src = dataUrl;
  });}
