"use client";

import { useRef, useState } from "react";

export default function OtpInput({ onChange }: { onChange: (value: string) => void }) {
  const [values, setValues] = useState(Array(6).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  return (
    <div className="flex gap-2">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={value}
          inputMode="numeric"
          maxLength={1}
          aria-label={`OTP digit ${index + 1}`}
          onChange={(event) => {
            const next = [...values];
            next[index] = event.target.value.replace(/\D/g, "").slice(0, 1);
            setValues(next);
            onChange(next.join(""));
            if (next[index] && index < 5) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !values[index] && index > 0) refs.current[index - 1]?.focus();
          }}
          className="h-12 w-11 border border-[rgba(201,168,76,0.2)] bg-bg text-center text-lg text-primary outline-none transition focus:border-gold focus:shadow-[0_0_20px_rgba(201,168,76,0.28)]"
        />
      ))}
    </div>
  );
}
