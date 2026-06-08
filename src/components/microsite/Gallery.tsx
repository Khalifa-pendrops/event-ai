'use client';

import { useState } from 'react';

interface Image {
  id: string;
  url: string;
}

export function Gallery({ images }: { images: Image[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelected(i)}
            className="aspect-[4/3] overflow-hidden rounded-xl bg-[#161616] focus:outline-none"
          >
            <img src={img.url} alt="" className="h-full w-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>

      {selected !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" 
          onClick={() => setSelected(null)}
        >
          <img 
            src={images[selected].url} 
            alt="" 
            className="max-h-[90vh] max-w-full rounded-xl object-contain" 
          />
          <button 
            onClick={() => setSelected(null)} 
            className="absolute top-4 right-4 text-2xl text-white/70 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
