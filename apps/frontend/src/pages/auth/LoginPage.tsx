import AuthLeftPanel from '../../components/auth/AuthLeftPanel';
import AuthLogo from '../../components/auth/AuthLogo';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div
        className="hidden lg:flex relative overflow-hidden"
        style={{
          background:
            'linear-gradient(160deg, rgba(86,144,198,0.9) 0%, rgba(101,16,127,0.85) 50%, rgba(60,10,80,1) 100%)',
        }}
      >

        <div
          className="absolute -top-20 -left-15 w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{ background: 'rgba(125,153,180,1)' }}
        />
        <div
          className="absolute -bottom-15 -right-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'rgba(101,16,127,1)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'rgba(0,82,180,1)' }}
        />
        <AuthLeftPanel />
      </div>

      <div className="flex items-center justify-center bg-form-bg px-6 py-12">
        <div className="w-full max-w-md">
          <AuthLogo title="Welcome back" subtitle="Please enter your details" />
          <div className="bg-form-bg border border-border rounded-2xl p-8 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
