import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const metadata: Metadata = {
  title: "Series",
  description: "Browse TV series and web series across every language on RaY-World.",
};
export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

export default function SeriesPage({ searchParams }: { searchParams: SP }) {
  return (
    <CategoryListing
      title="Series"
      subtitle="TV shows and web series across every language."
      basePath="/series"
      base={{ type: "tv" }}
      searchParams={searchParams}
    />
  );
}
