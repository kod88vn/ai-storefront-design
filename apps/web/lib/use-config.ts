"use client";

import { useEffect, useState } from "react";
import type { StorefrontConfig } from "@ai-storefront/types";

let cached: StorefrontConfig | null = null;

export function useConfig() {
  const [config, setConfig] = useState<StorefrontConfig | null>(cached);

  useEffect(() => {
    if (cached) {
      setConfig(cached);
      return;
    }
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: StorefrontConfig) => {
        cached = data;
        setConfig(data);
      })
      .catch(() => {});
  }, []);

  return config;
}
