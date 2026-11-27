"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ExamRunner } from "@/features/runner/ExamRunner";
import { t } from "@/i18n";

function Inner() {
  const id = useSearchParams().get("id");
  if (!id)
    return (
      <div className="sheet">
        <h1 className="page-title">{t("runner.noneTitle")}</h1>
        <p className="lead">{t("runner.noneBody")}</p>
        <Link className="btn btn-primary" href="/">
          {t("runner.goLibrary")}
        </Link>
      </div>
    );
  return <ExamRunner examId={id} />;
}

export default function ProvaPage() {
  return (
    <Suspense
      fallback={
        <div className="sheet">
          <p>{t("common.loading")}</p>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
