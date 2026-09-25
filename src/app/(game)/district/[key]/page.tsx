import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { districtByKey } from "@/content/districts";
import { topicsFor } from "@/content/topics";
import { DistrictScreen } from "@/features/district/DistrictScreen";

export const metadata: Metadata = { title: "District" };

export default async function DistrictPage({ params }: PageProps<"/district/[key]">) {
  const { key } = await params;
  const district = districtByKey(key);
  const topics = district ? topicsFor(district.key) : [];
  if (!district || topics.length === 0) notFound();
  return (
    <AppShell>
      <DistrictScreen district={district} topics={topics} />
    </AppShell>
  );
}
