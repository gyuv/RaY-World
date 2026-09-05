import { useState } from "react";
import Image from "next/image";
import { backdropUrl, stillUrl } from "@/lib/images";
import { Video } from "@/lib/providers/types";
import { PlayIcon } from "@/components/icons";

interface WatchPlayerProps {
title: string;
backdropPath?: string | null;
stillPath?: string | null;
videos: Video[];
tmdbId: string;
}

export function WatchPlayer({
title,
backdropPath,
stillPath,
videos,
tmdbId,
}: WatchPlayerProps) {
const [playing, setPlaying] = useState(false);
const [server, setServer] = useState(1);

// Use the official YouTube trailer if available, otherwise use the first Peachify server
const trailer =
videos.find((v) => v.type === "Trailer" && v.official) ??
videos.find((v) => v.type === "Trailer");

const image =
stillUrl(stillPath, "w780") ?? backdropUrl(backdropPath, "w1280");

// Peachify Embed URL: https://peachify.top/embed/movie/{TMDB_ID}
const peachifyUrl = https://peachify.top/embed/movie/${tmdbId};

return (
<div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
{playing ? (
<>
{/* Server Selector */}
<div className="absolute top-4 right-4 z-20 flex gap-2">
{[1, 2, 3, 4].map((s) => (
<button
key={s}
onClick={() => setServer(s)}
className={`px-3 py-1 text-xs font-bold rounded-full transition ${
server === s ? "bg-ray-gradient text-ink-950" : "bg-black/60 text-white hover:bg-black/80"
}`}

{s}
</button>
))}
</div>

{/* If no trailer, load Peachify. If trailer exists, load that instead */}
{trailer ? (
<iframe
src={https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0}
title={${title} — preview}
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
allowFullScreen
className="h-full w-full"
/>
) : (
<iframe
src={${peachifyUrl}?server=${server}}
title={${title} — stream}
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
allowFullScreen
className="h-full w-full"
/>
)}

{/* Close Button */}
<button
onClick={() => setPlaying(false)}
className="absolute bottom-4 right-4 z-30 rounded-full bg-black/50 p-2 text-white hover:bg-black/80"

✕
</button>
</>
) : (
<>
{image ? (
<Image
src={image}
alt=""
fill
sizes="100vw"
className="object-cover opacity-70"
/>
) : (
<div className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />
)}
<div className="absolute inset-0 bg-ink-950/40" />
<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
<button
onClick={() => setPlaying(true)}
className="grid h-16 w-16 place-items-center rounded-full bg-ray-gradient text-ink-950 shadow-glow transition hover:scale-105"
aria-label="Play"

<PlayIcon className="text-2xl" />
</button>
<p className="max-w-md px-6 text-sm text-white/70">
{trailer
? "Playing official preview. Connect a licensed source to stream the full title."
: "Connect a licensed streaming source to play this title."}
</p>
</div>
</>
)}
</div>
);
}
