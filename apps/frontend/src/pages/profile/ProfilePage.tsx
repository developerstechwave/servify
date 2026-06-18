import { useEffect, useState, useRef } from 'react';
import { Form, Input, Select, Button, message, Spin, Tabs } from 'antd';
import { profileService } from '../../services/profile.service';
import { useAuthStore } from '../../store/auth.store';

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
  'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
];

const COUNTRIES = [
  'Ghana', 'Nigeria', 'Kenya', 'South Africa',
  'United States', 'United Kingdom', 'Canada', 'Other',
];

interface Profile {
  id:             string;
  firstName:      string;
  lastName:       string;
  email:          string;
  role:           string;
  avatar:         string | null;
  phone:          string | null;
  country:        string | null;
  region:         string | null;
  address:        string | null;
  description:    string | null;
  organisationId: string | null;
}

export default function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [editing, setEditing]         = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generalForm]  = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    profileService.getProfile()
      .then((data) => {
        setProfile(data);
        generalForm.setFieldsValue({
          fullName:    `${data.firstName} ${data.lastName}`,
          email:       data.email,
          phone:       data.phone,
          country:     data.country,
          region:      data.region,
          address:     data.address,
          description: data.description,
        });
      })
      .catch(() => message.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveGeneral = async (values: any) => {
    try {
      setSaving(true);
      const nameParts = values.fullName.trim().split(' ');
      const updated   = await profileService.updateProfile({
        firstName:   nameParts[0],
        lastName:    nameParts.slice(1).join(' ') || '-',
        email:       values.email,
        phone:       values.phone,
        country:     values.country,
        region:      values.region,
        address:     values.address,
        description: values.description,
      });
      setProfile(updated);
      setEditing(false);
      if (accessToken) {
        setAuth(accessToken, {
          ...user!,
          firstName: updated.firstName,
          lastName:  updated.lastName,
          email:     updated.email,
        });
      }
      message.success('Profile updated');
    } catch {
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (values: any) => {
    try {
      setSaving(true);
      await profileService.updatePassword(values.currentPassword, values.newPassword);
      message.success('Password updated');
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarLoading(true);
      const { avatar } = await profileService.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatar } : prev);
      message.success('Photo updated');
    } catch {
      message.error('Failed to upload photo');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setAvatarLoading(true);
      await profileService.removeAvatar();
      setProfile((prev) => prev ? { ...prev, avatar: null } : prev);
      message.success('Photo removed');
    } catch {
      message.error('Failed to remove photo');
    } finally {
      setAvatarLoading(false);
    }
  };

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  const roleLabel = profile?.role
    ?.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') + ' Profile';

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h2 className="text-lg font-bold text-primary">Profile</h2>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-border p-6 flex items-center gap-5">
        <div className="relative">
          {profile?.avatar ? (
            <img
              src={`http://localhost:3001${profile.avatar}`}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-secondary"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-secondary"
              style={{ background: 'rgba(101,16,127,1)' }}
            >
              {initials}
            </div>
          )}
          {avatarLoading && (
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
              <Spin size="small" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="font-semibold text-text-main text-base">
            {profile?.firstName} {profile?.lastName}
          </p>
          <p className="text-text-muted text-sm">Email: {profile?.email}</p>
          {profile?.phone && (
            <p className="text-text-muted text-sm">Phone: {profile.phone}</p>
          )}
          <p className="text-xs text-text-muted mt-1">{roleLabel}</p>
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="primary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Change Photo
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={handleRemoveAvatar}
            className="p-0 text-red-500"
          >
            Remove Photo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key:   'general',
              label: 'General',
              children: (
                <Form
                  form={generalForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleSaveGeneral}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-main">Personal Information</h3>
                    {!editing && (
                      <Button
                        size="small"
                        onClick={() => setEditing(true)}
                        className="rounded-lg border-border"
                        icon={
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label={<span className="text-sm font-medium text-text-main">Full Name</span>}
                      name="fullName"
                      rules={[{ required: true, message: 'Name is required' }]}
                    >
                      <Input size="large" className="rounded-xl" disabled={!editing} />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-sm font-medium text-text-main">Country</span>}
                      name="country"
                    >
                      <Select size="large" className="rounded-xl" disabled={!editing} placeholder="Select country">
                        {COUNTRIES.map((c) => (
                          <Select.Option key={c} value={c}>{c}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-sm font-medium text-text-main">Email</span>}
                      name="email"
                      rules={[{ type: 'email', message: 'Enter valid email' }]}
                    >
                      <Input size="large" className="rounded-xl" disabled={!editing} />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-sm font-medium text-text-main">Region</span>}
                      name="region"
                    >
                      <Select size="large" className="rounded-xl" disabled={!editing} placeholder="Select region">
                        {REGIONS.map((r) => (
                          <Select.Option key={r} value={r}>{r}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-sm font-medium text-text-main">Phone</span>}
                      name="phone"
                    >
                      <Input size="large" className="rounded-xl" disabled={!editing} />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-sm font-medium text-text-main">Address</span>}
                      name="address"
                    >
                      <Input size="large" className="rounded-xl" disabled={!editing} />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label={
                      <span className="text-sm font-medium text-text-main">
                        Company Description{' '}
                        <span className="text-text-muted font-normal">(In less than 25 words)</span>
                      </span>
                    }
                    name="description"
                  >
                    <Input.TextArea
                      rows={4}
                      className="rounded-xl"
                      disabled={!editing}
                      placeholder="Describe your company..."
                    />
                  </Form.Item>

                  {editing && (
                    <div className="flex gap-3 justify-end mt-2">
                      <Button
                        size="large"
                        onClick={() => { setEditing(false); }}
                        className="rounded-xl px-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={saving}
                        className="rounded-xl px-8"
                        style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </Form>
              ),
            },
            {
              key:   'password',
              label: 'Password',
              children: (
                <Form
                  form={passwordForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleSavePassword}
                >
                  <Form.Item
                    label={<span className="text-sm font-medium text-text-main">Current Password</span>}
                    name="currentPassword"
                    rules={[{ required: true, message: 'Current password is required' }]}
                  >
                    <Input.Password size="large" className="rounded-xl" placeholder="Enter current password" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-sm font-medium text-text-main">New Password</span>}
                    name="newPassword"
                    rules={[
                      { required: true, message: 'New password is required' },
                      { min: 8, message: 'Must be at least 8 characters' },
                    ]}
                  >
                    <Input.Password size="large" className="rounded-xl" placeholder="Enter new password" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-sm font-medium text-text-main">Confirm New Password</span>}
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Please confirm your password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password size="large" className="rounded-xl" placeholder="Repeat new password" />
                  </Form.Item>

                  <div className="flex gap-3 justify-end mt-2">
                    <Button
                      size="large"
                      onClick={() => passwordForm.resetFields()}
                      className="rounded-xl px-8"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={saving}
                      className="rounded-xl px-8"
                      style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
