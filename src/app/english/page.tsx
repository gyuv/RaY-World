import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const metadata: Metadata = {
  title: "English",
  description: "Popular English movies and series on RaY-World.",
};
export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

export default function EnglishPage({ searchParams }: { searchParams: SP }) {
  return (
    <CategoryListing
      title="English"
      subtitle="Popular English movies and series."
      basePath="/english"
      base={{ language: "en" }}
      searchParams={searchParams}
    />
  );
}
