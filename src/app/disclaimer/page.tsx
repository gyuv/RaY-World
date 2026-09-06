import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "RaY-World disclaimer — how our catalog, metadata, and streaming integrations work, and our intellectual-property and copyright policy.",
};

const UPDATED = "September 2026";

export default function DisclaimerPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ray-300">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Disclaimer
          </h1>
          <p className="mt-2 text-sm text-white/50">Last updated: {UPDATED}</p>
          <div className="divider-gold mt-6" />
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-white/75">
          <Section title="1. About RaY-World">
            <p>
              RaY-World is an entertainment <strong>discovery</strong> platform.
              It helps people find and explore movies and series — with a
              Tamil-first focus — through search, browsing, ratings, cast and
              crew information, trailers, and recommendations. RaY-World is an
              independent product and is not affiliated with, endorsed by, or
              sponsored by any studio, distributor, streaming service, or the
              rights holders of any title listed on the platform.
            </p>
          </Section>

          <Section title="2. Metadata &amp; Attribution">
            <p>
              Catalog information (titles, posters, artwork, descriptions,
              ratings, cast and release details) is provided by third-party
              metadata providers, primarily{" "}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
                className="text-ray-300 hover:underline"
              >
                The Movie Database (TMDB)
              </a>
              . This product uses the TMDB API but is not endorsed or certified
              by TMDB. All such metadata remains the property of its respective
              providers and rights holders.
            </p>
          </Section>

          <Section title="3. Intellectual Property">
            <p>
              All film and series titles, names, characters, logos, images,
              trailers, and related materials are the property of their
              respective owners and are used for identification and informational
              purposes only. Their appearance on RaY-World does not imply any
              ownership, affiliation, or endorsement. The RaY-World name, logo,
              design, and source code are the property of RaY-World and are
              protected by copyright.
            </p>
          </Section>

          <Section title="4. Streaming &amp; Content Sources">
            <p>
              RaY-World does not condone or facilitate the unauthorized
              distribution of copyrighted material. Any playback available
              through the platform is intended to operate <strong>only</strong>{" "}
              through authorized and licensed sources — such as official provider
              embeds, licensed streaming partners, or content the operator owns
              or has the rights to distribute. RaY-World does not host, upload,
              scrape, or knowingly link to pirated or infringing streams.
            </p>
          </Section>

          <Section title="5. External Links">
            <p>
              The platform may reference or link to third-party websites and
              services (for example, official trailers or authorized providers).
              RaY-World does not control and is not responsible for the content,
              policies, or practices of those third parties. Accessing them is at
              your own discretion and subject to their terms.
            </p>
          </Section>

          <Section title="6. No Warranty">
            <p>
              RaY-World is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis, without warranties of any kind, whether
              express or implied. We do not guarantee that catalog information is
              accurate, complete, current, or uninterrupted, and availability may
              change without notice.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, RaY-World and its operators
              shall not be liable for any loss or damage arising from the use of,
              or inability to use, the platform or any content or third-party
              service referenced through it.
            </p>
          </Section>

          <Section title="8. Copyright &amp; Takedown">
            <p>
              We respect intellectual-property rights. If you are a rights holder
              and believe that material displayed or referenced on RaY-World
              infringes your rights, please send a notice including the specific
              title/URL, proof of your rights, and your contact details to the
              address below, and we will review and act on valid requests
              promptly.
            </p>
            <p className="mt-2">
              Copyright / takedown contact:{" "}
              <a
                href="mailto:legal@ray-world.example"
                className="text-ray-300 hover:underline"
              >
                legal@ray-world.example
              </a>{" "}
              <span className="text-white/40">
                (replace with your real contact address)
              </span>
              .
            </p>
          </Section>

          <Section title="9. Changes to This Disclaimer">
            <p>
              We may update this disclaimer from time to time. Continued use of
              RaY-World after changes are posted constitutes acceptance of the
              updated terms.
            </p>
          </Section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
          <Link href="/browse" className="btn-ghost">
            Browse the Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}
