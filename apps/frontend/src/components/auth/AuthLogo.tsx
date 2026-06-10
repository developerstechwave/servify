interface AuthLogoProps {
  title: string;
  subtitle: string;
}

export const ServifyLogoMark = () => (
  <div
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{ background: 'rgba(101, 16, 127, 1)' }}
  >
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
      stroke="white" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

export default function AuthLogo({ title, subtitle }: AuthLogoProps) {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <div className="flex items-center gap-3">
        <ServifyLogoMark />
        <span className="text-xl font-bold text-primary tracking-tight">Servify</span>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-main">{title}</h1>
        <p className="text-text-muted text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
