interface SLABadgeProps {
  slaDeadline: string | null;
  slaBreached: boolean;
  resolved:    boolean;
}

export default function SLABadge({ slaDeadline, slaBreached, resolved }: SLABadgeProps) {
  if (resolved || !slaDeadline) return null;

  if (slaBreached) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
        SLA Breached
      </span>
    );
  }

  const now       = new Date();
  const deadline  = new Date(slaDeadline);
  const hoursLeft = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (hoursLeft <= 4) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        {hoursLeft < 1 ? '< 1h left' : `${Math.floor(hoursLeft)}h left`}
      </span>
    );
  }

  return null;
}
