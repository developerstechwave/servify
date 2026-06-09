const features = [
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Visit our Support Center',
    description: 'Get guidance from our support team.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Join an Organization',
    description: 'Empower your future with Us.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    title: 'Become an Organization',
    description: 'Get the tools to manage your services.',
  },
];

export default function AuthLeftPanel() {
  return (
    <div className="h-full flex flex-col justify-center px-12 py-16 gap-8">
      <div className="flex flex-col gap-6">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              {f.icon}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{f.title}</p>
              <p className="text-white/60 text-xs mt-0.5">{f.description}</p>
            </div>
            <svg className="text-white/60 group-hover:text-white transition-colors" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
