import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import {
  createReportApi,
  deleteReportApi,
  getReportsApi,
  updateReportApi,
} from "../api/reports.api";

const { Title, Text } = Typography;

const STATUS_OPTIONS = ["Faol", "Jarayonda", "Faolsiz", "Yangi", "Yakunlangan"];
const PAYMENT_TYPES = ["Naxt", "Perechislenie", "Karta"];

const statusColor = {
  Yangi: { color: "#0958d9", background: "#e6f4ff", border: "#91caff" },
  Jarayonda: { color: "#d46b08", background: "#fff7e6", border: "#ffd591" },
  Yakunlangan: { color: "#389e0d", background: "#f6ffed", border: "#b7eb8f" },
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

const toNumber = (value: any) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeReport = (item: any) => ({
  id: item?.id ?? item?._id,
  objectName: item?.objectName || "",
  clientName: item?.clientName || "",
  reportNumber: item?.reportNumber || "",
  position: item?.position || "",
  status: item?.status || "Faol",
  phone: item?.phone || "",
  note: item?.note || "",
  agreedPayment: toNumber(item?.agreedPayment),
  paidAmount: toNumber(item?.paidAmount),
  debt: toNumber(item?.debt),
  dueDate: item?.dueDate || "",
  paymentType: item?.paymentType || "Naxt",
});

function Reports() {
  const [form] = Form.useForm();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);

  const agreedPayment = Form.useWatch("agreedPayment", form);
  const paidAmount = Form.useWatch("paidAmount", form);

  useEffect(() => {
    const debtValue = Math.max(
      toNumber(agreedPayment) - toNumber(paidAmount),
      0,
    );
    form.setFieldValue("debt", debtValue);
  }, [agreedPayment, paidAmount, form]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReportsApi();
      setReports(data.map(normalizeReport));
    } catch {
      message.error("Hisobotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const closeModal = () => {
    setOpen(false);
    setEditingReport(null);
    form.resetFields();
  };

  const handleCreate = () => {
    setEditingReport(null);
    form.setFieldsValue({
      status: "Faol",
      paymentType: "Naxt",
      agreedPayment: 0,
      paidAmount: 0,
      debt: 0,
    });
    setOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingReport(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: "Hisobotni o‘chirasizmi?",
      okText: "Ha",
      cancelText: "Yo‘q",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteReportApi(record.id);
          message.success("Hisobot o‘chirildi");
          await fetchReports();
        } catch {
          message.error("O‘chirishda xatolik");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      const agreed = toNumber(values.agreedPayment);
      const paid = toNumber(values.paidAmount);
      const debt = Math.max(agreed - paid, 0);

      const payload = {
        objectName: values.objectName,
        clientName: values.clientName,
        reportNumber: values.reportNumber,
        position: values.position,
        status: values.status,
        phone: values.phone || "",
        note: values.note || "",
        agreedPayment: agreed,
        paidAmount: paid,
        debt,
        dueDate: values.dueDate || "",
        paymentType: values.paymentType,
      };

      if (editingReport) {
        await updateReportApi(editingReport.id, payload);
        message.success("Hisobot yangilandi");
      } else {
        await createReportApi(payload);
        message.success("Yangi hisobot qo‘shildi");
      }

      closeModal();
      await fetchReports();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(
    () =>
      reports.reduce(
        (acc, item) => {
          acc.agreed += toNumber(item.agreedPayment);
          acc.paid += toNumber(item.paidAmount);
          acc.debt += toNumber(item.debt);
          return acc;
        },
        { agreed: 0, paid: 0, debt: 0 },
      ),
    [reports],
  );

  const renderActionMenu = (record: any) => (
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
          handleDelete(record);
        },
      }}
    >
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
    </Dropdown>
  );

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Obyekt", dataIndex: "objectName", key: "objectName", width: 180 },
    { title: "Mijoz", dataIndex: "clientName", key: "clientName", width: 220 },
    {
      title: "Hisobot raqami",
      dataIndex: "reportNumber",
      key: "reportNumber",
      width: 140,
    },
    { title: "Lavozim", dataIndex: "position", key: "position", width: 140 },
    {
      title: "Holat",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => renderStatusPill(status),
    },
    { title: "Tel", dataIndex: "phone", key: "phone", width: 150 },
    { title: "Izoh", dataIndex: "note", key: "note", width: 180 },
    {
      title: "Kelishilgan",
      dataIndex: "agreedPayment",
      key: "agreedPayment",
      width: 130,
    },
    {
      title: "To‘langan",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 130,
    },
    { title: "Qarz", dataIndex: "debt", key: "debt", width: 120 },
    {
      title: "To‘lov sanasi",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 140,
    },
    {
      title: "To‘lov turi",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 130,
    },
    {
      title: "Amallar",
      key: "actions",
      width: 90,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: any) => renderActionMenu(record),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Hisobotlar
            </Title>
            <Text type="secondary">Backend API bilan to‘liq CRUD</Text>
          </div>
          <Button type="primary" onClick={handleCreate}>
            + Yangi hisobot qo‘shish
          </Button>
        </div>

        <Space
          size={16}
          style={{ marginTop: 16, marginBottom: 8, flexWrap: "wrap" }}
        >
          <Text>Kelishilgan: {stats.agreed}</Text>
          <Text>To‘langan: {stats.paid}</Text>
          <Text>Qarzdorlik: {stats.debt}</Text>
        </Space>

        <Table
          style={{ marginTop: 12 }}
          rowKey="id"
          columns={columns}
          dataSource={reports}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 2100 }}
        />
      </Card>

      <Modal
        open={open}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={saving}
        width={900}
        okText={editingReport ? "Saqlash" : "Qo‘shish"}
        cancelText="Bekor qilish"
        title={editingReport ? "Hisobotni tahrirlash" : "Yangi hisobot"}
      >
        <Form form={form} layout="vertical">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            <Form.Item
              name="objectName"
              label="Obyekt nomi"
              rules={[{ required: true, message: "Obyekt nomi majburiy" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="clientName"
              label="Mijoz (F.I.SH)"
              rules={[{ required: true, message: "Mijoz majburiy" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="reportNumber"
              label="Hisobot raqami"
              rules={[{ required: true, message: "Hisobot raqami majburiy" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="position"
              label="Lavozimi"
              rules={[{ required: true, message: "Lavozim majburiy" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="status" label="Holat">
              <Select
                options={STATUS_OPTIONS.map((status) => ({
                  value: status,
                  label: status,
                }))}
              />
            </Form.Item>

            <Form.Item name="phone" label="Telefon">
              <Input />
            </Form.Item>

            <Form.Item
              name="paymentType"
              label="To‘lov turi"
              rules={[{ required: true, message: "To‘lov turi majburiy" }]}
            >
              <Select
                options={PAYMENT_TYPES.map((type) => ({
                  value: type,
                  label: type,
                }))}
              />
            </Form.Item>

            <Form.Item name="dueDate" label="To‘lov sanasi">
              <Input placeholder="DD.MM.YYYY" />
            </Form.Item>

            <Form.Item
              name="agreedPayment"
              label="Kelishilgan to‘lov"
              rules={[
                { required: true, message: "Kelishilgan to‘lov majburiy" },
                { type: "number", min: 0, message: "Son kiriting" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="paidAmount"
              label="To‘langan summa"
              rules={[
                { required: true, message: "To‘langan summa majburiy" },
                { type: "number", min: 0, message: "Son kiriting" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="debt"
              label="Qarzdorlik"
              rules={[{ type: "number", min: 0, message: "Son kiriting" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} disabled />
            </Form.Item>

            <Form.Item name="note" label="Izoh">
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Reports;
