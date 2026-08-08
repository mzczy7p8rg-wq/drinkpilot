"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";

import {
  resolveWizardRedirect,
  type WizardRequirement,
} from "@/lib/wizardProgress";

export function useWizardRouteGuard(
  requirement: WizardRequirement
): {
  hydrated: boolean;
  ready: boolean;
} {
  const router = useRouter();

  const {
    data,
    hydrated,
  } = useStore();

  const redirectPath =
    hydrated
      ? resolveWizardRedirect(
          data,
          requirement
        )
      : null;

  useEffect(() => {
    if (redirectPath) {
      router.replace(
        redirectPath
      );
    }
  }, [
    redirectPath,
    router,
  ]);

  return {
    hydrated,
    ready:
      hydrated &&
      redirectPath === null,
  };
}
