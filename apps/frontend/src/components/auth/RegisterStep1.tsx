import { Form, Input, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

interface Step1Values {
  token: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  isAdmin: boolean;
  initialToken: string;
  initialEmail: string;
  onNext: (values: Step1Values) => void;
}

export default function RegisterStep1({ isAdmin, initialToken, initialEmail, onNext }: Props) {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{ token: initialToken, email: initialEmail }}
      onFinish={onNext}
      className="w-full"
    >
      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Registration Token</span>}
        name="token"
      >
        <Input
          size="large"
          readOnly
          className="rounded-xl bg-secondary border-border text-text-muted"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className="text-base font-semibold text-text-main">
            {isAdmin ? 'Company Name' : 'Full Name'}
          </span>
        }
        name="fullName"
        rules={[{ required: true, message: `${isAdmin ? 'Company name' : 'Full name'} is required` }]}
      >
        <Input
          size="large"
          placeholder={isAdmin ? 'Enter your company name' : 'Enter your full name'}
          className="rounded-xl border-border"
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Email</span>}
        name="email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Enter a valid email' },
        ]}
      >
        <Input
          size="large"
          placeholder="Enter your email"
          className="rounded-xl border-border"
          readOnly={!!initialEmail}
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Password</span>}
        name="password"
        rules={[
          { required: true, message: 'Password is required' },
          { min: 8, message: 'Must be 8 characters' },
        ]}
      >
        <Input.Password
          size="large"
          placeholder="Must be 8 characters"
          className="rounded-xl border-border"
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Confirm Password</span>}
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          placeholder="Repeat password"
          className="rounded-xl border-border"
        />
      </Form.Item>

      <div className="flex justify-end mt-6">
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          className="px-10 h-12 rounded-xl font-semibold"
          style={{ background: 'rgba(101, 16, 127, 1)', border: 'none' }}
        >
          Next
        </Button>
      </div>
    </Form>
  );
}
