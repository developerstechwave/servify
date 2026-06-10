import { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { joinService } from '../../services/join.service';

interface Organisation {
  id:   string;
  name: string;
  logo?: string;
}

interface Props {
  open:         boolean;
  organisation: Organisation | null;
  onClose:      () => void;
}

export default function CustomerJoinModal({ open, organisation, onClose }: Props) {
  const [form]    = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!organisation) return;
    try {
      setLoading(true);
      await joinService.customerJoinRequest({
        name:           values.name,
        email:          values.email,
        phone:          values.phone,
        organisationId: organisation.id,
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
      width={480}
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
          <h3 className="text-lg font-bold text-text-main mb-2">Request Sent!</h3>
          <p className="text-text-muted text-sm mb-6">
            Your request to join <strong>{organisation?.name}</strong> has been submitted.
            You will receive an email once it is approved.
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
          {/* Org info */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: 'rgba(101,16,127,1)' }}
            >
              {organisation?.name?.[0]}
            </div>
            <div>
              <p className="font-semibold text-text-main">{organisation?.name}</p>
              <p className="text-xs text-text-muted">Send a request to join this organisation</p>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleSubmit}
          >
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Full Name</span>}
              name="name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input size="large" placeholder="Enter your full name" className="rounded-xl" />
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

            <div className="flex gap-3 mt-6">
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
