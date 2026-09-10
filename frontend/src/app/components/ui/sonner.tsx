"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark">(
    "light"
  );

  // Acompanha a classe `dark` aplicada no <html> pelo app,
  // já que não usamos um ThemeProvider global.
  useEffect(() => {
    const root = document.documentElement;

    const atualizar = () =>
      setTheme(
        root.classList.contains("dark")
          ? "dark"
          : "light"
      );

    atualizar();

    const observer = new MutationObserver(atualizar);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
