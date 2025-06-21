import React, { useState, useEffect } from "react";

// Declaración global para evitar el warning de TypeScript
declare global {
  interface Window {
    __classEditData?: { name: string; backgroundColor: string; textColor: string };
  }
}

interface Props {
  initialName: string;
  initialBackground: string;
  initialText: string;
  onChange?: (data: { name: string; backgroundColor: string; textColor: string }) => void;
}

const ColorPreviewClassEdit: React.FC<Props> = ({ initialName, initialBackground, initialText, onChange }) => {
  const [name, setName] = useState(initialName);
  const [backgroundColor, setBackgroundColor] = useState(initialBackground);
  const [textColor, setTextColor] = useState(initialText);

  useEffect(() => {
    if (onChange) {
      onChange({ name, backgroundColor, textColor });
    }
    if (typeof window !== 'undefined') {
      window.__classEditData = { name, backgroundColor, textColor };
    }
  }, [name, backgroundColor, textColor, onChange]);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:gap-8 md:items-end items-center w-full mt-5">
      <div className="flex flex-col">
        <label className="text-lg font-semibold" htmlFor="backgroundColor">Color de fondo:</label>
        <input
          type="color"
          name="backgroundColor"
          value={backgroundColor}
          onChange={e => setBackgroundColor(e.target.value)}
          className="w-16 h-10 p-0 border-none bg-transparent"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-lg font-semibold" htmlFor="textColor">Color de texto:</label>
        <input
          type="color"
          name="textColor"
          value={textColor}
          onChange={e => setTextColor(e.target.value)}
          className="w-16 h-10 p-0 border-none bg-transparent"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-lg font-semibold" htmlFor="name">Shortname:</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-28 md:w-36 p-2 border border-lightSecond rounded-md bg-darkPrimary text-white hover:border-primary"
        />
      </div>
      <div className="flex items-center h-full">
        <div
          className="p-3 px-6 rounded-md text-center font-bold min-w-[120px] md:min-w-[160px] text-base md:text-lg"
          style={{ background: backgroundColor, color: textColor }}
        >
          {name || 'Shortname'}
        </div>
      </div>
    </div>
  );
};

export default ColorPreviewClassEdit;
