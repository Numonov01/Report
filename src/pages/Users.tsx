import { useCallback, useEffect, useState } from "react";
import { Card, Table, Typography, message } from "antd";
import { getUsersApi } from "../api/users.api";

const { Title, Text } = Typography;

const statusColor = {
  Faol: { color: "#389e0d", background: "#f6ffed", border: "#b7eb8f" },
  Faolsiz: { color: "#cf1322", background: "#fff1f0", border: "#ffa39e" },
};

const getStatusStyle = (status: string) =>
  statusColor[status as keyof typeof statusColor] || {
    color: "#595959",
    background: "#fafafa",
    border: "#d9d9d9",
  };

const renderStatusPill = (status: string) => {
  const style = getStatusStyle(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px 10px",
        borderRadius: 999,
        border: "1px solid",
        fontSize: 12,
        lineHeight: "18px",
        fontWeight: 600,
        color: style.color,
        backgroundColor: style.background,
        borderColor: style.border,
      }}
    >
      {status}
    </span>
  );
};

const normalizeUser = (item: any) => ({
  id: item?.id ?? item?._id,
  fullName: item?.fullName || "",
  role: item?.role || "",
  email: item?.email || "",
  status: item?.status || "Faolsiz",
  phone: item?.phone || "",
});

function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsersApi();
      setUsers(data.map(normalizeUser));
    } catch {
      message.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      title: "Ism familiya",
      dataIndex: "fullName",
      key: "fullName",
      width: 220,
    },
    { title: "Lavozim", dataIndex: "role", key: "role", width: 160 },
    { title: "Email", dataIndex: "email", key: "email", width: 220 },
    {
      title: "Holati",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => renderStatusPill(status),
    },
    { title: "Nomeri", dataIndex: "phone", key: "phone", width: 170 },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          Foydalanuvchilar
        </Title>
        <Text type="secondary">
          Backend API orqali yuklangan foydalanuvchilar
        </Text>

        <Table
          style={{ marginTop: 16 }}
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 920 }}
        />
      </Card>
    </div>
  );
}

export default Users;
