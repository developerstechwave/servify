import { Form, Input, Select, Button } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
  'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo',
  'Oti', 'Bono', 'Bono East', 'Ahafo', 'Savannah',
  'North East', 'Western North',
];

const COUNTRIES = [
  'Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United States',
  'United Kingdom', 'Canada', 'Germany', 'France', 'Other',
];

interface Step2Values {
  address1: string;
  address2?: string;
  region: string;
  country: string;
  phone: string;
}

interface Props {
  onPrevious: () => void;
  onSubmit: (values: Step2Values) => void;
  loading: boolean;
}

export default function RegisterStep2({ onPrevious, onSubmit, loading }: Props) {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onSubmit}
      className="w-full"
    >
      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Address 1</span>}
        name="address1"
        rules={[{ required: true, message: 'Address is required' }]}
      >
        <Input
          size="large"
          placeholder="Enter your first address"
          className="rounded-xl border-border"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className="text-base font-semibold text-text-main">
            Address 2 <span className="text-text-muted font-normal">(Optional)</span>
          </span>
        }
        name="address2"
      >
        <Input
          size="large"
          placeholder="Enter your second address"
          className="rounded-xl border-border"
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Region</span>}
        name="region"
        rules={[{ required: true, message: 'Region is required' }]}
      >
        <Select
          size="large"
          placeholder="Select region"
          className="rounded-xl"
        >
          {REGIONS.map((r) => (
            <Select.Option key={r} value={r}>{r}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Country</span>}
        name="country"
        rules={[{ required: true, message: 'Country is required' }]}
      >
        <Select
          size="large"
          placeholder="Select country"
          className="rounded-xl"
        >
          {COUNTRIES.map((c) => (
            <Select.Option key={c} value={c}>{c}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={<span className="text-base font-semibold text-text-main">Phone</span>}
        name="phone"
        rules={[{ required: true, message: 'Phone number is required' }]}
      >
        <PhoneInput
          country="gh"
          enableSearch
          inputStyle={{
            width: '100%',
            height: '40px',
            borderRadius: '12px',
            border: '1px solid rgba(220, 215, 225, 1)',
            fontSize: '14px',
          }}
          buttonStyle={{
            borderRadius: '12px 0 0 12px',
            border: '1px solid rgba(220, 215, 225, 1)',
          }}
          placeholder="Enter your contact"
          onChange={(phone) => form.setFieldValue('phone', phone)}
        />
      </Form.Item>

      <div className="flex justify-between mt-6">
        <Button
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={onPrevious}
          className="px-8 h-12 rounded-xl font-semibold border-primary text-primary"
        >
          Previous
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          className="px-10 h-12 rounded-xl font-semibold"
          style={{ background: 'rgba(101, 16, 127, 1)', border: 'none' }}
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}
