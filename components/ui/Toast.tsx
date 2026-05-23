"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

export type ToastMessage = {
  id: string;
  type: ToastType;
  message: string;
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle
};

const colors = {
  success: "text-emerald-300",
  error: "text-red-300",
  warning: "text-amber-300"
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3000);
  }, []);

  return { toasts, toast };
}

export function ToastViewport({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="fixed right-4 top-4 z-[80] grid w-[min(360px,calc(100vw-32px))] gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className="flex items-center gap-3 border-l-2 border-gold bg-card p-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
            >
              <Icon className={colors[toast.type]} size={19} />
              <p className="text-sm text-primary/86">{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
