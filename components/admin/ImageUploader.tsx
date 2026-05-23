"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";

export type UploadedImage = {
  id: string;
  url: string;
  progress: number;
  uploading: boolean;
};

export default function ImageUploader({
  images,
  onChange,
  onError
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    const fileList = Array.from(files).slice(0, Math.max(0, 6 - images.length));
    if (!fileList.length) return;

    const placeholders = fileList.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      progress: 18,
      uploading: true
    }));
    onChange([...images, ...placeholders]);

    await Promise.all(
      fileList.map(async (file, index) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
          onError("Error uploading image ❌");
          onChange(imagesRef.current.filter((image) => image.id !== placeholders[index].id));
          return;
        }

        try {
          const form = new FormData();
          form.set("file", file);
          const response = await fetch("/api/admin/upload", { method: "POST", body: form });
          const payload = (await response.json()) as { url?: string; error?: string };

          if (!response.ok || !payload.url) throw new Error(payload.error ?? "Upload failed");

          const nextImages = (imagesRef.current ?? []).map((image) =>
            image.id === placeholders[index].id
              ? { ...image, url: payload.url!, progress: 100, uploading: false }
              : image
          );
          onChange(nextImages);
        } catch {
          onError("Error uploading image ❌");
          onChange(imagesRef.current.filter((image) => image.id !== placeholders[index].id));
        }
      })
    );
  }

  const imagesRef = useRef(images);
  imagesRef.current = images;

  function removeImage(id: string) {
    onChange(images.filter((image) => image.id !== id));
  }

  function reorder(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
  }

  return (
    <div>
      <p className="mb-3 text-sm uppercase tracking-[0.18em] text-gold">Product Images</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void uploadFiles(event.dataTransfer.files);
        }}
        className="grid min-h-56 w-full place-items-center border border-dashed border-gold bg-bg p-6 text-center transition hover:bg-card"
      >
        <span>
          <Upload className="mx-auto text-gold" size={38} />
          <span className="mt-4 block font-display text-3xl text-primary">Drop images here</span>
          <span className="mt-1 block text-sm text-muted">or click to browse</span>
          <span className="mt-3 block text-xs uppercase tracking-[0.16em] text-muted">JPG, PNG, WEBP · Max 5MB each</span>
          <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-muted">Up to 6 images</span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => event.target.files && void uploadFiles(event.target.files)}
      />
      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorder(index)}
              whileHover={{ y: -3 }}
              className="relative aspect-[4/5] overflow-hidden border border-[rgba(201,168,76,0.18)] bg-card"
            >
              <Image src={image.url} alt={`Product image ${index + 1}`} fill className="object-cover" />
              <button type="button" onClick={() => removeImage(image.id)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center bg-bg/80 text-gold">
                <X size={15} />
              </button>
              {index === 0 && <span className="absolute left-2 top-2 bg-gold px-2 py-1 text-xs font-bold text-bg">Main</span>}
              {image.uploading && (
                <div className="absolute inset-x-2 bottom-2 h-1 bg-bg">
                  <div className="h-full bg-gold" style={{ width: `${image.progress}%` }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
