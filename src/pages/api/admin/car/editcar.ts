import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const car_id = formData.get('car_id');
  let brand = formData.get('carbrand');
  let carClass = formData.get('carclass');

  if (carClass === '-2') {
    const { classId, error } = await handleNewClass(formData);
    if (error) return error;
    carClass = classId;
  }

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

function extractStringValue(value: FormDataEntryValue | null): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if ("value" in value) return String((value as any).value);
    if ("name" in value) return String((value as any).name);
  }
  if (value) return String(value);
  return "";
}

async function handleNewClass(formData: FormData): Promise<{ classId: string | null, error: Response | null }> {
  const newClassName = formData.get('newClassName');
  const newClassShortName = formData.get('newClassShortName');
  const newClassBackgroundColor = formData.get('newClassBackgroundColor');
  const newClassTextColor = formData.get('newClassTextColor');
  const { data: lastClass } = await supabase
    .from('carclass')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  const newClassId = lastClass ? lastClass.id + 1 : 1;
  const bgColor = extractStringValue(newClassBackgroundColor);
  const textColor = extractStringValue(newClassTextColor);
  const class_design = `bg-[${bgColor}] text-[${textColor}]`;
  const classNameValue = extractStringValue(newClassName);
  const shortNameValue = extractStringValue(newClassShortName);

  const { error: insertClassError } = await supabase
    .from('carclass')
    .insert({
      id: newClassId,
      name: classNameValue,
      short_name: shortNameValue,
      class_design
    });
  if (insertClassError) {
    return { classId: null, error: new Response(JSON.stringify({ error: 'Error al crear la clase' }), { status: 500 }) };
  }
  return { classId: String(newClassId), error: null };
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