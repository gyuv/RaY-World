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

  const path = type === "movie" ? `movie/${id}` : `tv/${id}/${s}/${e}`;

  return [
    { 
      id: "server-mbply", 
      label: "Shih Tzu", 
      url: `https://info.movieboxnoob.cc/video/${id}/video_1080p.m3u8`, 
      kind: "stream",
      region: "US"
    },
    { 
      id: "server-zetply", 
      label: "Golden Retriever", 
      url: `https://peachify.top/embed/${path}`, 
      kind: "embed",
      region: "US"
    },
    { 
      id: "server-orvid", 
      label: "German Shepherd", 
      url: `https://2embed.cc/embed/${path}`, 
      kind: "embed",
      region: "US"
    },
    { 
      id: "server-qsply", 
      label: "Husky", 
      url: `https://vidsrc.sbs/embed/${path}?provider=free`, 
      kind: "embed",
      region: "US"
    },
    {
      id: "server-vidlnx",
      label: "Beagle",
      url: `https://vidlink.pro/${path}`,
      kind: "embed",
      region: "JP"
    },
    {
      id: "server-vnst-alfa",
      label: "Pug",
      url: `https://vidsrc.vip/embed/${path}`,
      kind: "embed",
      region: "BR"
    }
  ];
}

export { getStreamSources as getPlayableSources };
