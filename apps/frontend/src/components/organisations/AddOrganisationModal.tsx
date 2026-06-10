import { useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { organisationsService } from '../../services/organisations.service';

interface Props {
  open:    boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddOrganisationModal({ open, onClose, onSuccess }: Props) {
  const [form]    = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await organisationsService.invite(
        values.companyName,
        values.email,
        values.phone,
      );
      setSuccess(true);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSuccess(false);
    setShowMore(false);
    onClose();
  };

  const handleDone = () => {
    handleClose();
    onSuccess();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={560}
      title={!success && <span className="text-lg font-bold text-text-main">Add New Organization</span>}
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
          <h3 className="text-lg font-bold text-text-main mb-2">Invitation Sent!</h3>
          <p className="text-text-muted text-sm mb-6">
            An invitation email has been sent to the organisation.
            They can use the link to complete their registration.
          </p>
          <Button
            type="primary"
            onClick={handleDone}
            className="w-full h-11 rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Done
          </Button>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          className="mt-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Company Name</span>}
              name="companyName"
              rules={[{ required: true, message: 'Company name is required' }]}
            >
              <Input
                size="large"
                placeholder="Enter company name"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter email"
                className="rounded-xl"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Date</span>}
              name="date"
            >
              <DatePicker
                size="large"
                className="w-full rounded-xl"
                format="MM/DD/YYYY"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Phone</span>}
              name="phone"
            >
              <Input
                size="large"
                placeholder="Optional"
                className="rounded-xl"
              />
            </Form.Item>
          </div>

          {/* Add more fields */}
          {showMore && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-medium text-text-main">Address</span>}
                name="address"
              >
                <Input size="large" placeholder="Enter address" className="rounded-xl" />
              </Form.Item>
              <Form.Item
                label={<span className="text-sm font-medium text-text-main">Description</span>}
                name="description"
              >
                <Input size="large" placeholder="Brief description" className="rounded-xl" />
              </Form.Item>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 text-sm font-medium text-primary mb-6 hover:text-primary-hover transition-colors"
          >
            <PlusOutlined />
            {showMore ? 'Show less' : 'Add more'}
          </button>

          <div className="flex gap-3">
            <Button
              size="large"
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl font-semibold border-primary text-primary"
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
              Add Organization
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}
