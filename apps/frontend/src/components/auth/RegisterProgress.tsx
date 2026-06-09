interface RegisterProgressProps {
  percent: number;
}

export default function RegisterProgress({ percent }: RegisterProgressProps) {
  return (
    <div
      className="w-full rounded-xl p-4 mb-8"
      style={{ background: 'rgba(101, 16, 127, 0.06)' }}
    >
      <p className="text-sm font-semibold text-primary mb-1">Your progress</p>
      <p className="text-base font-bold text-text-main mb-3">{percent}% to complete</p>
      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: 'rgba(101, 16, 127, 1)',
          }}
        />
      </div>
    </div>
  );
}
