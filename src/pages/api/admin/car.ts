import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase
    .from("car")
    .select("*, brand!inner(id, name), class!inner(*)")
    .order("id", { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};


export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { carData, carClassValue, carBrandValue } = body;
    if (!carData) throw new Error("No se recibieron datos del coche");

    // Solo permitir IDs existentes
    const lastBrandID = carBrandValue === "-1" ? carData.brandID : Number(carBrandValue);
    const lastClassID = carClassValue === "-1" ? carData.classID : Number(carClassValue);

    if (lastBrandID === -1) {
      return new Response(JSON.stringify({ error: "La marca seleccionada no existe en la base de datos. Vaya a ajustes globales para crearla" }), { status: 400 });
    }

    const { data: getLastCar } = await supabase
      .from('car')
      .select('id')
      .order('id', { ascending: true });

    if(!getLastCar) throw new Error("Error al obtener el último ID de coche");
    let findID = false;
    let i = 1;
    while (!findID && i < getLastCar.length) {
      if (getLastCar[i-1].id === i) {
        i++;
      } else {
        findID = true;
      }
    }
    if (!findID && getLastCar[i-1].id === i) i++;
    const lastCarID = getLastCar ? i : 1;

    const { error: insertError } = await supabase
      .from('car')
      .insert({
        id: Number(lastCarID),
        filename: carData.filename,
        brand: Number(lastBrandID),
        model: carData.model,
        year: carData.year,
        class: Number(lastClassID),
        power: carData.power,
        torque: carData.torque,
        weight: carData.weight,
        description: carData.description,
        tyreTimeChange: carData.tyreTimeChange,
        fuelLiterTime: carData.fuelLiterTime,
        maxLiter: carData.maxLiter,
      });

    if (insertError) throw insertError;
    return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error al crear el coche:", error);
    return new Response(JSON.stringify({ error: "Error al crear el coche: " + error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const car_id = formData.get('car_id');
  const brand = formData.get('carbrand');
  const carClass = formData.get('carclass');

  if (!car_id) {
    return new Response(JSON.stringify({ error: 'ID de coche no proporcionado' }), { status: 400 });
  }

  try {
    const updateData = buildUpdateData(formData, brand as string, carClass as string);

    const { error: updateError } = await supabase
      .from('car')
      .update(updateData)
      .eq('id', Number(car_id));

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el coche:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el coche' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error: errorDeleteData } = await supabase
    .from('car')
    .delete()
    .eq('id', id)
    .select();

  if (errorDeleteData) {
    console.error("Error al eliminar el coche:", errorDeleteData);
    return new Response("Error al eliminar el coche", { status: 500 });
  }
  return new Response("Coche eliminada con exito", { status: 200 });
};

function extractStringValue(value: FormDataEntryValue | null): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if ("value" in value) return String((value as any).value);
    if ("name" in value) return String((value as any).name);
  }
  if (value) return String(value);
  return "";
}

function buildUpdateData(formData: FormData, brand: string | null, carClass: string | null): any {
  const model = formData.get('model');
  const year = formData.get('year');
  const power = formData.get('power');
  const torque = formData.get('torque');
  const weight = formData.get('weight');
  const description = formData.get('description');
  const tyreTimeChange = formData.get('tyreTimeChange');
  const maxLiter = formData.get('maxLiter');
  const fuelLiterTime = formData.get('fuelLiterTime');
  const modelValue = extractStringValue(model);

  return {
    ...(brand && { brand: Number(brand) }),
    ...(modelValue && { model: modelValue }),
    ...(year && { year: Number(year) }),
    ...(carClass && { class: Number(carClass) }),
    ...(power && { power: Number(power) }),
    ...(torque && { torque: Number(torque) }),
    ...(weight && { weight: Number(weight) }),
    ...(description && { description: extractStringValue(description) }),
    ...(tyreTimeChange && { tyreTimeChange: Number(tyreTimeChange) }),
    ...(maxLiter && { maxLiter: Number(maxLiter) }),
    ...(fuelLiterTime && { fuelLiterTime: Number(fuelLiterTime) })
  };
}