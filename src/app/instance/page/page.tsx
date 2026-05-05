"use client";

import { useSearchParams } from "next/navigation";
import InstancePage from "@/components/instance/InstancePage";
import { Suspense } from "react";

function InstanceDetail() {
  const searchParams = useSearchParams();
  // 从 URL 的 ?id=xxx 中获取 UUID
  const uuid = searchParams.get("id") || "";

  return <InstancePage uuid={uuid} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InstanceDetail />
    </Suspense>
  );
}