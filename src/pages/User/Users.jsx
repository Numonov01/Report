import { useState } from "react";
import { MoreOutlined } from "@ant-design/icons";
import {
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
  Space,
  Table,
  Typography,
  message,
} from "antd";

const { Title, Text } = Typography;

const INITIAL_USERS = [
  {
    id: 1,
    fullName: "Nu'monov Tohir",
    role: "Administrator",
    email: "numonovtokhir@gmail.com",
    status: "Faol",
    phone: "+998 90 123 45 67",
  },
  {
    id: 2,
    fullName: "Solijonov Muxammadjon",
    role: "Operator",
    email: "muhsdev@gmail.com",
    status: "Faol",
    phone: "+998 91 555 66 77",
  },
  {
    id: 3,
    fullName: "Bosimbekov Hojiakbar",
    role: "Analitik",
    email: "xbosimbekov@gmail.com",
    status: "Faol emas",
    phone: "+998 99 700 80 90",
  },
  {
    id: 4,
    fullName: "Nuriddin Muhammadjanov",
    role: "Operator",
    email: "nmuhammadjanov@gmail.com",
    status: "Faol",
    phone: "+998 93 777 88 99",
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "Faol":
      return { color: "#52c41a", background: "#f6ffed", border: "#b7eb8f" };
    case "Faol emas":
      return { color: "#d9d9d9", background: "#f5f5f5", border: "#d9d9d9" };
    default:
      return { color: "#d9d9d9", background: "#f5f5f5", border: "#d9d9d9" };
  }
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

function Users() {
  const screens = Grid.useBreakpoint();
  const isTabletOrMobile = !screens.lg;
  const [form] = Form.useForm();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: "Faol", role: "Operator" });
    setOpen(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((item) => item.id !== id));
    message.success("Foydalanuvchi o‘chirildi");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      if (editingUser) {
        setUsers((prev) =>
          prev.map((item) =>
            item.id === editingUser.id ? { ...item, ...values } : item,
          ),
        );
        message.success("Foydalanuvchi yangilandi");
      } else {
        const nextId = users.length
          ? Math.max(...users.map((item) => item.id)) + 1
          : 1;
        setUsers((prev) => [...prev, { id: nextId, ...values }]);
        message.success("Yangi foydalanuvchi qo‘shildi");
      }

      setOpen(false);
      setEditingUser(null);
      form.resetFields();
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
            onOk: () => handleDelete(record.id),
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
                  <Title level={5} style={{ margin: 0 }}>
                    {item.fullName}
                  </Title>
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

                <Space direction="vertical" size={5} style={{ width: "100%" }}>
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
        ) : (
          <Table
            style={{ marginTop: 16 }}
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 6, showSizeChanger: false }}
            scroll={{ x: 960 }}
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
                    options={[
                      { value: "Administrator", label: "Administrator" },
                      { value: "Operator", label: "Operator" },
                      { value: "Analitik", label: "Analitik" },
                    ]}
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
                      { value: "Faol emas", label: "Faol emas" },
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
