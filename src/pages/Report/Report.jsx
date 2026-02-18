import { useMemo, useState } from "react";
import { DownOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons";
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
import "./Report.css";

const { Title, Text } = Typography;

const STATUS_OPTIONS = ["Faol", "Jarayonda", "Faolsiz", "Yangi", "Yakunlangan"];
const PAYMENT_TYPES = ["Naxt", "Perechislenie", "Karta"];
const CURRENCY_OPTIONS = ["UZS", "USD"];

const INITIAL_DATA = [
  {
    id: 1,
    objectName: "Orion Market",
    clientName: "Aliyev Aziz Anvarovich",
    reportNumber: "1",
    position: "Direktor",
    address: "Toshkent shahar, Yunusobod tumani, Novza ko‘chasi 8 uy",
    service: "Kamera o‘rnatish, Domofon o‘rnatish",
    status: "Faol",
    phone: "995486588",
    note: "Kafolat 1 yil",
    projectProducts:
      "8 dona IP kuzatuv kamera (2MP / 4MP), 1 dona NVR videoregistrator (8 kanal), 1 dona HDD 2TB",
    agreedPayment: "500$, 150$",
    paidAmount: "220$,55$",
    debt: "280$,95$",
    dueDate: "15.03.2026",
    paymentType: "Naxt",
  },
  {
    id: 2,
    objectName: "Green House",
    clientName: "Karimova Dilnoza",
    reportNumber: "2",
    position: "Menejer",
    address: "Toshkent shahar, Yashnobod tumani, Go‘zal ko‘chasi 125 uy",
    service: "Domofon o‘rnatish",
    status: "Jarayonda",
    phone: "952147899",
    note: "Kafolat 6 yil",
    projectProducts:
      "Video domofon monitor (7 dyuym), Tashqi chaqiruv paneli (kamera bilan), Elektr qulf (magnitli)",
    agreedPayment: "5000000 so‘m",
    paidAmount: "2500000 so‘m",
    debt: "2500000 so‘m",
    dueDate: "25.05.2026",
    paymentType: "Perechislenie",
  },
  {
    id: 3,
    objectName: "Tech Office",
    clientName: "Rasulov Bekzod Ilhom o‘g‘li",
    reportNumber: "3",
    position: "IT mutaxassisi",
    address: "Toshkent shahar, Sergeli tumani, Chorag‘on ko‘chasi 77 uy",
    service: "Turniket o‘rnatish, face-id o‘rnatish, wi-fi o‘rnatish",
    status: "Faolsiz",
    phone: "902548877",
    note: "Xizmat yakunlanmagan",
    projectProducts:
      "Turniket qurilmasi (1 dona), Face-ID biometrik terminal, Kirish-chiqish nazorat moduli, Wi-Fi router (Dual Band)",
    agreedPayment: "8000000 so‘m",
    paidAmount: "6600000 so‘m",
    debt: "1400000 so‘m",
    dueDate: "18.04.2026",
    paymentType: "Perechislenie",
  },
];

const statusColor = {
  Yangi: { color: "#0958d9", background: "#e6f4ff", border: "#91caff" },
  Jarayonda: { color: "#d46b08", background: "#fff7e6", border: "#ffd591" },
  Yakunlangan: { color: "#389e0d", background: "#f6ffed", border: "#b7eb8f" },
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

const parseAmount = (value) => {
  if (!value) {
    return 0;
  }

  const normalized = String(value).replace(/,/g, ".");
  const matches = normalized.match(/\d+(?:\.\d+)?/g);

  if (!matches) {
    return 0;
  }

  return matches.reduce((sum, part) => sum + Number(part), 0);
};

const formatAmount = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 2,
  }).format(value || 0);

const splitAmountAndCurrency = (value) => {
  const raw = String(value || "").trim();
  const match = raw.match(/\s(USD|UZS)$/i);

  if (match) {
    return {
      amount: raw.replace(/\s(USD|UZS)$/i, "").trim(),
      currency: match[1].toUpperCase(),
    };
  }

  return {
    amount: raw,
    currency: "UZS",
  };
};

function Report() {
  const screens = Grid.useBreakpoint();
  const isTabletOrMobile = !screens.lg;
  const [form] = Form.useForm();
  const [records, setRecords] = useState(INITIAL_DATA);
  const [expandedMobileIds, setExpandedMobileIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const toggleMobileDetails = (id) => {
    setExpandedMobileIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const stats = useMemo(() => {
    return records.reduce(
      (acc, item) => {
        acc.agreed += parseAmount(item.agreedPayment);
        acc.paid += parseAmount(item.paidAmount);
        acc.debt += parseAmount(item.debt);
        return acc;
      },
      { agreed: 0, paid: 0, debt: 0 },
    );
  }, [records]);

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: "Faol",
      paymentType: "Naxt",
      agreedPaymentCurrency: "UZS",
      paidAmountCurrency: "UZS",
      debtCurrency: "UZS",
    });
    setOpen(true);
  };

  const handleEdit = (record) => {
    const agreed = splitAmountAndCurrency(record.agreedPayment);
    const paid = splitAmountAndCurrency(record.paidAmount);
    const debt = splitAmountAndCurrency(record.debt);

    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      agreedPaymentValue: agreed.amount,
      agreedPaymentCurrency: agreed.currency,
      paidAmountValue: paid.amount,
      paidAmountCurrency: paid.currency,
      debtValue: debt.amount,
      debtCurrency: debt.currency,
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
    message.success("Yozuv o‘chirildi");
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: "Yozuvni o‘chirasizmi?",
      okText: "Ha",
      cancelText: "Yo‘q",
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record.id),
    });
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
          confirmDelete(record);
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

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      const payload = {
        ...values,
        agreedPayment: values.agreedPaymentValue
          ? `${values.agreedPaymentValue} ${values.agreedPaymentCurrency}`
          : "",
        paidAmount: values.paidAmountValue
          ? `${values.paidAmountValue} ${values.paidAmountCurrency}`
          : "",
        debt: values.debtValue
          ? `${values.debtValue} ${values.debtCurrency}`
          : "",
      };

      delete payload.agreedPaymentValue;
      delete payload.agreedPaymentCurrency;
      delete payload.paidAmountValue;
      delete payload.paidAmountCurrency;
      delete payload.debtValue;
      delete payload.debtCurrency;

      if (editingRecord) {
        setRecords((prev) =>
          prev.map((item) =>
            item.id === editingRecord.id ? { ...item, ...payload } : item,
          ),
        );
        message.success("Yozuv yangilandi");
      } else {
        const nextId = records.length
          ? Math.max(...records.map((item) => item.id)) + 1
          : 1;
        setRecords((prev) => [...prev, { id: nextId, ...payload }]);
        message.success("Yangi yozuv qo‘shildi");
      }

      setOpen(false);
      setEditingRecord(null);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 80, fixed: "left" },
    { title: "Obyekt nomi", dataIndex: "objectName", width: 210 },
    { title: "Mijoz (F.I.SH)", dataIndex: "clientName", width: 220 },
    { title: "Hisobot raqami", dataIndex: "reportNumber", width: 140 },
    { title: "Lavozimi", dataIndex: "position", width: 150 },
    {
      title: "Holat",
      dataIndex: "status",
      width: 140,
      render: (status) => renderStatusPill(status),
    },
    { title: "Tel", dataIndex: "phone", width: 140 },
    { title: "Izoh", dataIndex: "note", width: 220 },
    {
      title: "Kelishilgan to‘lov",
      dataIndex: "agreedPayment",
      width: 180,
    },
    { title: "To‘lov qilgan summa", dataIndex: "paidAmount", width: 180 },
    {
      title: "Qolgan to‘lov summasi (qarzdor)",
      dataIndex: "debt",
      width: 230,
    },
    {
      title: "To‘lov qilinishi kerak bo‘lgan sana",
      dataIndex: "dueDate",
      width: 190,
    },
    { title: "To‘lov turi", dataIndex: "paymentType", width: 150 },
    {
      title: "Amallar",
      key: "actions",
      width: 90,
      fixed: "right",
      align: "center",
      render: (_, record) => renderActionMenu(record),
    },
  ];

  const expandedRowRender = (record) => (
    <div style={{ padding: "2px 4px" }}>
      <p style={{ marginBottom: 8 }}>
        <strong>Manzil:</strong> {record.address}
      </p>
      <p style={{ marginBottom: 8 }}>
        <strong>Xizmat:</strong> {record.service}
      </p>
      <p style={{ marginBottom: 0 }}>
        <strong>Loyiha bo‘yicha mahsulotlar nomi:</strong>{" "}
        {record.projectProducts}
      </p>
    </div>
  );

  return (
    <div className="report-page">
      <div className="report-hero">
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Hisobot boshqaruvi
          </Title>
          <Text type="secondary">Faqat berilgan ma’lumotlar asosida</Text>
        </div>
        <Button type="primary" size="large" onClick={handleCreate}>
          + Yangi hisobot qo‘shish
        </Button>
      </div>

      <Row gutter={[12, 12]} className="report-stats-row">
        <Col xs={24} sm={8}>
          <Card className="report-stat-card" bordered={false}>
            <Text type="secondary">Kelishilgan to‘lov</Text>
            <Title level={4}>{formatAmount(stats.agreed)}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="report-stat-card" bordered={false}>
            <Text type="secondary">To‘langan summa</Text>
            <Title level={4}>{formatAmount(stats.paid)}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="report-stat-card" bordered={false}>
            <Text type="secondary">Qarzdorlik</Text>
            <Title
              level={4}
              style={{ color: stats.debt ? "#cf1322" : "#389e0d" }}
            >
              {formatAmount(stats.debt)}
            </Title>
          </Card>
        </Col>
      </Row>

      {isTabletOrMobile ? (
        <div className="mobile-report-list">
          {records.map((item) => (
            <Card key={item.id} className="mobile-report-card">
              {(() => {
                const isExpanded = expandedMobileIds.includes(item.id);

                return (
                  <>
                    <div className="mobile-report-head">
                      <Title level={5} style={{ margin: 0 }}>
                        {item.objectName}
                      </Title>
                      <div className="mobile-report-head-right">
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
                        <strong>Mijoz:</strong> {item.clientName}
                      </Text>
                      <Text>
                        <strong>Hisobot raqami:</strong> {item.reportNumber}
                      </Text>
                      <Text>
                        <strong>Lavozimi:</strong> {item.position}
                      </Text>
                      <Text>
                        <strong>Tel:</strong> {item.phone}
                      </Text>
                      <Text>
                        <strong>Kelishilgan to‘lov:</strong>{" "}
                        {item.agreedPayment}
                      </Text>
                      <Text>
                        <strong>To‘langan summa:</strong> {item.paidAmount}
                      </Text>
                      <Text>
                        <strong>Qarzdorlik:</strong> {item.debt}
                      </Text>
                      <Text>
                        <strong>To‘lov sanasi:</strong> {item.dueDate}
                      </Text>
                    </Space>

                    <Button
                      type="text"
                      size="small"
                      className="mobile-details-toggle"
                      icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                      onClick={() => toggleMobileDetails(item.id)}
                    >
                      {isExpanded ? "Yig‘ish" : "To‘liq ko‘rish"}
                    </Button>

                    {isExpanded ? (
                      <Space
                        direction="vertical"
                        size={5}
                        style={{ width: "100%" }}
                        className="mobile-full-details"
                      >
                        <Text>
                          <strong>ID:</strong> {item.id}
                        </Text>
                        <Text>
                          <strong>Manzil:</strong> {item.address}
                        </Text>
                        <Text>
                          <strong>Xizmat:</strong> {item.service}
                        </Text>
                        <Text>
                          <strong>Izoh:</strong> {item.note}
                        </Text>
                        <Text>
                          <strong>Loyiha bo‘yicha mahsulotlar nomi:</strong>{" "}
                          {item.projectProducts}
                        </Text>
                        <Text>
                          <strong>To‘lov turi:</strong> {item.paymentType}
                        </Text>
                      </Space>
                    ) : null}
                  </>
                );
              })()}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="report-card-shell" bodyStyle={{ padding: 0 }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={records}
            pagination={false}
            expandable={{
              expandedRowRender,
              expandIconColumnIndex: 0,
              expandIcon: ({ expanded, onExpand, record }) => (
                <Button
                  type="text"
                  size="small"
                  icon={expanded ? <DownOutlined /> : <RightOutlined />}
                  onClick={(event) => onExpand(record, event)}
                  aria-label="Batafsil"
                />
              ),
            }}
            scroll={{ x: 2400 }}
          />
        </Card>
      )}

      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={saving}
        width={920}
        okText={editingRecord ? "Saqlash" : "Qo‘shish"}
        cancelText="Bekor qilish"
        title={
          editingRecord ? "Hisobotni tahrirlash" : "Yangi hisobot qo‘shish"
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                name="objectName"
                label="Obyekt nomi"
                rules={[{ required: true, message: "Obyekt nomini kiriting" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="clientName"
                label="Mijoz (F.I.SH)"
                rules={[{ required: true, message: "Mijozni kiriting" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="reportNumber"
                label="Hisobot raqami"
                rules={[
                  { required: true, message: "Hisobot raqamini kiriting" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="position" label="Lavozimi">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Manzil">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="service" label="Xizmat">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Holat">
                <Select
                  options={STATUS_OPTIONS.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Tel">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="paymentType" label="To‘lov turi">
                <Select
                  options={PAYMENT_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="projectProducts"
                label="Loyiha bo‘yicha mahsulotlar nomi"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="note" label="Izoh">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="agreedPaymentValue" label="Kelishilgan to‘lov">
                <Input
                  addonAfter={
                    <Form.Item name="agreedPaymentCurrency" noStyle>
                      <Select
                        style={{ width: 90 }}
                        options={CURRENCY_OPTIONS.map((item) => ({
                          value: item,
                          label: item,
                        }))}
                      />
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="paidAmountValue" label="To‘lov qilgan summa">
                <Input
                  addonAfter={
                    <Form.Item name="paidAmountCurrency" noStyle>
                      <Select
                        style={{ width: 90 }}
                        options={CURRENCY_OPTIONS.map((item) => ({
                          value: item,
                          label: item,
                        }))}
                      />
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="debtValue"
                label="Qolgan to‘lov summasi (qarzdor)"
              >
                <Input
                  addonAfter={
                    <Form.Item name="debtCurrency" noStyle>
                      <Select
                        style={{ width: 90 }}
                        options={CURRENCY_OPTIONS.map((item) => ({
                          value: item,
                          label: item,
                        }))}
                      />
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="dueDate"
                label="To‘lov qilinishi kerak bo‘lgan sana"
              >
                <Input placeholder="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default Report;
