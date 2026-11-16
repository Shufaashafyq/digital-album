"use client";

import { useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";
import { RotateCcw, RotateCw, Layers, LayersIcon, Trash2 } from "lucide-react";

type PhotoElementProps = {
  imageUrl: string;
  caption?: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  photoId?: string;
  onPositionChange?: (x: number, y: number) => void;
  onSizeChange?: (width: number, height: number) => void;
  onRotationChange?: (rotation: number) => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onDelete?: () => void;
};

export function PhotoElement({
  imageUrl,
  caption,
  x = 50,
  y = 50,
  width = 240,
  height = 200,
  rotation = 0,
  zIndex = 0,
  onPositionChange,
  onSizeChange,
  onRotationChange,
  onBringForward,
  onSendBackward,
  onDelete,
}: PhotoElementProps) {
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [selected, setSelected] = useState(false);

  const nudgeRotation = (delta: number) => {
    const next = Math.round(rotation + delta);
    onRotationChange?.(next);
  };

  return (
    <Rnd
      position={position}
      size={size}
      bounds="parent"
      lockAspectRatio={false}
      style={{ zIndex }}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      onDragStop={(_event, data) => {
        const newPosition = { x: data.x, y: data.y };
        setPosition(newPosition);
        onPositionChange?.(newPosition.x, newPosition.y);
      }}
      onResizeStop={(_event, _direction, ref, _delta, newPosition) => {
        const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
        const updatedPosition = { x: newPosition.x, y: newPosition.y };
        setSize(newSize);
        setPosition(updatedPosition);
        onSizeChange?.(newSize.width, newSize.height);
        onPositionChange?.(updatedPosition.x, updatedPosition.y);
      }}
      className="group"
      onMouseDown={() => setSelected(true)}
    >
      <div
        className="relative h-full w-full"
        onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          event.stopPropagation();
        }}
        onTouchStart={(event: TouchEvent<HTMLDivElement>) => {
          event.stopPropagation();
        }}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="relative h-full w-full overflow-hidden bg-white p-2 shadow-lg">
          <Image
            src={imageUrl}
            alt={caption || "Album photograph"}
            fill
            unoptimized
            className="object-cover"
            sizes="400px"
          />
          <div
            className={`pointer-events-none absolute inset-0 border-2 transition ${
              selected
                ? "border-[#B2456E]/70"
                : "border-transparent group-hover:border-[#B2456E]/50"
            }`}
          />
        </div>

        {/* Toolbar — visible on hover */}
<div className="pointer-events-none absolute -bottom-9 left-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
  {/* Rotate left */}
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    nudgeRotation(-5);
  }}
  title="Rotate left 5°"
  className="flex h-7 w-7 items-center justify-center rounded bg-white text-[#552619] shadow-md hover:bg-[#FBEAE7]"
>
  <RotateCcw className="h-3.5 w-3.5" />
</button>

{/* Rotate right */}
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    nudgeRotation(5);
  }}
  title="Rotate right 5°"
  className="flex h-7 w-7 items-center justify-center rounded bg-white text-[#552619] shadow-md hover:bg-[#FBEAE7]"
>
  <RotateCw className="h-3.5 w-3.5" />
</button>

  {/* Bring forward */}
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onBringForward?.();
    }}
    title="Bring forward"
    className="flex h-7 w-7 items-center justify-center rounded bg-white text-[#552619] shadow-md hover:bg-[#FBEAE7]"
  >
    <Layers className="h-3.5 w-3.5" />
  </button>

  {/* Send backward */}
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onSendBackward?.();
    }}
    title="Send backward"
    className="flex h-7 w-7 items-center justify-center rounded bg-white text-[#552619] shadow-md hover:bg-[#FBEAE7]"
  >
    <LayersIcon className="h-3.5 w-3.5 opacity-50" />
  </button>

  {/* Delete */}
  {onDelete && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      title="Delete photo"
      className="flex h-7 w-7 items-center justify-center rounded bg-white text-red-500 shadow-md hover:bg-red-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )}
</div>
      </div>
    </Rnd>
  );
}