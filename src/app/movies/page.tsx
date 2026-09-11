import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse movies across every language on RaY-World.",
};
export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

export default function MoviesPage({ searchParams }: { searchParams: SP }) {
  return (
    <CategoryListing
      title="Movies"
      subtitle="Feature films across every language."
      basePath="/movies"
      base={{ type: "movie" }}
      searchParams={searchParams}
      showFilters
      defaultSort="latest"
    />
  );
}
