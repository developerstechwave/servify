import { useState } from 'react';
import { Modal, Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { joinService } from '../../services/join.service';

interface Props {
  open:    boolean;
  onClose: () => void;
}

export default function OrganisationJoinModal({ open, onClose }: Props) {
  const [form]    = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await joinService.organisationJoinRequest({
        companyName:  values.companyName,
        email:        values.email,
        phone:        values.phone,
        description:  values.description,
      });
      setSuccess(true);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={560}
      styles={{ body: { padding: '8px 0' } }}
    >
      {success ? (
        <div className="flex flex-col items-center text-center py-8 px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(101,16,127,0.08)' }}
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"
              stroke="rgba(101,16,127,1)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">Request Submitted!</h3>
          <p className="text-text-muted text-sm mb-6">
            Your company registration request has been submitted to Servify.
            Our team will review it and contact you shortly.
          </p>
          <Button
            type="primary"
            onClick={handleClose}
            className="w-full h-11 rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Done
          </Button>
        </div>
      ) : (
        <div className="px-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text-main">Join Servify as an Organisation</h3>
            <p className="text-sm text-text-muted mt-1">
              Submit your details and our team will review your application
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleSubmit}
          >
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium text-text-main">Company Name</span>}
                name="companyName"
                rules={[{ required: true, message: 'Company name is required' }]}
              >
                <Input size="large" placeholder="Enter company name" className="rounded-xl" />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-medium text-text-main">Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input size="large" placeholder="Enter your email" className="rounded-xl" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium text-text-main">Phone</span>}
                name="phone"
                rules={[{ required: true, message: 'Phone is required' }]}
              >
                <PhoneInput
                  country="gh"
                  enableSearch
                  inputStyle={{
                    width: '100%', height: '40px',
                    borderRadius: '12px',
                    border: '1px solid rgba(220,215,225,1)',
                    fontSize: '14px',
                  }}
                  buttonStyle={{
                    borderRadius: '12px 0 0 12px',
                    border: '1px solid rgba(220,215,225,1)',
                  }}
                  onChange={(phone) => form.setFieldValue('phone', phone)}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-medium text-text-main">Business Certificate</span>}
                name="certificate"
              >
                <Upload
                  accept=".pdf"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <Input
                    size="large"
                    placeholder="Certificate must be a pdf"
                    className="rounded-xl cursor-pointer"
                    readOnly
                    suffix={<UploadOutlined className="text-text-muted" />}
                  />
                </Upload>
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Tell Us About Yourself</span>}
              name="description"
            >
              <Input.TextArea
                rows={4}
                placeholder="Tell us about your company and why you want to join Servify"
                className="rounded-xl"
              />
            </Form.Item>

            <div className="flex gap-3 mt-2">
              <Button
                size="large"
                onClick={handleClose}
                className="flex-1 h-11 rounded-xl font-semibold border-border"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="flex-1 h-11 rounded-xl font-semibold"
                style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
              >
                Send Request
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
}
