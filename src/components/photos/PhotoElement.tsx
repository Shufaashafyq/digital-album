"use client";

import { useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";

type PhotoElementProps = {
  imageUrl: string;
  caption?: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  onPositionChange?: (x: number, y: number) => void;
  onSizeChange?: (width: number, height: number) => void;
};

export function PhotoElement({
  imageUrl,
  caption,
  x = 50,
  y = 50,
  width = 240,
  height = 200,
  rotation = 0,
  onPositionChange,
  onSizeChange,
}: PhotoElementProps) {
  const [position, setPosition] = useState({
    x,
    y,
  });

  const [size, setSize] = useState({
    width,
    height,
  });

  return (
    <Rnd
      position={position}
      size={size}
      bounds="parent"
      lockAspectRatio={false}
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
        const newPosition = {
          x: data.x,
          y: data.y,
        };

        setPosition(newPosition);

        onPositionChange?.(
          newPosition.x,
          newPosition.y
        );
      }}
      onResizeStop={(
        _event,
        _direction,
        ref,
        _delta,
        newPosition
      ) => {
        const newSize = {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        };

        const updatedPosition = {
          x: newPosition.x,
          y: newPosition.y,
        };

        setSize(newSize);
        setPosition(updatedPosition);

        onSizeChange?.(
          newSize.width,
          newSize.height
        );

        onPositionChange?.(
          updatedPosition.x,
          updatedPosition.y
        );
      }}
      className="group z-10"
    >
      <div
        className="relative h-full w-full"
        onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          event.stopPropagation();
        }}
        onTouchStart={(event: TouchEvent<HTMLDivElement>) => {
          event.stopPropagation();
        }}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
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

          <div className="pointer-events-none absolute inset-0 border-2 border-transparent transition group-hover:border-[#B2456E]/50" />
        </div>
      </div>
    </Rnd>
  );
}