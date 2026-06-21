import { useNavigate } from 'react-router-dom';
import { ServifyLogoMark } from '../components/auth/AuthLogo';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="flex items-center gap-3 mb-12">
        <ServifyLogoMark />
        <span className="text-xl font-bold" style={{ color: 'rgba(101,16,127,1)' }}>
          Customer Service
        </span>
      </div>

      <div className="text-center">
        {/* 404 illustration */}
        <div className="flex items-end justify-center gap-2 mb-8">
          <span className="text-8xl font-black" style={{ color: 'rgba(101,16,127,0.2)' }}>4</span>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-black mb-2"
            style={{ background: 'rgba(101,16,127,1)' }}
          >
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-8xl font-black" style={{ color: 'rgba(101,16,127,0.2)' }}>4</span>
        </div>

        <h1 className="text-3xl font-bold text-text-main mb-3">Something went wrong!</h1>
        <p className="text-text-muted mb-8">
          The requested page can not be found or might be temporarily unavailable.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'rgba(101,16,127,1)' }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
