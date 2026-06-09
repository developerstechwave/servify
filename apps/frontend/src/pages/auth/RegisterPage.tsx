import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { message } from 'antd';
import AuthLeftPanel from '../../components/auth/AuthLeftPanel';
import RegisterProgress from '../../components/auth/RegisterProgress';
import RegisterStep1 from '../../components/auth/RegisterStep1';
import RegisterStep2 from '../../components/auth/RegisterStep2';
import RegisterSuccess from '../../components/auth/RegisterSuccess';
import { LINKS } from '../../lib/links';
import { authService } from '../../services/auth.service';

const PROGRESS = [30, 60, 100];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<any>(null);

  const token = searchParams.get('token') || '';
  const isAdmin = token.toUpperCase().startsWith('ADM');

  // Redirect if no token
  useEffect(() => {
    if (!token) navigate(LINKS.LOGIN);
  }, [token, navigate]);

  const handleStep1 = (values: any) => {
    setStep1Data(values);
    setStep(1);
  };

  const handleStep2 = async (values: any) => {
    try {
      setLoading(true);
      await authService.register({
        token:    step1Data.token,
        fullName: step1Data.fullName,
        email:    step1Data.email,
        password: step1Data.password,
        ...values,
        role: isAdmin ? 'admin' : 'customer',
      });
      setStep(2);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = step === 2;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel */}
      <div
        className="hidden lg:flex relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(86,144,198,0.9) 0%, rgba(101,16,127,0.85) 50%, rgba(60,10,80,1) 100%)',
        }}
      >
        <div className="absolute top-[-80px] left-[-60px] w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{ background: 'rgba(125,153,180,1)' }} />
        <div className="absolute bottom-[-60px] right-[-40px] w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'rgba(101,16,127,1)' }} />
        <AuthLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-form-bg px-6 py-12 min-h-screen">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="flex items-center mb-2">
            {!isSuccess && (
              <button
                onClick={() => step === 0 ? navigate(LINKS.LOGIN) : setStep(step - 1)}
                className="mr-4 text-text-main hover:text-primary transition-colors"
              >
                <ArrowLeftOutlined style={{ fontSize: 20 }} />
              </button>
            )}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-text-main">
                {isSuccess ? 'Account created' : 'Create an account'}
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {isSuccess
                  ? 'Congratulation! Your account has been successfully created'
                  : 'Please provide your details to get started'}
              </p>
            </div>
            {/* spacer to center title */}
            {!isSuccess && <div className="w-8" />}
          </div>

          {/* Progress */}
          <div className="mt-6">
            <RegisterProgress percent={PROGRESS[step]} />
          </div>

          {/* Steps */}
          {step === 0 && (
            <RegisterStep1
              isAdmin={isAdmin}
              initialToken={token}
              initialEmail=""
              onNext={handleStep1}
            />
          )}
          {step === 1 && (
            <RegisterStep2
              onPrevious={() => setStep(0)}
              onSubmit={handleStep2}
              loading={loading}
            />
          )}
          {step === 2 && <RegisterSuccess />}

        </div>
      </div>
    </div>
  );
}
