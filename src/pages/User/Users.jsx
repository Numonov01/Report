import { useEffect, useState } from "react";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Grid,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import {
  createUserApi,
  deleteUserApi,
  getUsersApi,
  updateUserApi,
} from "../../api/users.api";
import { API_BASE_URL } from "../../api/axios";

const { Title, Text } = Typography;

const ROLE_OPTIONS = ["admin", "manager", "boss", "worker"];

const statusColor = {
  Faol: { color: "#389e0d", background: "#f6ffed", border: "#b7eb8f" },
  Faolsiz: { color: "#cf1322", background: "#fff1f0", border: "#ffa39e" },
};

const getStatusStyle = (status) =>
  statusColor[status] || {
    color: "#595959",
    background: "#fafafa",
    border: "#d9d9d9",
  };
const renderStatusPill = (status) => {
  const style = getStatusStyle(status);
  return (
    <span
      className="status-pill"
      style={{
        color: style.color,
        backgroundColor: style.background,
        borderColor: style.border,
      }}
    >
      {status}
    </span>
  );
};

const resolveAvatarUrl = (value) => {
  if (!value) {
    return undefined;
  }

  const raw = String(value).trim();

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  return `${API_BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

const normalizeUser = (item) => ({
  id: item?.id ?? item?._id,
  fullName: item?.fullName || "",
  role: item?.role || "",
  email: item?.email || "",
  status: item?.status === true ? "Faol" : "Faolsiz",
  phone: item?.phone || "",
  avatarUrl: resolveAvatarUrl(
    item?.avatarUrl || item?.avatar || item?.url || item?.profileImage,
  ),
});

const toApiStatus = (value) => value === "Faol";

function Users() {
  const screens = Grid.useBreakpoint();
  const isTabletOrMobile = !screens.lg;
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersApi();
      setUsers(data.map(normalizeUser));
    } catch {
      message.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: "Faol", role: "worker" });
    setOpen(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteUserApi(id);
    await loadUsers();
    message.success("Foydalanuvchi o‘chirildi");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const payload = {
        fullName: values.fullName,
        role: values.role,
        email: values.email,
        status: toApiStatus(values.status),
        phone: values.phone,
      };

      if (editingUser) {
        await updateUserApi(editingUser.id, payload);
        message.success("Foydalanuvchi yangilandi");
      } else {
        await createUserApi(payload);
        message.success("Yangi foydalanuvchi qo‘shildi");
      }

      await loadUsers();

      setOpen(false);
      setEditingUser(null);
      form.resetFields();
    } catch (error) {
      if (!error?.errorFields) {
        message.error("Saqlashda xatolik");
      }
    } finally {
      setSaving(false);
    }
  };

  const renderActionMenu = (record) => (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: [
          { key: "edit", label: "Tahrirlash" },
          { key: "delete", label: "O‘chirish", danger: true },
        ],
        onClick: ({ key }) => {
          if (key === "edit") {
            handleEdit(record);
            return;
          }
          Modal.confirm({
            title: "Foydalanuvchini o‘chirasizmi?",
            okText: "Ha",
            cancelText: "Yo‘q",
            okButtonProps: { danger: true },
            onOk: async () => {
              try {
                await handleDelete(record.id);
              } catch {
                message.error("O‘chirishda xatolik");
              }
            },
          });
        },
      }}
    >
      <Button
        type="text"
        icon={<MoreOutlined style={{ fontSize: 18 }} />}
        aria-label="Amallar"
      />
    </Dropdown>
  );

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      width: 60,
      render: (avatarUrl) => (
        <Avatar src={avatarUrl} icon={<UserOutlined />} size={38} />
      ),
    },
    {
      title: "Ism familiya",
      dataIndex: "fullName",
      key: "fullName",
      width: 220,
    },
    {
      title: "Lavozim",
      dataIndex: "role",
      key: "role",
      width: 160,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 230,
    },
    {
      title: "Holati",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => renderStatusPill(status),
    },
    {
      title: "Nomeri",
      dataIndex: "phone",
      key: "phone",
      width: 170,
    },
    {
      title: "Amallar",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, record) => renderActionMenu(record),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Foydalanuvchilar
            </Title>
            <Text type="secondary">
              Tizim foydalanuvchilarini CRUD orqali boshqarish
            </Text>
          </div>
          <Button type="primary" onClick={handleAdd}>
            + Foydalanuvchi qo‘shish
          </Button>
        </div>

        {isTabletOrMobile ? (
          loading ? (
            <div
              style={{
                marginTop: 16,
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              {users.map((item) => (
                <Card key={item.id} style={{ borderRadius: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Space size={10} align="start">
                      <Avatar
                        src={item.avatarUrl}
                        icon={<UserOutlined />}
                        size={44}
                      />
                      <Title level={5} style={{ margin: 0 }}>
                        {item.fullName}
                      </Title>
                    </Space>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {renderStatusPill(item.status)}
                      {renderActionMenu(item)}
                    </div>
                  </div>

                  <Space
                    direction="vertical"
                    size={5}
                    style={{ width: "100%" }}
                  >
                    <Text>
                      <strong>Lavozim:</strong> {item.role}
                    </Text>
                    <Text>
                      <strong>Email:</strong> {item.email}
                    </Text>
                    <Text>
                      <strong>Nomeri:</strong> {item.phone}
                    </Text>
                  </Space>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Table
            style={{ marginTop: 16 }}
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 6, showSizeChanger: false }}
            scroll={{ x: 1050 }}
          />
        )}

        <Modal
          open={open}
          onCancel={() => {
            setOpen(false);
            setEditingUser(null);
            form.resetFields();
          }}
          onOk={handleSave}
          confirmLoading={saving}
          okText={editingUser ? "Saqlash" : "Qo‘shish"}
          cancelText="Bekor qilish"
          title={
            editingUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"
          }
        >
          <Form form={form} layout="vertical">
            <Row gutter={12}>
              <Col xs={24}>
                <Form.Item
                  label="Ism familiya"
                  name="fullName"
                  rules={[
                    { required: true, message: "Ism familiyani kiriting" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Lavozim"
                  name="role"
                  rules={[{ required: true, message: "Lavozimni kiriting" }]}
                >
                  <Select
                    options={ROLE_OPTIONS.map((role) => ({
                      value: role,
                      label: role,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Holati"
                  name="status"
                  rules={[{ required: true, message: "Holatni tanlang" }]}
                >
                  <Select
                    options={[
                      { value: "Faol", label: "Faol" },
                      { value: "Faolsiz", label: "Faolsiz" },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Nomeri"
                  name="phone"
                  rules={[
                    { required: true, message: "Telefon nomerini kiriting" },
                  ]}
                >
                  <Input placeholder="+998 ..." />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Email kiriting" },
                    { type: "email", message: "Email formati noto‘g‘ri" },
                  ]}
                >
                  <Input placeholder="user@mail.com" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default Users;
