import { useEffect, useState, useRef } from 'react';
import { Form, Input, Select, Button, message, Spin } from 'antd';
import { profileService } from '../../services/profile.service';
import { useAuthStore } from '../../store/auth.store';

const REGIONS   = ['Greater Accra','Ashanti','Western','Central','Eastern','Volta','Northern','Upper East','Upper West','Bono'];
const COUNTRIES = ['Ghana','Nigeria','Kenya','South Africa','United States','United Kingdom','Canada','Other'];
const ID_TYPES  = ['National ID','Passport','Voter ID','Driver License','Student ID'];

export default function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState(false);
  const [editingOthers, setEditingOthers] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'password'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generalForm]  = Form.useForm();
  const [othersForm]   = Form.useForm();
  const [passwordForm] = Form.useForm();

  const isCustomer = user?.role === 'customer';

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
        if (isCustomer) {
          othersForm.setFieldsValue({
            idType:       data.idType,
            idNumber:     data.idNumber,
            plans:        data.plans,
            dedicatedLine: data.dedicatedLine,
            postcode:     data.postcode,
            billingType:  data.billingType,
          });
        }
      })
      .catch(() => message.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveGeneral = async (values: any) => {
    try {
      setSaving(true);
      const nameParts = values.fullName.trim().split(' ');
      const updated = await profileService.updateProfile({
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

  const handleSaveOthers = async (values: any) => {
    try {
      setSaving(true);
      const updated = await profileService.updateProfile(values);
      setProfile(updated);
      setEditingOthers(false);
      message.success('Profile updated');
    } catch {
      message.error('Failed to update');
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
      setProfile((prev: any) => prev ? { ...prev, avatar } : prev);
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
      setProfile((prev: any) => prev ? { ...prev, avatar: null } : prev);
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
    ?.split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' ') + ' Profile';

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
            <img src={`http://localhost:3001${profile.avatar}`} alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-secondary" />
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
          <p className="font-semibold text-text-main">{profile?.firstName} {profile?.lastName}</p>
          <p className="text-text-muted text-sm">Email: {profile?.email}</p>
          {profile?.phone && <p className="text-text-muted text-sm">Phone: {profile.phone}</p>}
          <p className="text-xs text-text-muted mt-1">{roleLabel}</p>
        </div>
        <div className="flex flex-col gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <Button type="primary" size="small" onClick={() => fileInputRef.current?.click()}
            className="rounded-lg" style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
            Change Photo
          </Button>
          <Button type="link" size="small" danger onClick={handleRemoveAvatar} className="p-0 text-red-500">
            Remove Photo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex gap-2 mb-6">
          {(['general', 'password'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === t ? 'text-white' : 'text-text-muted bg-secondary'
              }`}
              style={activeTab === t ? { background: 'rgba(101,16,127,1)' } : {}}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <>
            {/* Personal Information */}
            <Form form={generalForm} layout="vertical" requiredMark={false} onFinish={handleSaveGeneral}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-main">Personal Information</h3>
                {!editing && (
                  <Button size="small" onClick={() => setEditing(true)} className="rounded-lg border-border"
                    icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>}>
                    Edit
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item label={<span className="text-sm font-medium text-text-main">Full Name</span>}
                  name="fullName" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input size="large" className="rounded-xl" disabled={!editing} />
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-text-main">Country</span>} name="country">
                  <Select size="large" className="rounded-xl" disabled={!editing} placeholder="Select country">
                    {COUNTRIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-text-main">Email</span>}
                  name="email" rules={[{ type: 'email', message: 'Enter valid email' }]}>
                  <Input size="large" className="rounded-xl" disabled={!editing} />
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-text-main">Region</span>} name="region">
                  <Select size="large" className="rounded-xl" disabled={!editing} placeholder="Select region">
                    {REGIONS.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-text-main">Phone</span>} name="phone">
                  <Input size="large" className="rounded-xl" disabled={!editing} />
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-text-main">Address</span>} name="address">
                  <Input size="large" className="rounded-xl" disabled={!editing} />
                </Form.Item>
              </div>

              {!isCustomer && (
                <Form.Item label={<span className="text-sm font-medium text-text-main">Company Description</span>} name="description">
                  <Input.TextArea rows={3} className="rounded-xl" disabled={!editing} />
                </Form.Item>
              )}

              {editing && (
                <div className="flex gap-3 justify-end mt-2">
                  <Button size="large" onClick={() => setEditing(false)} className="rounded-xl px-8">Cancel</Button>
                  <Button type="primary" htmlType="submit" size="large" loading={saving}
                    className="rounded-xl px-8"
                    style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
                    Save Changes
                  </Button>
                </div>
              )}
            </Form>

            {/* Others — customer only */}
            {isCustomer && (
              <Form form={othersForm} layout="vertical" requiredMark={false} onFinish={handleSaveOthers} className="mt-6 border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-main">Others</h3>
                  {!editingOthers && (
                    <Button size="small" onClick={() => setEditingOthers(true)} className="rounded-lg border-border"
                      icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>}>
                      Edit
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item label={<span className="text-sm font-medium text-text-main">ID Type</span>} name="idType">
                    <Select size="large" className="rounded-xl" disabled={!editingOthers} placeholder="Select ID type">
                      {ID_TYPES.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item label={<span className="text-sm font-medium text-text-main">Plans</span>} name="plans">
                    <Input size="large" className="rounded-xl" disabled={!editingOthers} placeholder="e.g. Internet" />
                  </Form.Item>
                  <Form.Item label={<span className="text-sm font-medium text-text-main">ID Number</span>} name="idNumber">
                    <Input size="large" className="rounded-xl" disabled={!editingOthers} placeholder="e.g. GHA-2332-333-4" />
                  </Form.Item>
                  <Form.Item label={<span className="text-sm font-medium text-text-main">Dedicated Line</span>} name="dedicatedLine">
                    <Input size="large" className="rounded-xl" disabled={!editingOthers} placeholder="e.g. Homework Network" />
                  </Form.Item>
                  <Form.Item label={<span className="text-sm font-medium text-text-main">Postcode</span>} name="postcode">
                    <Input size="large" className="rounded-xl" disabled={!editingOthers} placeholder="e.g. 7899" />
                  </Form.Item>
                  <Form.Item label={<span className="text-sm font-medium text-text-main">Billing Type</span>} name="billingType">
                    <Select size="large" className="rounded-xl" disabled={!editingOthers} placeholder="Select billing type">
                      <Select.Option value="monthly">Monthly</Select.Option>
                      <Select.Option value="quarterly">Quarterly</Select.Option>
                      <Select.Option value="annually">Annually</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                {editingOthers && (
                  <div className="flex gap-3 justify-end mt-2">
                    <Button size="large" onClick={() => setEditingOthers(false)} className="rounded-xl px-8">Cancel</Button>
                    <Button type="primary" htmlType="submit" size="large" loading={saving}
                      className="rounded-xl px-8"
                      style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            )}
          </>
        )}

        {activeTab === 'password' && (
          <Form form={passwordForm} layout="vertical" requiredMark={false} onFinish={handleSavePassword}>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Current Password</span>}
              name="currentPassword" rules={[{ required: true, message: 'Current password is required' }]}>
              <Input.Password size="large" className="rounded-xl" placeholder="Enter current password" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">New Password</span>}
              name="newPassword"
              rules={[{ required: true }, { min: 8, message: 'Must be at least 8 characters' }]}>
              <Input.Password size="large" className="rounded-xl" placeholder="Enter new password" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Confirm New Password</span>}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}>
              <Input.Password size="large" className="rounded-xl" placeholder="Repeat new password" />
            </Form.Item>
            <div className="flex gap-3 justify-end mt-2">
              <Button size="large" onClick={() => passwordForm.resetFields()} className="rounded-xl px-8">Cancel</Button>
              <Button type="primary" htmlType="submit" size="large" loading={saving}
                className="rounded-xl px-8"
                style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}
