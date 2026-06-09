import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LINKS } from '../../lib/links';

export default function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center w-full">
      <div
        className="w-40 h-40 flex items-center justify-center mb-8 rounded-2xl"
        style={{ border: '2px dashed rgba(101, 16, 127, 0.3)' }}
      >
        <svg width="80" height="80" fill="none" viewBox="0 0 80 80">
          <path
            d="M40 8C22.4 8 8 22.4 8 40s14.4 32 32 32 32-14.4 32-32S57.6 8 40 8z"
            stroke="rgba(101,16,127,1)"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M25 40l10 10 20-20"
            stroke="rgba(101,16,127,1)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="26" r="2" fill="rgba(101,16,127,0.3)" />
          <circle cx="66" cy="54" r="2" fill="rgba(101,16,127,0.3)" />
          <line x1="60" y1="14" x2="66" y2="20" stroke="rgba(101,16,127,0.4)" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="60" x2="20" y2="66" stroke="rgba(101,16,127,0.4)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div
        className="w-full rounded-xl p-4 mb-6 text-left"
        style={{
          border: '1px dashed rgba(101, 16, 127, 0.3)',
          background: 'rgba(101, 16, 127, 0.03)',
        }}
      >
        <p className="text-text-muted text-sm text-center">
          Kindly visit your email to verify your account.
        </p>
      </div>

      <Button
        type="primary"
        size="large"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(LINKS.LOGIN)}
        className="w-full h-14 rounded-xl font-semibold text-base"
        style={{ background: 'rgba(101, 16, 127, 1)', border: 'none' }}
      >
        Back to Sign In
      </Button>
    </div>
  );
}
