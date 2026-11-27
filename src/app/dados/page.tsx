import type { Metadata } from "next";
import { DataPage } from "@/features/data/DataPage";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t("data.title") };

export default function Page() {
  return <DataPage />;
}
