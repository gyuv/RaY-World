import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/CategoryListing";
import { GENRES, getGenre } from "@/lib/config/genres";

export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

// A curated set of Tamil + genre landing pages (spec §27).
export function generateStaticParams() {
  return ["action", "thriller", "romance", "comedy", "crime", "drama", "horror"].map(
    (genre) => ({ genre }),
  );
}

export function generateMetadata({
  params,
}: {
  params: { genre: string };
}): Metadata {
  const genre = getGenre(params.genre);
  return {
    title: genre ? `Tamil ${genre.name}` : "Tamil",
    description: genre
      ? `Discover the best Tamil ${genre.name.toLowerCase()} movies on RaY-World.`
      : undefined,
  };
}

export default function TamilGenrePage({
  params,
  searchParams,
}: {
  params: { genre: string };
  searchParams: SP;
}) {
  const genre = getGenre(params.genre);
  if (!genre) notFound();

  return (
    <CategoryListing
      title={`Tamil ${genre.name}`}
      accent="தமிழ்"
      basePath={`/tamil/${genre.slug}`}
      base={{ language: "ta", genre: genre.slug }}
      searchParams={searchParams}
    />
  );
}
