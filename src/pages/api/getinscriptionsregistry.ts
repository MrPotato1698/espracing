import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'node-html-parser';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const post: APIRoute = async ({ request }) => {
  // Verificar la autenticación (puedes ajustar esto según tus necesidades)
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${import.meta.env.API_SECRET_KEY}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Obtener la fila con la suma más baja de 'order' + 'championship'
    const { data: rows, error } = await supabase
      .from('inscriptionscalendar')
      .select('*')
      .order('order', { ascending: true })
      .order('championship', { ascending: true })
      .limit(1);

    if (error) throw error;
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No rows found' }), { status: 200 });
    }

    const row = rows[0];

    // Verificar si la fecha de inscripción está abierta
    const inscriptionsOpen = new Date(row.inscriptions_open);
    const now = new Date();

    if (now >= inscriptionsOpen) {
      // Hacer la petición HTTPS
      const response = await fetch('https://es2.assettohosting.com:10018/stracker/lapstat');
      const html = await response.text();

      // Parsear el HTML y extraer la tabla
      const root = parse(html);
      const table = root.querySelector('table');

      if (table) {
        // Actualizar la fila en la base de datos
        const { error: updateError } = await supabase
          .from('inscriptionscalendar')
          .update({ inscriptions_time_register: table.outerHTML })
          .eq('id', row.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ message: 'Table updated successfully' }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ message: 'Table not found in the HTML' }), { status: 200 });
      }
    } else {
      return new Response(JSON.stringify({ message: 'Inscriptions not open yet' }), { status: 200 });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};