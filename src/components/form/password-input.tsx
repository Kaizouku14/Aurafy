"use client";

import { Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useState } from "react";
import { Input } from "../ui/input";

const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>((props, ref) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const value = props.value ?? "";

  return (
    <div className="relative">
      <Input {...props} ref={ref} type={showPassword ? "text" : "password"} />

      {value.toString().length > 0 && (
        <button
          type="button"
          className="absolute top-1/2 right-3 -translate-y-1/2"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <Eye className="text-primary hover:text-primary/80 h-5 w-5 transition-colors" />
          ) : (
            <EyeOff className="text-primary hover:text-primary/80 h-5 w-5 transition-colors" />
          )}
        </button>
      )}
    </div>
  );
});

PasswordInput.displayName = "Password Input";

export default PasswordInput;
