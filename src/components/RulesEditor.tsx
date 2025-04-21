import React, { useState, useEffect } from 'react';
import { supabase } from "@/db/supabase";
import MarkdownRenderer from '@/components/MarkdownRenderer';

// Importaciones de UI
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Eye, Edit } from 'lucide-react';

// Tipos
type Profile = {
  id: string;
  roleesp: number | null;
};

export default function RulesEditor(userData: Readonly<Profile>) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState<string>('');
  const [user, setUser] = useState<Profile>({id: '', roleesp: null});
  const [activeTab, setActiveTab] = useState<string>('edit');
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Obtener usuario autenticado
        setUser(userData);

        // Cargar contenido de la normativa
        const { data: normativaData, error: normativaError } = await supabase
          .from('racerules')
          .select('content')
          .eq('id', 1)
          .single();

        if (normativaError && normativaError.code !== 'PGRST116') {
          console.error('Error al cargar normativa:', normativaError);
        } else if (normativaData) {
          setContent(normativaData.content ?? '');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Guardar cambios en la normativa
  const saveContent = async () => {
    // Esperar a que el usuario esté disponible
    if (!user) {
      setSaveMessage({
        type: 'error',
        text: 'Usuario no autenticado. Por favor, recarga la página.'
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('racerules')
        .upsert({
          id: 1,
          content,
          updated_at: now,
          updated_by: user.id
        });

      if (error) {
        console.error('Error al guardar:', error);
        setSaveMessage({
          type: 'error',
          text: 'Error al guardar los cambios. Inténtalo de nuevo.'
        });
        return;
      }

      setSaveMessage({
        type: 'success',
        text: 'Cambios guardados correctamente.'
      });

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => { setSaveMessage(null); }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setSaveMessage({
        type: 'error',
        text: 'Error al guardar los cambios. Inténtalo de nuevo.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Editor de Normativa</h2>
        <Button
          onClick={saveContent}
          disabled={isSaving || isLoading || !user}
          className="flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {saveMessage && (
        <Alert
          variant={saveMessage.type === 'success' ? 'default' : 'destructive'}
          className="mb-4"
        >
          <AlertDescription>{saveMessage.text}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vista previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[70vh] font-mono text-sm"
            placeholder="# Título de la normativa

            Escribe aquí el contenido de la normativa usando Markdown..."
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4 text-black">
          <div className="border rounded-lg p-6 min-h-[70vh] bg-white">
            <MarkdownRenderer content={content} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}