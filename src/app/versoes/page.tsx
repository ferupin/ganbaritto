import type { Metadata } from "next";
import { ChangelogPage } from "@/features/changelog/ChangelogPage";
import { t } from "@/i18n";

export const metadata: Metadata = { title: t("changelog.title") };

export default function Page() {
  return <ChangelogPage />;
}
