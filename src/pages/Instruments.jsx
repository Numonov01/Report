import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Grid,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Spin,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  createInstrumentApi,
  deleteInstrumentApi,
  getInstrumentsApi,
  updateInstrumentApi,
} from "../api/instruments.api";
import { API_BASE_URL } from "../api/axios";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: "new", label: "Yangi" },
  { value: "old", label: "Eski" },
  { value: "repair", label: "Ta’mir talab" },
  { value: "broken", label: "Ishdan chiqqan" },
];

const STATUS_KEYS = ["new", "old", "repair", "broken"];

const STATUS_LABELS = STATUS_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const getStatusLabel = (status) => {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();
  return STATUS_LABELS[normalized] || status || "-";
};

const createEmptyStatusCounts = () => ({
  new: 0,
  old: 0,
  repair: 0,
  broken: 0,
});

const normalizeStatusCounts = (value, fallbackStatus, fallbackQuantity) => {
  if (value && typeof value === "object") {
    return {
      new: Number(value.new || 0),
      old: Number(value.old || 0),
      repair: Number(value.repair || 0),
      broken: Number(value.broken || 0),
    };
  }

  const fallback = createEmptyStatusCounts();
  const normalizedFallbackStatus = String(fallbackStatus || "")
    .trim()
    .toLowerCase();

  if (STATUS_KEYS.includes(normalizedFallbackStatus)) {
    fallback[normalizedFallbackStatus] = Number(fallbackQuantity || 0);
  }

  return fallback;
};

const getTotalQuantity = (statusCounts) =>
  STATUS_KEYS.reduce((sum, key) => sum + Number(statusCounts?.[key] || 0), 0);

const formatStatusCounts = (statusCounts) => {
  const chunks = STATUS_KEYS.filter(
    (key) => Number(statusCounts?.[key] || 0) > 0,
  ).map((key) => `${getStatusLabel(key)}: ${Number(statusCounts?.[key] || 0)}`);

  if (!chunks.length) {
    return "-";
  }

  return chunks.join(", ");
};

const normalizeImageUrls = (item) => {
  if (Array.isArray(item?.imageUrls)) {
    return item.imageUrls.filter(Boolean);
  }

  if (Array.isArray(item?.images)) {
    return item.images.filter(Boolean);
  }

  if (typeof item?.imageUrls === "string") {
    return item.imageUrls
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  if (typeof item?.imageUrl === "string" && item.imageUrl.trim()) {
    return [item.imageUrl.trim()];
  }

  return [];
};

const resolveImageUrl = (value) => {
  if (!value) {
    return "";
  }

  const normalizedRaw = String(value).trim().replace(/\\/g, "/");

  if (
    normalizedRaw.startsWith("http://") ||
    normalizedRaw.startsWith("https://") ||
    normalizedRaw.startsWith("blob:") ||
    normalizedRaw.startsWith("data:")
  ) {
    return normalizedRaw;
  }

  return `${API_BASE_URL}${normalizedRaw.startsWith("/") ? "" : "/"}${normalizedRaw}`;
};

const normalizeInstrument = (item) => ({
  id: item?.id ?? item?._id,
  name: item?.name || "",
  statusCounts: normalizeStatusCounts(
    item?.statusCounts,
    item?.status,
    item?.quantity,
  ),
  unit: item?.unit || "dona",
  location: item?.location || "",
  note: item?.note || "",
  imageUrls: normalizeImageUrls(item),
  createdAt: item?.createdAt || "",
  updatedAt: item?.updatedAt || "",
});

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("uz-UZ");
};

function Instruments() {
  const screens = Grid.useBreakpoint();
  const isTabletOrMobile = !screens.lg;
  const [form] = Form.useForm();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const loadInstruments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInstrumentsApi();
      setRecords((data || []).map(normalizeInstrument));
    } catch {
      message.error("Uskunalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstruments();
  }, [loadInstruments]);

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      statusCounts: {
        new: 1,
        old: 0,
        repair: 0,
        broken: 0,
      },
      unit: "dona",
      images: [],
    });
    setOpen(true);
  };

  const openEditModal = useCallback(
    (record) => {
      const existingImages = (record?.imageUrls || [])
        .map((url, index) => {
          const resolvedUrl = resolveImageUrl(url);

          if (!resolvedUrl) {
            return null;
          }

          return {
            uid: `existing-${record.id || "instrument"}-${index}`,
            name: `image-${index + 1}`,
            status: "done",
            url: resolvedUrl,
            rawUrl: String(url || "").trim(),
          };
        })
        .filter(Boolean);

      setEditingRecord(record);
      form.setFieldsValue({
        name: record.name,
        statusCounts: normalizeStatusCounts(
          record.statusCounts,
          record.status,
          record.quantity,
        ),
        unit: record.unit,
        location: record.location,
        note: record.note,
        images: existingImages,
      });
      setOpen(true);
    },
    [form],
  );

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteInstrumentApi(id);
      message.success("Uskuna o‘chirildi");
      setRecords((prev) => prev.filter((item) => item.id !== id));
    } catch {
      message.error("Uskunani o‘chirishda xatolik");
    }
  }, []);

  const handleActionMenuClick = useCallback(
    (record, key) => {
      if (key === "edit") {
        openEditModal(record);
        return;
      }

      if (key === "delete") {
        Modal.confirm({
          title: "Uskunani o‘chirishni tasdiqlaysizmi?",
          okText: "Ha",
          cancelText: "Yo‘q",
          okButtonProps: { danger: true },
          onOk: async () => {
            await handleDelete(record.id);
          },
        });
      }
    },
    [handleDelete, openEditModal],
  );

  const renderActionMenu = useCallback(
    (record) => {
      const menu = {
        items: [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Tahrirlash",
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "O‘chirish",
            danger: true,
          },
        ],
        onClick: ({ key }) => handleActionMenuClick(record, key),
      };

      return (
        <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      );
    },
    [handleActionMenuClick],
  );

  const handleSubmit = async (values) => {
    const currentExistingImageUrls = (values?.images || [])
      .filter((item) => Boolean(item?.rawUrl))
      .map((item) => item?.rawUrl)
      .filter(Boolean)
      .map((url) => String(url).trim())
      .filter(Boolean);

    const originalExistingImageUrls = Array.isArray(editingRecord?.imageUrls)
      ? editingRecord.imageUrls
          .map((url) => String(url || "").trim())
          .filter(Boolean)
      : [];

    const removedImageUrls = originalExistingImageUrls.filter(
      (url) => !currentExistingImageUrls.includes(url),
    );

    const imageFiles = (values?.images || [])
      .map((item) => item?.originFileObj)
      .filter(Boolean)
      .slice(0, 10);

    const payload = {
      name: values?.name,
      statusCounts: normalizeStatusCounts(values?.statusCounts),
      unit: values?.unit,
      location: values?.location,
      note: values?.note,
      images: imageFiles.length ? imageFiles : undefined,
      existingImageUrls: editingRecord?.id
        ? currentExistingImageUrls
        : undefined,
      removedImageUrls: editingRecord?.id ? removedImageUrls : undefined,
    };

    try {
      setSaving(true);

      if (editingRecord?.id) {
        await updateInstrumentApi(editingRecord.id, payload);
        message.success("Uskuna yangilandi");
      } else {
        await createInstrumentApi(payload);
        message.success("Yangi uskuna qo‘shildi");
      }

      closeModal();
      await loadInstruments();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Saqlashda xatolik yuz berdi";
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Rasm",
        key: "images",
        width: 80,
        render: (_, record) => {
          const resolvedImages = (record?.imageUrls || [])
            .map((url) => resolveImageUrl(url))
            .filter(Boolean);

          const firstImage = resolvedImages[0];

          if (!firstImage) {
            return <Text type="secondary">Yo‘q</Text>;
          }

          return (
            <Space size={8}>
              <Image.PreviewGroup items={resolvedImages}>
                <Image
                  src={firstImage}
                  alt={record.name}
                  width={36}
                  height={36}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              </Image.PreviewGroup>
              {resolvedImages.length > 1 ? (
                <Text type="secondary">+{resolvedImages.length - 1}</Text>
              ) : null}
            </Space>
          );
        },
      },
      {
        title: "Nomi",
        dataIndex: "name",
        key: "name",
        width: 220,
      },
      {
        title: "Holat",
        dataIndex: "statusCounts",
        key: "status",
        width: 260,
        render: (value) => formatStatusCounts(value),
      },
      {
        title: "Miqdor",
        key: "quantity",
        width: 120,
        render: (_, record) =>
          `${getTotalQuantity(record.statusCounts)} ${record.unit || "dona"}`,
      },
      {
        title: "Joylashuv",
        dataIndex: "location",
        key: "location",
        width: 180,
        render: (value) => value || "-",
      },
      {
        title: "Yangilangan",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 170,
        render: (value) => formatDate(value),
      },
      {
        title: "Amallar",
        key: "actions",
        width: 90,
        fixed: "right",
        render: (_, record) => renderActionMenu(record),
      },
    ],
    [renderActionMenu],
  );

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Space
          align="center"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Uskunalar
            </Title>
            <Text type="secondary">Ombordagi asbob-uskunalar ro‘yxati</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Qo‘shish
          </Button>
        </Space>
      </Card>
      <div>
        {isTabletOrMobile ? (
          loading ? (
            <div style={{ marginTop: 20, textAlign: "center", padding: 20 }}>
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              {records.map((item) => {
                const resolvedImages = (item?.imageUrls || [])
                  .map((url) => resolveImageUrl(url))
                  .filter(Boolean);
                const visibleImages = resolvedImages.slice(0, 4);
                const hiddenCount = Math.max(resolvedImages.length - 4, 0);

                return (
                  <Card
                    key={item.id}
                    style={{ borderRadius: 12 }}
                    bodyStyle={{ padding: 14 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <Title level={5} style={{ margin: 0 }}>
                        {item.name || "-"}
                      </Title>
                      {renderActionMenu(item)}
                    </div>

                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <Text>
                        <strong>Holat:</strong>{" "}
                        {formatStatusCounts(item.statusCounts)}
                      </Text>
                      <Text>
                        <strong>Miqdor:</strong>{" "}
                        {getTotalQuantity(item.statusCounts)}{" "}
                        {item.unit || "dona"}
                      </Text>
                      <Text>
                        <strong>Joylashuv:</strong> {item.location || "-"}
                      </Text>
                      <Text>
                        <strong>Izoh:</strong> {item.note || "-"}
                      </Text>
                      <Text>
                        <strong>Yangilangan:</strong>{" "}
                        {formatDate(item.updatedAt)}
                      </Text>
                    </Space>

                    <div style={{ marginTop: 10 }}>
                      {visibleImages.length ? (
                        <Space size={8} align="center">
                          <Image.PreviewGroup items={resolvedImages}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexWrap: "wrap",
                              }}
                            >
                              {visibleImages.map((imageUrl, index) => (
                                <Image
                                  key={`${item.id}-image-${index}`}
                                  src={imageUrl}
                                  alt={item.name}
                                  width={44}
                                  height={44}
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: 8,
                                  }}
                                />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                          {hiddenCount > 0 ? (
                            <Text type="secondary">+{hiddenCount}</Text>
                          ) : null}
                        </Space>
                      ) : (
                        <Text type="secondary">Rasm yo‘q</Text>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          <Table
            style={{ marginTop: 16 }}
            columns={columns}
            dataSource={records}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 980 }}
          />
        )}
      </div>

      <Modal
        title={editingRecord ? "Uskunani tahrirlash" : "Yangi uskuna qo‘shish"}
        open={open}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingRecord ? "Saqlash" : "Qo‘shish"}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nomi"
            name="name"
            rules={
              editingRecord
                ? []
                : [
                    { required: true, message: "Nomi majburiy" },
                    { min: 2, message: "Kamida 2 ta belgi kiriting" },
                  ]
            }
          >
            <Input placeholder="Masalan, Perforator" />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Yangi"
              name={["statusCounts", "new"]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Eski"
              name={["statusCounts", "old"]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Ta’mir talab"
              name={["statusCounts", "repair"]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Ishdan chiqqan"
              name={["statusCounts", "broken"]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Birlik" name="unit" style={{ flex: 1 }}>
              <Input placeholder="dona" />
            </Form.Item>
          </Space>

          <Form.Item label="Joylashuv" name="location">
            <Input placeholder="Masalan, 2-ombor" />
          </Form.Item>

          <Form.Item label="Izoh" name="note">
            <TextArea rows={3} placeholder="Qo‘shimcha izoh" />
          </Form.Item>

          <Form.Item
            label="Rasmlar (max 10 ta)"
            name="images"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList || []}
          >
            <Upload
              beforeUpload={() => false}
              listType="picture"
              multiple
              maxCount={10}
            >
              <Button icon={<UploadOutlined />}>Rasm tanlash</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Instruments;
