import React, { useState, useEffect } from 'react';
import { supabase } from "@/db/supabase";
import { format } from 'date-fns';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Loader2 } from 'lucide-react';

export default function RulesViewer() {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchNormativa = async () => {
      try {
        const { data, error } = await supabase
          .from('racerules')
          .select('content, updated_at')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error al cargar normativa:', error);
          setContent('*No se ha podido cargar la normativa.*');
        } else if (data) {
          setContent(data.content ?? '');
          setLastUpdated(data.updated_at);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNormativa();

    // Suscribirse a cambios en la normativa
    const subscription = supabase
      .channel('normativa-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'racerules',
        filter: `id=eq.${1}`
      }, (payload) => {
        setContent(payload.new.content ?? '');
        setLastUpdated(payload.new.updated_at);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Formatear fecha de última actualización
  const formatLastUpdated = () => {
    if (!lastUpdated) return null;

    return format(new Date(lastUpdated), "'Última actualización:' dd 'de' MMMM 'de' yyyy 'a las' HH:mm");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {lastUpdated && (
        <div className="rounded-lg border bg-gray-50 p-4 mb-4">
          <div className="text-sm text-gray-600">
            {formatLastUpdated()}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}