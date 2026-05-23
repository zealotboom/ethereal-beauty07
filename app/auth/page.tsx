"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import OtpInput from "@/components/OtpInput";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});

const otpSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email.")
});

const signUpSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Confirm your password.")
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords must match.",
  path: ["confirmPassword"]
});

type AuthMode = "sign-in" | "otp" | "sign-up";
type SignInForm = z.infer<typeof signInSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export default function AuthPage() {
  const router = useRouter();
  const setEmailStore = useAuthStore((state) => state.setEmail);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const signInForm = useForm<SignInForm>({ resolver: zodResolver(signInSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });
  const signUpForm = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema) });

  useEffect(() => {
    if (!countdown) return;
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setSuccess(false);
    setLoading(false);
    setOtp("");
    setOtpSent(false);
  }

  function requireSupabase() {
    if (hasSupabaseBrowserEnv()) return true;
    setSuccess(false);
    setMessage("Add Supabase env vars to enable authentication.");
    return false;
  }

  async function signIn(values: SignInForm) {
    if (!requireSupabase()) return;
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    setLoading(false);
    if (error) {
      setSuccess(false);
      setMessage(error.message);
      return;
    }

    setEmailStore(values.email);
    setSuccess(true);
    setMessage("Signed in.");
    router.push("/profile");
  }

  async function sendOtp(values: OtpForm) {
    if (!requireSupabase()) return;
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email: values.email });

    setLoading(false);
    if (error) {
      setSuccess(false);
      setMessage(error.message);
      return;
    }

    setEmailStore(values.email);
    setOtpSent(true);
    setCountdown(60);
    setSuccess(true);
    setMessage("Code sent. Check your inbox.");
  }

  async function verifyOtp() {
    const valid = await otpForm.trigger("email");
    if (!valid || otp.length !== 6 || !requireSupabase()) return;
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: otpForm.getValues("email"),
      token: otp,
      type: "email"
    });

    setLoading(false);
    if (error) {
      setSuccess(false);
      setMessage(error.message);
      return;
    }

    setSuccess(true);
    setMessage("Signed in.");
    router.push("/profile");
  }

  async function forgotPassword() {
    const valid = await signInForm.trigger("email");
    if (!valid || !requireSupabase()) return;
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(signInForm.getValues("email"), {
      redirectTo: `${window.location.origin}/profile`
    });

    setLoading(false);
    setSuccess(!error);
    setMessage(error ? error.message : "Password reset link sent.");
  }

  async function createAccount(values: SignUpForm) {
    if (!requireSupabase()) return;
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name, full_name: values.name },
        emailRedirectTo: `${window.location.origin}/profile`
      }
    });

    setLoading(false);
    if (error) {
      setSuccess(false);
      setMessage(error.message);
      return;
    }

    setEmailStore(values.email);
    setSuccess(true);
    setMessage("Check your email to verify your account!");

    if (data.session) {
      router.push("/profile");
    }
  }

  return (
    <div className="luxury-shell max-w-xl">
      <AnimatePresence mode="wait">
        {mode === "sign-in" && (
          <ModePanel key="sign-in" title="Enter the House">
            <form onSubmit={signInForm.handleSubmit(signIn)} className="grid gap-4">
              <Field error={signInForm.formState.errors.email?.message}>
                <input {...signInForm.register("email")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" placeholder="Email address" />
              </Field>
              <Field error={signInForm.formState.errors.password?.message}>
                <input {...signInForm.register("password")} type="password" className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" placeholder="Password" />
              </Field>
              <GoldButton loading={loading}>Sign In</GoldButton>
              <button type="button" onClick={forgotPassword} className="text-left text-sm text-muted transition hover:text-gold">
                Forgot password?
              </button>
              <Divider />
              <button type="button" onClick={() => switchMode("otp")} className="border border-gold px-5 py-3 text-sm uppercase tracking-[0.15em] text-gold transition hover:bg-gold hover:text-bg">
                Sign in with OTP
              </button>
              <p className="text-center text-sm text-muted">
                New here?{" "}
                <button type="button" onClick={() => switchMode("sign-up")} className="text-gold hover:text-gold-light">
                  Create Account
                </button>
              </p>
              <StatusMessage success={success} message={message} />
            </form>
          </ModePanel>
        )}

        {mode === "otp" && (
          <ModePanel key="otp" title="Enter the House">
            <form onSubmit={otpForm.handleSubmit(sendOtp)} className="grid gap-4">
              <Field error={otpForm.formState.errors.email?.message}>
                <input {...otpForm.register("email")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" placeholder="Email address" />
              </Field>
              <GoldButton loading={loading}>Send Code</GoldButton>
              {otpSent && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
                  <OtpInput onChange={setOtp} />
                  <button type="button" onClick={verifyOtp} disabled={loading || otp.length !== 6} className="border border-gold px-5 py-3 text-sm uppercase tracking-[0.15em] text-gold transition hover:bg-gold hover:text-bg disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? <Loader2 className="mx-auto animate-spin" size={18} /> : "Verify Code"}
                  </button>
                  <button type="button" disabled={countdown > 0 || loading} onClick={otpForm.handleSubmit(sendOtp)} className="text-sm text-muted transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-60">
                    Resend {countdown > 0 ? `in ${countdown}s` : "now"}
                  </button>
                </motion.div>
              )}
              <button type="button" onClick={() => switchMode("sign-in")} className="text-left text-sm text-muted transition hover:text-gold">
                Back
              </button>
              <StatusMessage success={success} message={message} />
            </form>
          </ModePanel>
        )}

        {mode === "sign-up" && (
          <ModePanel key="sign-up" title="Join the House">
            <form onSubmit={signUpForm.handleSubmit(createAccount)} className="grid gap-4">
              <Field error={signUpForm.formState.errors.name?.message}>
                <input {...signUpForm.register("name")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" placeholder="Full Name" />
              </Field>
              <Field error={signUpForm.formState.errors.email?.message}>
                <input {...signUpForm.register("email")} className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" placeholder="Email address" />
              </Field>
              <Field error={signUpForm.formState.errors.password?.message}>
                <input {...signUpForm.register("password")} type="password" className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" placeholder="Password" />
              </Field>
              <Field error={signUpForm.formState.errors.confirmPassword?.message}>
                <input {...signUpForm.register("confirmPassword")} type="password" className="w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" placeholder="Confirm Password" />
              </Field>
              <GoldButton loading={loading}>Create Account</GoldButton>
              <p className="text-center text-sm text-muted">
                Already have account?{" "}
                <button type="button" onClick={() => switchMode("sign-in")} className="text-gold hover:text-gold-light">
                  Sign In
                </button>
              </p>
              <StatusMessage success={success} message={message} />
            </form>
          </ModePanel>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      <h1 className="font-display text-5xl text-primary">{title}</h1>
      <div className="mt-8 border border-[rgba(201,168,76,0.18)] bg-surface p-6">{children}</div>
    </motion.section>
  );
}

function Field({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 text-sm text-gold"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </label>
  );
}

function GoldButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      disabled={loading}
      className="flex items-center justify-center gap-2 bg-gold px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted">
      <span className="h-px flex-1 bg-[rgba(201,168,76,0.15)]" />
      or
      <span className="h-px flex-1 bg-[rgba(201,168,76,0.15)]" />
    </div>
  );
}

function StatusMessage({ success, message }: { success: boolean; message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-2 text-sm text-gold"
        >
          {success && <Check size={17} />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
