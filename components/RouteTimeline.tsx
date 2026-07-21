import { useTranslations } from "next-intl";
import { MapPin, Car, Ship, Footprints, Plane, Train } from "lucide-react";
import type { RouteLeg } from "@/lib/types";

function transportIcon(transport?: string) {
  const t = (transport || "").toLowerCase();
  if (/เรือ|boat|cruise|ship|เกาะ|bateau|schiff|船/.test(t)) return Ship;
  if (/เดิน|walk|hike|trek|marche|wanderung|徒歩/.test(t)) return Footprints;
  if (/เครื่องบิน|flight|plane|fly|avion|flugzeug|飛行機/.test(t)) return Plane;
  if (/รถไฟ|train|zug|電車|列車/.test(t)) return Train;
  return Car;
}

export default function RouteTimeline({ legs }: { legs: RouteLeg[] }) {
  const t = useTranslations("tourDetail");
  const valid = legs.filter((l) => l.from || l.to);
  if (valid.length === 0) return null;

  // Build the ordered list of stop names: first leg's "from", then each leg's "to".
  const stops: string[] = [];
  if (valid[0].from) stops.push(valid[0].from!);
  for (const leg of valid) {
    if (leg.to) stops.push(leg.to);
  }

  return (
    <div className="flex flex-col">
      {stops.map((stop, i) => {
        const leg = valid[i]; // the leg leading INTO the next stop (undefined for last)
        const isFirst = i === 0;
        const isLast = i === stops.length - 1;
        const Icon = transportIcon(leg?.transport);
        return (
          <div key={`${stop}-${i}`}>
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className={isFirst ? "text-[var(--color-clay)]" : isLast ? "text-[var(--color-jade)]" : "text-[var(--color-gold)]"} />
              <span className="text-sm font-medium text-[var(--color-ink-soft)]">{stop}</span>
            </div>
            {!isLast && leg && (leg.duration || leg.distanceKm || leg.transport) && (
              <div className="ml-2 flex items-center gap-2 border-l-2 border-dashed border-[var(--color-border)] py-1.5 pl-4 text-xs text-[var(--color-muted)]">
                <Icon size={13} />
                <span>
                  {leg.duration}
                  {leg.duration && leg.distanceKm ? " · " : ""}
                  {leg.distanceKm ? `${leg.distanceKm} ${t("kmUnit")}` : ""}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
