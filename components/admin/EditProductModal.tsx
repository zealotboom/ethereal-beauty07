"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import {
  categories,
  Field,
  FormSection,
  labelize,
  PillList,
  productSchema,
  SelectorSection,
  sizeOptions,
  TogglePill,
  type ProductFormValues,
  type ProductPayload
} from "@/components/admin/AddProductModal";
import type { AdminProduct } from "@/components/admin/ProductsTable";

export default function EditProductModal({
  product,
  open,
  onClose,
  onUpdated,
  toast
}: {
  product: AdminProduct | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  toast: (type: "success" | "error" | "warning", message: string) => void;
}) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<Array<{ name: string; value: string }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState("#C9A84C");
  const [tagValue, setTagValue] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema)
  });

  useEffect(() => {
    if (!product || !open) return;
    reset({
      name: product.name,
      description: product.description ?? "",
      price: Number(product.price),
      sale_price: product.sale_price ?? null,
      category: product.category,
      stock: product.stock ?? 0,
      sku: "",
      is_active: product.is_active
    });
    setImages((product.images ?? []).map((url) => ({ id: crypto.randomUUID(), url, progress: 100, uploading: false })));
    setSizes(product.sizes ?? []);
    setColors((product.colors ?? []).map((value) => ({ name: value, value })));
    setTags(product.tags ?? []);
  }, [product, open, reset]);

  const price = watch("price");
  const salePrice = watch("sale_price");
  const isActive = watch("is_active");
  const discount = useMemo(() => {
    if (!price || !salePrice || salePrice >= price) return null;
    return Math.round(((price - salePrice) / price) * 100);
  }, [price, salePrice]);

  if (!product) return null;

  function toggleSize(size: string) {
    setSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]);
  }

  function addColor() {
    if (!colorName.trim()) return;
    setColors((current) => [...current, { name: colorName.trim(), value: colorValue }]);
    setColorName("");
  }

  function addTag() {
    if (!tagValue.trim()) return;
    setTags((current) => [...current, tagValue.trim()]);
    setTagValue("");
  }

  async function submit(values: ProductFormValues) {
    if (!images.some((image) => !image.uploading) || !sizes.length || !colors.length) {
      toast("warning", "Please fill all required fields ⚠️");
      return;
    }

    setSaving(true);
    const payload: ProductPayload = {
      name: values.name,
      description: values.description,
      price: values.price,
      sale_price: values.sale_price || null,
      category: values.category,
      images: images.filter((image) => !image.uploading).map((image) => image.url),
      sizes,
      colors: colors.map((color) => color.value),
      stock: values.stock,
      tags,
      is_active: values.is_active
    };

    try {
      const response = await fetch(`/api/admin/products/${product!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed");
      toast("success", "Product updated successfully ✅");
      onClose();
      onUpdated();
    } catch {
      toast("error", "Please fill all required fields ⚠️");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-bg/88 px-4 py-6 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.form
            onSubmit={handleSubmit(submit)}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl grid-rows-[auto_1fr_auto] border border-[rgba(201,168,76,0.22)] bg-surface shadow-[0_0_90px_rgba(0,0,0,0.65)]"
          >
            <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.15)] p-5">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-gold">Last updated {product.updated_at ? new Date(product.updated_at).toLocaleDateString("en-IN") : "recently"}</p>
                <h2 className="font-display text-4xl text-primary">Edit Product</h2>
              </div>
              <button type="button" onClick={onClose} className="text-muted hover:text-gold"><X size={22} /></button>
            </div>
            <div className="grid gap-8 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
              <ImageUploader images={images} onChange={setImages} onError={(message) => toast("error", message)} />
              <div className="grid gap-6">
                <FormSection title="Basic Info">
                  <Field label="Product Name*" error={errors.name?.message}><input {...register("name")} className="input-lux" /></Field>
                  <Field label="Description*" error={errors.description?.message}><textarea {...register("description")} rows={4} className="input-lux resize-none" /></Field>
                  <Field label="Category*" error={errors.category?.message}><select {...register("category")} className="input-lux">{categories.map((category) => <option key={category} value={category}>{labelize(category)}</option>)}</select></Field>
                </FormSection>
                <FormSection title="Pricing">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Regular Price*" error={errors.price?.message}><input {...register("price")} type="number" step="0.01" className="input-lux" /></Field>
                    <Field label="Sale Price" error={errors.sale_price?.message}><input {...register("sale_price")} type="number" step="0.01" className="input-lux" /></Field>
                  </div>
                  {discount && <span className="w-fit border border-gold px-3 py-1 text-sm text-gold">{discount}% off</span>}
                </FormSection>
                <FormSection title="Inventory">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Stock Quantity*" error={errors.stock?.message}><input {...register("stock")} type="number" className="input-lux" /></Field>
                    <Field label="SKU"><input {...register("sku")} className="input-lux" /></Field>
                  </div>
                </FormSection>
                <SelectorSection title="Sizes">{sizeOptions.map((size) => <TogglePill key={size} selected={sizes.includes(size)} onClick={() => toggleSize(size)}>{size}</TogglePill>)}</SelectorSection>
                <FormSection title="Colors">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <input value={colorName} onChange={(event) => setColorName(event.target.value)} className="input-lux" placeholder="Color name" />
                    <input value={colorValue} onChange={(event) => setColorValue(event.target.value)} type="color" className="h-12 w-16 border border-[rgba(201,168,76,0.2)] bg-bg p-1" />
                    <button type="button" onClick={addColor} className="border border-gold px-4 text-gold">+ Add Color</button>
                  </div>
                  <PillList items={colors.map((color) => color.name)} dots={colors.map((color) => color.value)} onRemove={(index) => setColors(colors.filter((_, itemIndex) => itemIndex !== index))} />
                </FormSection>
                <FormSection title="Tags">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input value={tagValue} onChange={(event) => setTagValue(event.target.value)} className="input-lux" placeholder="sale" />
                    <button type="button" onClick={addTag} className="border border-gold px-4 text-gold">Add</button>
                  </div>
                  <PillList items={tags} onRemove={(index) => setTags(tags.filter((_, itemIndex) => itemIndex !== index))} />
                </FormSection>
                <FormSection title="Status">
                  <button type="button" onClick={() => setValue("is_active", !isActive)} className="flex items-center justify-between gap-4 text-left">
                    <span><span className="block text-primary">Active</span><span className="text-sm text-muted">Product visible in shop</span></span>
                    <span className={`flex h-7 w-12 items-center rounded-full border p-1 transition ${isActive ? "border-gold bg-gold/20" : "border-[rgba(201,168,76,0.18)] bg-card"}`}>
                      <span className={`h-5 w-5 rounded-full transition ${isActive ? "translate-x-5 bg-gold" : "bg-muted"}`} />
                    </span>
                  </button>
                </FormSection>
              </div>
            </div>
            <div className="sticky bottom-0 flex items-center justify-between border-t border-[rgba(201,168,76,0.15)] bg-surface p-5">
              <button type="button" onClick={onClose} className="border border-gold px-5 py-3 text-sm text-gold">Cancel</button>
              <button disabled={saving} className="flex items-center gap-2 bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg disabled:opacity-60">
                {saving && <Loader2 className="animate-spin" size={16} />} Update Product
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
