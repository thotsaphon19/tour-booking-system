import type { PartnerEmbed } from "@/lib/queries/partnerEmbeds";

// Renders raw HTML that the site admin pasted in (e.g. a GetYourGuide/Viator
// affiliate badge). This is intentionally trusted content — only a logged-in
// admin can add these snippets — so it's rendered as-is rather than sanitized.
export default function PartnerEmbeds({ embeds }: { embeds: PartnerEmbed[] }) {
  if (embeds.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {embeds.map((embed) => (
        // eslint-disable-next-line react/no-danger
        <div key={embed.id} dangerouslySetInnerHTML={{ __html: embed.html }} />
      ))}
    </div>
  );
}
