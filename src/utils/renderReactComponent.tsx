// filepath: g:\Universidad\TFG\espracing\src\utils\renderReactComponent.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Renderiza un componente React en un elemento DOM específico
 * 
 * @param Component - El componente React a renderizar
 * @param props - Las propiedades a pasar al componente
 * @param container - El elemento DOM donde se renderizará el componente
 */
export function renderReactComponent(
  Component: React.ComponentType<any>,
  props: any,
  container: HTMLElement | null
) {
  if (!container) {
    console.error('No se pudo encontrar el contenedor DOM para renderizar el componente React');
    return;
  }

  try {
    const root = createRoot(container);
    root.render(React.createElement(Component, props));
  } catch (error) {
    console.error('Error al renderizar el componente React:', error);
  }
}