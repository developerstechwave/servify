import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Tabs, Dropdown,
  Modal, Form, Select, DatePicker, message,
} from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { subscriptionsService } from '../../services/subscriptions.service';
import dayjs from 'dayjs';

const REGIONS  = ['Greater Accra','Ashanti','Western','Central','Eastern','Volta','Northern','Upper East','Upper West'];
const COUNTRIES = ['Ghana','Nigeria','Kenya','South Africa','United Kingdom','Other'];

interface Product {
  id: string; name: string; description: string;
  region: string; country: string; vat: string;
  createdBy: string; createdAt: string; noOfServices: number;
}

interface Service {
  id: string; name: string; productId: string; productName: string;
  price: number; vat: string; region: string;
  status: string; expiryDate: string; createdAt: string;
}

const StatusDot = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
    status === 'available' ? 'text-green-600' : 'text-red-500'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${
      status === 'available' ? 'bg-green-500' : 'bg-red-500'
    }`} />
    {status === 'available' ? 'Available' : 'Unavailable'}
  </span>
);

export default function SubscriptionsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [services, setServices]   = useState<Service[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('products');

  // Modals
  const [productModal, setProductModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [editProduct, setEditProduct]   = useState<Product | null>(null);
  const [editService, setEditService]   = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'product' | 'service'; name: string } | null>(null);
  const [saving, setSaving]       = useState(false);

  const [productForm] = Form.useForm();
  const [serviceForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, ap] = await Promise.all([
        subscriptionsService.getProducts(search),
        subscriptionsService.getServices(search),
        subscriptionsService.getAllProducts(),
      ]);
      setProducts(p);
      setServices(s);
      setAllProducts(ap);
    } catch {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEditProduct = (p: Product) => {
    setEditProduct(p);
    productForm.setFieldsValue(p);
    setProductModal(true);
  };

  const openEditService = (s: Service) => {
    setEditService(s);
    serviceForm.setFieldsValue({
      ...s,
      expiryDate: s.expiryDate ? dayjs(s.expiryDate) : null,
    });
    setServiceModal(true);
  };

  const handleProductSubmit = async (values: any) => {
    try {
      setSaving(true);
      if (editProduct) {
        await subscriptionsService.updateProduct(editProduct.id, values);
        message.success('Product updated');
      } else {
        await subscriptionsService.createProduct(values);
        message.success('Product created');
      }
      setProductModal(false);
      setEditProduct(null);
      productForm.resetFields();
      fetchData();
    } catch {
      message.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleServiceSubmit = async (values: any) => {
    try {
      setSaving(true);
      const payload = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
      };
      if (editService) {
        await subscriptionsService.updateService(editService.id, payload);
        message.success('Service updated');
      } else {
        await subscriptionsService.createService(payload);
        message.success('Service created');
      }
      setServiceModal(false);
      setEditService(null);
      serviceForm.resetFields();
      fetchData();
    } catch {
      message.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      if (deleteTarget.type === 'product') {
        await subscriptionsService.deleteProduct(deleteTarget.id);
      } else {
        await subscriptionsService.deleteService(deleteTarget.id);
      }
      message.success('Deleted successfully');
      setDeleteTarget(null);
      fetchData();
    } catch {
      message.error('Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const getProductMenu = (record: Product): MenuProps => ({
    items: [
      { key: 'edit',   label: 'Edit',   onClick: () => openEditProduct(record) },
      { key: 'delete', label: 'Delete', danger: true,
        onClick: () => setDeleteTarget({ id: record.id, type: 'product', name: record.name }) },
    ],
  });

  const getServiceMenu = (record: Service): MenuProps => ({
    items: [
      { key: 'edit',   label: 'Edit',   onClick: () => openEditService(record) },
      { key: 'delete', label: 'Delete', danger: true,
        onClick: () => setDeleteTarget({ id: record.id, type: 'service', name: record.name }) },
    ],
  });

  const productColumns = [
    {
      title: 'Product', dataIndex: 'name', key: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
      render: (text: string) => <span className="font-medium text-text-main">{text}</span>,
    },
    { title: 'No. of Services', dataIndex: 'noOfServices', key: 'noOfServices' },
    {
      title: 'Description', dataIndex: 'description', key: 'description',
      render: (text: string) => (
        <span className="text-text-muted">
          {text ? (text.length > 15 ? text.slice(0, 15) + '...' : text) : 'No description'}
        </span>
      ),
    },
    {
      title: 'Created By', dataIndex: 'createdBy', key: 'createdBy',
      render: (text: string) => <span className="text-text-muted">{text}</span>,
    },
    {
      title: 'Date Created', dataIndex: 'createdAt', key: 'createdAt',
      render: (date: string) => (
        <span className="text-text-muted">
          {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    { title: 'Country', dataIndex: 'country', key: 'country',
      render: (text: string) => <span className="text-text-muted">{text || '—'}</span> },
    { title: 'Region',  dataIndex: 'region',  key: 'region',
      render: (text: string) => <span className="text-text-muted">{text || '—'}</span> },
    {
      title: '', key: 'actions', width: 40,
      render: (_: any, record: Product) => (
        <Dropdown menu={getProductMenu(record)} trigger={['click']} placement="bottomRight">
          <button className="text-text-muted hover:text-text-main p-1">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </Dropdown>
      ),
    },
  ];

  const serviceColumns = [
    {
      title: 'Service', dataIndex: 'name', key: 'name',
      sorter: (a: Service, b: Service) => a.name.localeCompare(b.name),
      render: (text: string) => <span className="font-medium text-text-main">{text}</span>,
    },
    { title: 'Product', dataIndex: 'productName', key: 'productName',
      render: (text: string) => <span className="text-text-muted">{text}</span> },
    {
      title: 'Price', dataIndex: 'price', key: 'price',
      sorter: (a: Service, b: Service) => a.price - b.price,
      render: (v: number) => <span className="font-medium">GHC{Number(v).toFixed(2)}</span>,
    },
    { title: 'VAT', dataIndex: 'vat', key: 'vat',
      render: (text: string) => <span className="text-text-muted">{text ? `${text}%` : '—'}</span> },
    {
      title: 'Date Created', dataIndex: 'createdAt', key: 'createdAt',
      render: (date: string) => (
        <span className="text-text-muted">
          {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    { title: 'Region', dataIndex: 'region', key: 'region',
      render: (text: string) => <span className="text-text-muted">{text || '—'}</span> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <StatusDot status={status} />,
    },
    {
      title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (date: string) => date ? (
        <span className="text-red-500 font-medium text-sm">
          {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ) : <span className="text-text-muted">—</span>,
    },
    {
      title: '', key: 'actions', width: 40,
      render: (_: any, record: Service) => (
        <Dropdown menu={getServiceMenu(record)} trigger={['click']} placement="bottomRight">
          <button className="text-text-muted hover:text-text-main p-1">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={<SearchOutlined className="text-text-muted" />}
          placeholder={activeTab === 'products' ? 'Search product, country...' : 'Search service, product...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => {
            if (activeTab === 'products') {
              setEditProduct(null);
              productForm.resetFields();
              setProductModal(true);
            } else {
              setEditService(null);
              serviceForm.resetFields();
              setServiceModal(true);
            }
          }}
          className="rounded-xl font-semibold"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
        >
          {activeTab === 'products' ? 'Add New Category' : 'Add New Product'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 pt-4">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'products', label: 'Categories' },
              { key: 'services', label: 'Products' },
            ]}
          />
        </div>

        {activeTab === 'products' && (
          <>
            <h2 className="px-6 pb-3 text-lg font-bold text-text-main">Products</h2>
            <Table
              columns={productColumns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
              scroll={{ x: 'max-content' }}
              style={{ border: 'none' }}
            />
          </>
        )}

        {activeTab === 'services' && (
          <>
            <h2 className="px-6 pb-3 text-lg font-bold text-text-main">Services</h2>
            <Table
              columns={serviceColumns}
              dataSource={services}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
              scroll={{ x: 'max-content' }}
              style={{ border: 'none' }}
            />
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        open={productModal}
        onCancel={() => { setProductModal(false); setEditProduct(null); productForm.resetFields(); }}
        footer={null}
        centered
        width={560}
        title={<span className="font-bold text-text-main">{editProduct ? 'Edit Product' : 'Add New Category'}</span>}
      >
        <Form form={productForm} layout="vertical" requiredMark={false} onFinish={handleProductSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Product</span>}
              name="name"
              rules={[{ required: true, message: 'Product name is required' }]}
            >
              <Input size="large" placeholder="Enter product" className="rounded-xl" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">VAT</span>} name="vat">
              <Input size="large" placeholder="Optional" className="rounded-xl" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Region</span>} name="region">
              <Select size="large" placeholder="Select region" className="rounded-xl">
                {REGIONS.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Country</span>} name="country">
              <Select size="large" placeholder="Select country" className="rounded-xl">
                {COUNTRIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>
          <Form.Item label={<span className="text-sm font-medium text-text-main">Description</span>} name="description">
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Enter description" />
          </Form.Item>
          <div className="flex gap-3 mt-2">
            <Button size="large" onClick={() => { setProductModal(false); productForm.resetFields(); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              {editProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add/Edit Service Modal */}
      <Modal
        open={serviceModal}
        onCancel={() => { setServiceModal(false); setEditService(null); serviceForm.resetFields(); }}
        footer={null}
        centered
        width={560}
        title={<span className="font-bold text-text-main">{editService ? 'Edit Service' : 'Add New Product'}</span>}
      >
        <Form form={serviceForm} layout="vertical" requiredMark={false} onFinish={handleServiceSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Service</span>}
              name="name"
              rules={[{ required: true, message: 'Service name is required' }]}
            >
              <Input size="large" placeholder="Enter service name" className="rounded-xl" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Price</span>}
              name="price"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <Input size="large" placeholder="Enter price" type="number" className="rounded-xl" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Type of Product</span>}
              name="productId"
              rules={[{ required: true, message: 'Product is required' }]}
            >
              <Select size="large" placeholder="Select product name" className="rounded-xl">
                {allProducts.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">VAT</span>} name="vat">
              <Input size="large" placeholder="Optional" className="rounded-xl" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Date Created</span>} name="createdAt">
              <Input size="large" disabled className="rounded-xl"
                value={new Date().toLocaleDateString('en-GB')} placeholder={new Date().toLocaleDateString('en-GB')} />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Expiry Date</span>} name="expiryDate">
              <DatePicker size="large" className="w-full rounded-xl" format="MM/DD/YY" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Status</span>} name="status">
              <Select size="large" placeholder="Select status" className="rounded-xl">
                <Select.Option value="available">Available</Select.Option>
                <Select.Option value="unavailable">Unavailable</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Region</span>} name="region">
              <Select size="large" placeholder="Select region" className="rounded-xl">
                {REGIONS.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>
          <div className="flex gap-3 mt-2">
            <Button size="large" onClick={() => { setServiceModal(false); serviceForm.resetFields(); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              {editService ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        centered
        width={400}
        title={<span className="font-bold text-text-main">Delete {deleteTarget?.type === 'product' ? 'Product' : 'Service'}</span>}
      >
        <div className="py-4 px-2">
          <div className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.03)' }}>
            <p className="text-text-main font-medium">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setDeleteTarget(null)} className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button danger type="primary" size="large" loading={saving} onClick={handleDelete}
              className="flex-1 h-11 rounded-xl font-semibold">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
