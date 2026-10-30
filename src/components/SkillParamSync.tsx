"use client";

import { Suspense } from "react";
import { useSkillParam } from "@/state/useSkillParam";

function Sync() {
  useSkillParam();
  return null;
}

/**
 * useSearchParams makes its subtree client-rendered in a static export, up to the nearest
 * Suspense boundary. The boundary sits here, outside <main>, and its fallback is empty, so
 * no page content is ever held back behind it.
 */
export function SkillParamSync() {
  return (
    <Suspense fallback={null}>
      <Sync />
    </Suspense>
  );
}
