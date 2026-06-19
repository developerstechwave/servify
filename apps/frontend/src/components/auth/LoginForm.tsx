import { useState } from 'react';
import { Form, Input, Checkbox, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LINKS } from '../../lib/links';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const data = await authService.login(values.email, values.password);
      setAuth(data.accessToken, data.user);

      switch (data.user.role) {
        case 'super_admin': navigate(LINKS.SUPER_ADMIN_DASHBOARD); break;
        case 'admin':       navigate(LINKS.ADMIN_DASHBOARD);       break;
        case 'employee':    navigate(LINKS.EMPLOYEE_DASHBOARD);          break;
        case 'customer':    navigate(LINKS.CUSTOMER_DASHBOARD);    break;
        default:            navigate(LINKS.LOGIN);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
      className="w-full"
    >
      <Form.Item
        label={<span className="text-sm font-medium text-text-main">Email</span>}
        name="email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Enter a valid email' },
        ]}
      >
        <Input
          placeholder="Enter your email"
          size="large"
          className="rounded-lg border-border"
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-sm font-medium text-text-main">Password</span>}
        name="password"
        rules={[{ required: true, message: 'Password is required' }]}
      >
        <Input.Password
          placeholder="Enter your password"
          size="large"
          className="rounded-lg border-border"
        />
      </Form.Item>

      <div className="flex items-center justify-between mb-6">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>
            <span className="text-sm text-text-muted">Remember me for 20 days</span>
          </Checkbox>
        </Form.Item>
        <Link
          to={LINKS.FORGOT_PASSWORD}
          className="text-sm font-medium text-primary! hover:text-primary-hover"
        >
          Forgot password?
        </Link>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          className="w-full h-12 rounded-lg font-semibold text-base"
          style={{ background: 'rgba(101, 16, 127, 1)', border: 'none' }}
        >
          Sign In
        </Button>
      </Form.Item>

      <div className="text-center text-sm text-text-muted">
        Don't have an account?{' '}
        <Link to={LINKS.JOIN_ORG} className="text-primary! font-medium hover:text-primary-hover">
          Sign Up
        </Link>
      </div>
    </Form>
  );
}
