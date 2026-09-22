import React, { useState, useRef, useEffect } from 'react';

interface FloatingWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  width?: string;
  height?: string;
  headerColor?: string;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  title,
  isOpen,
  onClose,
  children,
  initialX = 40,
  initialY = 70,
  width = '780px',
  height = '500px',
  headerColor = 'bg-[#0a0e17]'
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: initialX,
    initY: initialY
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      setPos({
        x: Math.max(10, dragStartRef.current.initX + dx),
        y: Math.max(10, dragStartRef.current.initY + dy)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y
    };
  };

  return (
    <div
      className="floating-window plugin-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: width,
        height: height
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        className={`window-header ${headerColor} p-3 border-b border-slate-800 flex items-center justify-between cursor-move select-none`}
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00ffaa] led-glow"></span>
          <span className="text-xs font-black text-white">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-2 py-0.5 text-xs font-bold rounded hover:bg-slate-800 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
      <div className="p-4 flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
};
