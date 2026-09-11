// src/lib/stream-hls.ts

export interface PlayableSource {
  id: string;
  label: string;
  url: string;
  kind?: "stream" | "embed" | "file" | "hls";
  quality?: string;
  region?: string;
}

export async function getStreamSources(
  type: "movie" | "tv",
  id: number | string,
  season?: number,
  episode?: number,
): Promise<PlayableSource[]> {
  if (!id) return [];

  const s = season || 1;
  const e = episode || 1;

  // Path helpers for different provider URL schemas
  const standardPath = type === "movie" ? `movie/${id}` : `tv/${id}/${s}/${e}`;
  const twoEmbedPath = type === "movie" ? `embed/${id}` : `embedtv/${id}&s=${s}&e=${e}`;

  return [
    { 
      id: "server-vidlink", 
      label: "Shih Tzu", 
      url: `https://vidlink.pro/${standardPath}`, 
      kind: "embed",
      region: "US"
    },
    { 
      id: "server-peachify", 
      label: "Golden Retriever", 
      url: `https://peachify.pro/embed/${standardPath}`, 
      kind: "embed",
      region: "US"
    },
    { 
      id: "server-2embed", 
      label: "German Shepherd", 
      url: `https://www.2embed.cc/${twoEmbedPath}`, 
      kind: "embed",
      region: "US"
    },
    { 
      id: "server-vidsrc-icu", 
      label: "Husky", 
      url: `https://vidsrc.icu/embed/${standardPath}`, 
      kind: "embed",
      region: "US"
    },
    {
      id: "server-vidsrc-cc",
      label: "Beagle",
      url: `https://vidsrc.cc/v2/embed/${standardPath}`,
      kind: "embed",
      region: "JP"
    },
    {
      id: "server-vidsrc-vip",
      label: "Pug",
      url: `https://vidsrc.vip/embed/${standardPath}`,
      kind: "embed",
      region: "BR"
    }
  ];
}

export { getStreamSources as getPlayableSources };
