import type { APIRoute } from 'astro';
import { supabase } from '@/db/supabase';

// Lista blanca de tablas permitidas
const ALLOWED_TABLES = [
  'car',
  'carbrand',
  'carclass',
  'championship',
  'champwinners',
  'circuit',
  'circuitlayout',
  'inscription',
  'inscriptioncalendar',
  'message',
  'pointsystem',
  'race',
  'racenotes',
  'racerulesimg',
  'team',
  'teamapplication'
];

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const table = url.searchParams.get('table');

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return new Response(JSON.stringify({ error: 'Tabla no permitida' }), { status: 400 });
  }

  let data, error;
  switch (table) {
    case 'car':
      ({ data, error } = await supabase
        .from(table)
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle());
      break;
    case 'race':
      ({ data, error } = await supabase
        .from('race')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle());
      break;
    case 'racenotes':
      ({ data, error } = await supabase
        .from('racenotes')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle());
      break;
    case 'championship':
      ({ data, error } = await supabase
        .from('championship')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle());
      break;
    case 'pointsystem':
      ({ data, error } = await supabase
        .from('pointsystem')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle());
      break;
    case 'profiles':
      ({ data, error } = await supabase
        .from('profiles')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle());
      break;
    // Agrega más casos según tus tablas
    default:
      return new Response(JSON.stringify({ error: 'Tabla no permitida' }), { status: 400 });
  }

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const lastId = data?.id ? Number(data.id) : 0;
  return new Response(JSON.stringify({ id: lastId + 1 }), { status: 200 });
};
