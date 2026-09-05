import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const metadata: Metadata = {
  title: "Tamil",
  description:
    "Tamil movies and series — trending, latest and top rated Tamil entertainment on RaY-World.",
};
export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

export default function TamilPage({ searchParams }: { searchParams: SP }) {
  return (
    <CategoryListing
      title="Tamil"
      accent="தமிழ் திரைப்படங்கள் & தொடர்கள்"
      subtitle="The best of Tamil cinema and series."
      basePath="/tamil"
      base={{ language: "ta" }}
      searchParams={searchParams}
    />
  );
}
