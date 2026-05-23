"use client";

// Supabase SQL:
// -- alter table public.profiles add column if not exists phone text;
// -- alter table public.profiles add column if not exists address jsonb;

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Camera, UserRound } from "lucide-react";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

const profileSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
  phone: z.string().optional().refine((value) => !value || /^\d{10}$/.test(value), "Phone must be 10 digits."),
  address1: z.string().min(1, "Address line 1 is required."),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  pinCode: z.string().regex(/^\d{6}$/, "PIN Code must be exactly 6 digits."),
  country: z.string().min(1, "Country is required.")
});

type ProfileForm = z.infer<typeof profileSchema>;

type StyleAnswers = {
  style: string;
  fit: string;
  budget: string;
  colors: string;
  shoppingStyle: string;
};

type QuestionKey = keyof StyleAnswers;

type Question = {
  key: QuestionKey;
  title: string;
  options: Array<{ label: string; value: string; swatches?: string[] }>;
};

const questions: Question[] = [
  {
    key: "style",
    title: "What's your go-to style?",
    options: [
      { label: "👔 Classic & Formal", value: "Classic & Formal" },
      { label: "🖤 Dark & Edgy", value: "Dark & Edgy" },
      { label: "🌿 Minimal & Clean", value: "Minimal & Clean" },
      { label: "🎨 Bold & Expressive", value: "Bold & Expressive" }
    ]
  },
  {
    key: "fit",
    title: "What fits do you prefer?",
    options: [
      { label: "🤏 Slim & Tailored", value: "Slim & Tailored" },
      { label: "😌 Regular & Comfortable", value: "Regular & Comfortable" },
      { label: "🌊 Oversized & Relaxed", value: "Oversized & Relaxed" },
      { label: "💫 Mixed — depends on mood", value: "Mixed — depends on mood" }
    ]
  },
  {
    key: "budget",
    title: "What's your budget range per item?",
    options: [
      { label: "💚 Under ₹1,000", value: "Under ₹1,000" },
      { label: "💛 ₹1,000 – ₹5,000", value: "₹1,000 – ₹5,000" },
      { label: "🧡 ₹5,000 – ₹15,000", value: "₹5,000 – ₹15,000" },
      { label: "❤️ ₹15,000+", value: "₹15,000+" }
    ]
  },
  {
    key: "colors",
    title: "Which colors do you gravitate to?",
    options: [
      { label: "⬛ Neutrals (Black, White, Grey)", value: "Neutrals", swatches: ["#080808", "#F0EDE6", "#7A7570"] },
      { label: "🟫 Earth Tones (Camel, Brown, Olive)", value: "Earth Tones", swatches: ["#C29A5B", "#5B3A29", "#5F6F3D"] },
      { label: "🔵 Cool Tones (Navy, Blue, Slate)", value: "Cool Tones", swatches: ["#17223B", "#274C77", "#657786"] },
      { label: "🔴 Rich Tones (Burgundy, Forest, Gold)", value: "Rich Tones", swatches: ["#6E1F2F", "#123524", "#C9A84C"] }
    ]
  },
  {
    key: "shoppingStyle",
    title: "How do you mostly shop?",
    options: [
      { label: "🎯 I know exactly what I want", value: "I know exactly what I want" },
      { label: "💡 I like recommendations", value: "I like recommendations" },
      { label: "🛍️ I browse and get inspired", value: "I browse and get inspired" },
      { label: "🎁 I shop for occasions only", value: "I shop for occasions only" }
    ]
  }
];

const emptyAnswers: StyleAnswers = {
  style: "",
  fit: "",
  budget: "",
  colors: "",
  shoppingStyle: ""
};

export default function ProfileSetupModal({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<StyleAnswers>(emptyAnswers);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("");

  const {
    register,
    trigger,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { country: "India" }
  });

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const allStyleAnswersSelected = useMemo(
    () => questions.every((question) => answers[question.key]),
    [answers]
  );

  async function continueFromPersonalInfo() {
    if (await trigger(["name", "phone"])) setStep(2);
  }

  async function continueFromAddress() {
    if (await trigger(["address1", "city", "state", "pinCode", "country"])) setStep(3);
  }

  async function uploadAvatarToCloudinary() {
    if (!avatarFile) return null;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;

    const form = new FormData();
    form.set("file", avatarFile);
    form.set("upload_preset", uploadPreset);
    form.set("folder", "ethereal-beauty/avatars");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as { secure_url?: string };
    return payload.secure_url ?? null;
  }

  async function completeProfile(values: ProfileForm) {
    if (!allStyleAnswersSelected) return;
    setSaving(true);
    setStatus("");

    try {
      const avatarUrl = await uploadAvatarToCloudinary();

      if (hasSupabaseBrowserEnv()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const address = {
            line1: values.address1,
            line2: values.address2 ?? "",
            city: values.city,
            state: values.state,
            pinCode: values.pinCode,
            country: values.country
          };

          const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            name: values.name,
            phone: values.phone ?? null,
            avatar_url: avatarUrl,
            address,
            style_dna: answers
          });

          if (error) throw error;
        }
      }

      setSuccess(true);
      window.setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 1100);
    } catch {
      setStatus("We could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function onAvatarChange(file: File | undefined) {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSuccess(false);
          setOpen(true);
        }}
        className="mb-6 border border-gold px-5 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg"
      >
        Edit Profile
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-bg/95 px-4 py-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="mx-auto min-h-[calc(100vh-48px)] max-w-4xl border border-[rgba(201,168,76,0.15)] bg-surface p-5 shadow-[0_0_80px_rgba(0,0,0,0.7)] sm:p-8"
            >
              <div className="h-1 bg-card">
                <motion.div className="h-full bg-gold" animate={{ width: `${(step / 3) * 100}%` }} />
              </div>

              {success ? (
                <div className="grid min-h-[70vh] place-items-center text-center">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: [0.9, 1.08, 1], opacity: 1 }}
                    className="grid h-28 w-28 place-items-center rounded-full border border-gold text-gold shadow-[0_0_36px_rgba(201,168,76,0.45)]"
                  >
                    <Check size={54} />
                  </motion.div>
                  <p className="mt-6 font-display text-4xl text-primary">Profile Complete</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(completeProfile)} className="mt-8">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <StepFrame key="personal" title="Personal Info">
                        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                          <label className="mx-auto grid cursor-pointer place-items-center text-center">
                            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => onAvatarChange(event.target.files?.[0])} />
                            <span className="relative grid h-44 w-44 place-items-center overflow-hidden rounded-full border border-[rgba(201,168,76,0.3)] bg-card">
                              {avatarPreview ? (
                                <Image src={avatarPreview} alt="Profile preview" fill className="object-cover" />
                              ) : (
                                <UserRound className="text-gold" size={62} />
                              )}
                            </span>
                            <span className="mt-4 inline-flex items-center gap-2 text-sm text-gold"><Camera size={16} /> Upload Profile Photo</span>
                          </label>
                          <div className="grid gap-4">
                            <Field label="Full Name" error={errors.name?.message}>
                              <input {...register("name")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" />
                            </Field>
                            <Field label="Phone Number" error={errors.phone?.message}>
                              <input {...register("phone")} inputMode="numeric" className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" />
                            </Field>
                            <button type="button" onClick={continueFromPersonalInfo} className="mt-2 bg-gold px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg transition hover:bg-gold-light">
                              Continue
                            </button>
                          </div>
                        </div>
                      </StepFrame>
                    )}

                    {step === 2 && (
                      <StepFrame key="address" title="Delivery Address">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Full Address line 1" error={errors.address1?.message}><input {...register("address1")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" /></Field>
                          <Field label="Address line 2" error={errors.address2?.message}><input {...register("address2")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" /></Field>
                          <Field label="City" error={errors.city?.message}><input {...register("city")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" /></Field>
                          <Field label="State" error={errors.state?.message}><input {...register("state")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" /></Field>
                          <Field label="PIN Code" error={errors.pinCode?.message}><input {...register("pinCode")} inputMode="numeric" className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" /></Field>
                          <Field label="Country" error={errors.country?.message}><input {...register("country")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" /></Field>
                        </div>
                        <button type="button" onClick={continueFromAddress} className="mt-6 bg-gold px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg transition hover:bg-gold-light">
                          Continue
                        </button>
                      </StepFrame>
                    )}

                    {step === 3 && (
                      <StepFrame key="style" title="Style Preferences">
                        <div className="grid gap-6">
                          {questions.map((question) => (
                            <div key={question.key}>
                              <p className="font-display text-2xl text-primary">{question.title}</p>
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {question.options.map((option) => {
                                  const selected = answers[question.key] === option.value;
                                  return (
                                    <motion.button
                                      type="button"
                                      key={option.value}
                                      whileHover={{ scale: 1.02 }}
                                      onClick={() => setAnswers((current) => ({ ...current, [question.key]: option.value }))}
                                      className={`flex min-h-16 items-center justify-between gap-3 border bg-card px-4 py-3 text-left text-sm transition ${
                                        selected ? "border-gold text-gold shadow-[0_0_24px_rgba(201,168,76,0.14)]" : "border-[rgba(201,168,76,0.15)] text-primary/82 hover:border-[rgba(201,168,76,0.35)]"
                                      }`}
                                    >
                                      <span>{option.label}</span>
                                      {option.swatches && (
                                        <span className="flex gap-1">
                                          {option.swatches.map((swatch) => <span key={swatch} className="h-5 w-5 rounded-full border border-white/20" style={{ background: swatch }} />)}
                                        </span>
                                      )}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        {allStyleAnswersSelected && (
                          <motion.button
                            type="submit"
                            disabled={saving}
                            className="relative mt-8 overflow-hidden bg-gold px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg transition hover:bg-gold-light disabled:opacity-70"
                          >
                            <motion.span className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/35" animate={{ left: ["-35%", "130%"] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                            <span className="relative">{saving ? "Completing..." : "Complete Profile"}</span>
                          </motion.button>
                        )}
                      </StepFrame>
                    )}
                  </AnimatePresence>
                  {status && <p className="mt-4 text-sm text-danger">{status}</p>}
                  {step > 1 && (
                    <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} className="mt-5 text-sm text-muted hover:text-gold">
                      Back
                    </button>
                  )}
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StepFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <p className="text-sm uppercase tracking-[0.28em] text-gold">Complete Your Profile</p>
      <h2 className="mt-2 font-display text-5xl text-primary">{title}</h2>
      <div className="mt-8">{children}</div>
    </motion.section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-primary/82">
      <span className="mb-2 block text-muted">{label}</span>
      {children}
      {error && <span className="mt-2 block text-danger">{error}</span>}
    </label>
  );
}
