interface EmptyStateProps {
  type?:     'no-data' | 'no-results';
  title?:    string;
  subtitle?: string;
}

export default function EmptyState({
  type     = 'no-data',
  title,
  subtitle,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {type === 'no-data' ? (
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={0.8} className="text-gray-300">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      ) : (
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={0.8} className="text-gray-300">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
      )}
      <p className="text-sm font-semibold text-text-muted">
        {title ?? (type === 'no-data' ? 'No data found' : 'No results found')}
      </p>
      <p className="text-xs text-text-muted text-center max-w-xs">
        {subtitle ?? (
          type === 'no-data'
            ? 'You will see all data here when you add one.'
            : "We cannot find the item you're searching for."
        )}
      </p>
    </div>
  );
}
