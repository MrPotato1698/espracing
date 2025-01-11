import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  console.log('FormData recibido:', Object.fromEntries(formData.entries()));

  const race_id = formData.get('race_id');
  const name = formData.get('name');
  const orderChamp = formData.get('orderChamp');
  const champID = formData.get('champID');
  const pointsystem = formData.get('pointsystem');
  const switchS2Element = formData.get("switch-S2") as HTMLInputElement | null;
  const switchR2Element = formData.get("switch-R2") as HTMLInputElement | null;
  const fileInputS1R1 = formData.get("fileInputS1R1") as File | null;
  const fileInputS2R1 = formData.get("fileInputS2R1") as File | null;
  const fileInputS1R2 = formData.get("fileInputS1R2") as File | null;
  const fileInputS2R2 = formData.get("fileInputS2R2") as File | null;


  if (!race_id) {
    return new Response(JSON.stringify({ error: 'ID de carrera no proporcionado' }), { status: 400 });
  }

  try {
    if (fileInputS1R1 !== null) {
      const fileS1R1 = fileInputS1R1;
      let fileS2R1;
      let fileS1R2;
      let fileS2R2;
      let numSplits: number = 1;
      let transformedJsonR1: string = "{}";
      let transformedJsonR2: string = "{}";
      if (!fileS1R1) {
        return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1." }), { status: 400 });
      }

      if (fileInputS1R2 !== null) {
        if (fileInputS1R2 !== null) {
          fileS1R2 = fileInputS1R2;
          if (!fileS1R2) {
            return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 2 del Split 1." }), { status: 400 });
          }
        }
        if (fileInputS2R1 !== null) {
          fileS2R1 = fileInputS2R1;
          if (!fileS2R1) {
            return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 2." }), { status: 400 });
          }
          if (fileInputS2R2 !== null) {
            fileS2R2 = fileInputS2R2;
            if (!fileS2R2) {
              return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 2 del Split 2." }), { status: 400 });
            }
          }
          numSplits = 2;
        }

        const contentS1R1 = await fileS1R1.text();
        const jsonS1R1 = JSON.parse(contentS1R1);
        let jsonS1R2;
        if (switchR2Element?.checked) {
          const contentS1R2 = await fileS1R2?.text();
          if (!contentS1R2) return new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 1." }), { status: 400 });
          jsonS1R2 = JSON.parse(contentS1R2);
        }
        if (switchS2Element?.checked) {
          if (switchR2Element?.checked) {
            const contentS2R2 = await fileS1R2?.text();
            if (!contentS2R2) return new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 2." }), { status: 400 });
            const jsonS2R2 = JSON.parse(contentS2R2);
            transformedJsonR2 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R2, jsonS2R2));
          }
          const contentS2R1 = await fileS2R1?.text();
          if (!contentS2R1) return new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 1 Split 2." }), { status: 400 });
          const jsonS2R1 = JSON.parse(contentS2R1);
          transformedJsonR1 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R1, jsonS2R1));
        } else {
          transformedJsonR1 = JSON.stringify(createRaceData(jsonS1R1));
          if (switchR2Element?.checked) {
            transformedJsonR2 = JSON.stringify(createRaceData(jsonS1R2));
          }
        }
      }

      const updateData: any = {
        ...(name && { name: name }),
        ...(fileInputS1R1 && {filename: fileS1R1.name}),
        ...(champID && { championship: champID }),
        ...(orderChamp && { orderinchamp: orderChamp }),
        ...(pointsystem && { pointsystem: pointsystem }),
        ...(numSplits && { splits: numSplits }),
        ...(fileInputS1R1 && {race_data_1: transformedJsonR1}),
        ...(switchR2Element?.checked && {race_data_2: transformedJsonR2}),
      };

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('race')
          .update(updateData)
          .eq('id', race_id);

        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'No se ha proporcionado un archivo para la Carrera 1 del Split 1.' }), { status: 400 });
    }
  } catch (error) {
    console.error('Error al actualizar la carrera:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la carrera' }), { status: 500 });
  }
}