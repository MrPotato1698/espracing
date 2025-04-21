import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Encabezados fuera del componente principal
const H1 = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <h1 {...props} className="text-3xl font-bold mt-6 mb-4">{children}</h1>
);
const H2 = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <h2 {...props} className="text-2xl font-bold mt-5 mb-3">{children}</h2>
);
const H3 = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <h3 {...props} className="text-xl font-bold mt-4 mb-2">{children}</h3>
);
const H4 = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <h4 {...props} className="text-lg font-bold mt-3 mb-2">{children}</h4>
);
const H5 = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <h5 {...props} className="text-base font-bold mt-3 mb-1">{children}</h5>
);
const H6 = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <h6 {...props} className="text-sm font-bold mt-3 mb-1">{children}</h6>
);

// Párrafo fuera del componente principal
const P = ({ node, ...props }: { node?: any; [key: string]: any }) => (
  <p {...props} className="my-3 leading-relaxed" />
);

// Strong component fuera del componente principal
const Strong = ({ node, ...props }: { node?: any; [key: string]: any }) => <strong {...props} className="font-bold" />;

// Em component fuera del componente principal
const Em = ({ node, ...props }: { node?: any; [key: string]: any }) => <em {...props} className="italic" />;

const Ul = ({ node, ...props }: { node?: any; [key: string]: any }) => <ul {...props} className="list-disc pl-6 my-3" />;
const Ol = ({ node, ...props }: { node?: any; [key: string]: any }) => <ol {...props} className="list-decimal pl-6 my-3" />;
const Li = ({ node, ...props }: { node?: any; [key: string]: any }) => <li {...props} className="my-1" />;

// Enlace fuera del componente principal
const A = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const Img = ({ node, alt = '', ...props }: { node?: any; alt?: string; [key: string]: any }) => (
  <img {...props} alt={alt} className="max-w-full h-auto my-4 rounded-lg" />
);

// Bloques de código y código en línea fuera del componente principal
const Code = ({ node, inline, ...props }: { node?: any; inline?: boolean; [key: string]: any }) =>
  inline ? (
    <code {...props} className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono" />
  ) : (
    <code {...props} className="block bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono my-4" />
  );

// Pre component moved outside the main component
const Pre = ({ node, ...props }: { node?: any; [key: string]: any }) => (
  <pre {...props} className="bg-transparent p-0 my-0" />
);

// Custom Table component moved outside the main component
const Table = ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
  <div className="overflow-x-auto my-4">
    <table {...props} className="min-w-full border-collapse">
      {/* If children already contains a thead, render as is; otherwise, add a default header */}
      {React.Children.toArray(children).some(
        (child: any) => child && child.type === 'thead'
      ) ? (
        children
      ) : (
        <>
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-bold">Header</th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </>
      )}
    </table>
  </div>
);

// Thead component moved outside the main component
const Thead = ({ node, ...props }: { node?: any; [key: string]: any }) => <thead {...props} className="bg-gray-100" />;

// tbody component moved outside the main component
const Tbody = ({ node, ...props }: { node?: any; [key: string]: any }) => <tbody {...props} />;

// tr component moved outside the main component
const Tr = ({ node, ...props }: { node?: any; [key: string]: any }) => (
  <tr {...props} className="border-b border-gray-200" />
);

// Table header (th) component moved outside the main component
const Th = ({ node, ...props }: { node?: any; [key: string]: any }) => (
  <th {...props} className="px-4 py-2 text-left font-bold" />
);

// Table data cell (td) component moved outside the main component
const Td = ({ node, ...props }: { node?: any; [key: string]: any }) => <td {...props} className="px-4 py-2" />;

// Blockquote component moved outside the main component
const Blockquote = ({ node, ...props }: { node?: any; [key: string]: any }) => (
  <blockquote {...props} className="pl-4 border-l-4 border-gray-200 italic my-4" />
);

const Hr = ({ node, ...props }: { node?: any; [key: string]: any }) => (
  <hr {...props} className="my-6 border-t border-gray-300" />
);

const components = {
  // Encabezados
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,

  // Párrafos y texto
  p: P,
  strong: Strong,
  em: Em,

  // Listas
  ul: Ul,
  ol: Ol,
  li: Li,

  // Enlaces e imágenes
  a: A,
  img: Img,

  // Bloques de código y código en línea
  code: Code,
  pre: Pre,

  // Tablas
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,

  // Otros elementos
  blockquote: Blockquote,
  hr: Hr,
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;