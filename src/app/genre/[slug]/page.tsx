import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/CategoryListing";
import { GENRES, getGenre } from "@/lib/config/genres";

export const revalidate = 3600;

type SP = Record<string, string | string[] | undefined>;

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const genre = getGenre(params.slug);
  return {
    title: genre ? `${genre.name} Movies & Series` : "Genre",
    description: genre
      ? `Discover the best ${genre.name} movies and series on RaY-World.`
      : undefined,
  };
}

export default function GenrePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SP;
}) {
  const genre = getGenre(params.slug);
  if (!genre) notFound();

  return (
    <CategoryListing
      title={`${genre.name}`}
      subtitle={`The best ${genre.name.toLowerCase()} movies and series.`}
      basePath={`/genre/${genre.slug}`}
      base={{ genre: genre.slug }}
      searchParams={searchParams}
    />
  );
}
