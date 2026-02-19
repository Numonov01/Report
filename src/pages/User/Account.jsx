import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Tabs,
  Typography,
  Upload,
  message,
} from "antd";
import {
  CameraOutlined,
  SafetyOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import {
  deleteAccountAvatarApi,
  getAccountMeApi,
  updateAccountMeApi,
  updateAccountPasswordApi,
  uploadAccountAvatarApi,
} from "../../api/account.api";
import { API_BASE_URL } from "../../api/axios";
import "./Account.css";

const { Text } = Typography;

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

const extractAvatarValue = (value) =>
  value?.avatarUrl ||
  value?.avatar ||
  value?.url ||
  value?.avatarPath ||
  value?.profileImage ||
  null;

const ROLE_META = {
  admin: {
    icon: <SafetyOutlined />,
    label: "Admin",
    className: "role-admin",
  },
  manager: {
    icon: <TeamOutlined />,
    label: "Manager",
    className: "role-manager",
  },
  boss: {
    icon: <SolutionOutlined />,
    label: "Boss",
    className: "role-boss",
  },
  worker: {
    icon: <ToolOutlined />,
    label: "Worker",
    className: "role-worker",
  },
};

function Account() {
  const [form] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(undefined);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [accountRole, setAccountRole] = useState("worker");
  const [avatarRawValue, setAvatarRawValue] = useState(null);
  const normalizedRole = String(accountRole || "worker").toLowerCase();
  const roleMeta = ROLE_META[normalizedRole] || ROLE_META.worker;

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const data = await getAccountMeApi();
        form.setFieldsValue({
          fullName: data?.fullName || "",
          email: data?.email || "",
          phone: data?.phone || "",
          workPlace: data?.workPlace || data?.workplace || "",
          about: data?.about || "",
        });
        setAccountRole(data?.role || "worker");
        const rawAvatar = extractAvatarValue(data);
        setAvatarRawValue(rawAvatar);
        setAvatarUrl(resolveAvatarUrl(rawAvatar));
      } catch {
        message.error("Akkaunt ma’lumotlarini yuklashda xatolik");
      }
    };

    loadAccount();
  }, [form]);

  const onSave = async (values) => {
    try {
      setSavingProfile(true);

      let safeAvatarValue = avatarRawValue;
      if (!safeAvatarValue) {
        const latest = await getAccountMeApi();
        safeAvatarValue = extractAvatarValue(latest);
        if (safeAvatarValue) {
          setAvatarRawValue(safeAvatarValue);
          setAvatarUrl(resolveAvatarUrl(safeAvatarValue));
        }
      }

      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        workPlace: values.workPlace || "",
        about: values.about || "",
      };

      if (safeAvatarValue) {
        payload.avatarUrl = safeAvatarValue;
        payload.avatar = safeAvatarValue;
      }

      await updateAccountMeApi(payload);
      message.success("O‘zgarishlar saqlandi");
    } catch (error) {
      if (!error?.errorFields) {
        const apiMessage =
          error?.response?.data?.message || "Saqlashda xatolik";
        message.error(apiMessage);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSave = async (values) => {
    try {
      setSavingPassword(true);
      await updateAccountPasswordApi({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success("Parol yangilandi");
      securityForm.resetFields();
    } catch (error) {
      if (!error?.errorFields) {
        const apiMessage =
          error?.response?.data?.message || "Parolni yangilashda xatolik";
        message.error(apiMessage);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    if (!file) {
      return;
    }

    try {
      setUploadingAvatar(true);
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
      const data = await uploadAccountAvatarApi(file);
      console.log("[account/avatar] upload response:", data);
      let rawAvatar = extractAvatarValue(data);

      if (!rawAvatar) {
        const refreshed = await getAccountMeApi();
        rawAvatar = extractAvatarValue(refreshed);
      }

      setAvatarRawValue(rawAvatar);
      setAvatarUrl(resolveAvatarUrl(rawAvatar) || localUrl);
      message.success("Rasm yangilandi");
      onSuccess?.(data, file);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message || "Rasm yuklashda xatolik";
      message.error(apiMessage);
      onError?.(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setDeletingAvatar(true);
      await deleteAccountAvatarApi();
      setAvatarRawValue(null);
      setAvatarUrl(undefined);
      message.success("Rasm o‘chirildi");
    } catch {
      message.error("Rasmni o‘chirishda xatolik");
    } finally {
      setDeletingAvatar(false);
    }
  };

  return (
    <div className="account-page">
      <Tabs
        defaultActiveKey="general"
        className="account-tabs"
        items={[
          {
            key: "general",
            label: (
              <Space size={6}>
                <UserOutlined />
                General
              </Space>
            ),
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                  <Card className="account-left-card" bordered={false}>
                    <Upload
                      accept=".jpeg,.jpg,.png,.gif"
                      showUploadList={false}
                      disabled={uploadingAvatar}
                      customRequest={handleAvatarUpload}
                    >
                      <div className="account-photo-uploader" role="button">
                        <Avatar
                          size={170}
                          src={avatarUrl}
                          icon={<UserOutlined />}
                        />
                        <div className="account-photo-overlay">
                          <CameraOutlined />
                          <span>Update photo</span>
                        </div>
                      </div>
                    </Upload>

                    <Text type="secondary" className="account-upload-text">
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br />
                      max size of 3 Mb
                    </Text>

                    <Text
                      className={`account-role-badge ${roleMeta.className}`}
                    >
                      {roleMeta.icon}
                      <span>{roleMeta.label}</span>
                    </Text>

                    <Button
                      danger
                      className="account-delete-btn"
                      loading={deletingAvatar}
                      onClick={handleAvatarDelete}
                    >
                      Delete avatar
                    </Button>
                  </Card>
                </Col>

                <Col xs={24} lg={16}>
                  <Card className="account-form-card" bordered={false}>
                    <Form form={form} layout="vertical" onFinish={onSave}>
                      <Row gutter={[12, 4]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Ism familiyasi"
                            name="fullName"
                            rules={[
                              {
                                required: true,
                                message: "Ism familiyani kiriting",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Nomer"
                            name="phone"
                            rules={[
                              {
                                required: true,
                                message: "Telefon nomerni kiriting",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Gmail"
                            name="email"
                            rules={[
                              { required: true, message: "Email kiriting" },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item label="Ish joyi" name="workPlace">
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24}>
                          <Form.Item label="About" name="about">
                            <Input.TextArea rows={5} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="account-save-row">
                        <Button
                          type="primary"
                          size="large"
                          htmlType="submit"
                          loading={savingProfile}
                          className="account-save-btn"
                        >
                          Saqlash
                        </Button>
                      </div>
                    </Form>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "security",
            label: (
              <Space size={6}>
                <SafetyOutlined />
                Security
              </Space>
            ),
            children: (
              <Card bordered={false} className="account-form-card">
                <Form
                  form={securityForm}
                  layout="vertical"
                  onFinish={onPasswordSave}
                >
                  <Row gutter={[12, 4]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Joriy parol"
                        name="currentPassword"
                        rules={[
                          {
                            required: true,
                            message: "Joriy parolni kiriting",
                          },
                        ]}
                      >
                        <Input.Password placeholder="••••••••" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Yangi parol"
                        name="newPassword"
                        rules={[
                          {
                            required: true,
                            message: "Yangi parolni kiriting",
                          },
                          {
                            min: 6,
                            message: "Kamida 6 ta belgidan iborat bo‘lsin",
                          },
                        ]}
                      >
                        <Input.Password placeholder="••••••••" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Yangi parolni tasdiqlang"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                          {
                            required: true,
                            message: "Parolni tasdiqlang",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("newPassword") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Parollar mos emas"),
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password placeholder="••••••••" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="account-save-row">
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={savingPassword}
                    >
                      Parolni yangilash
                    </Button>
                  </div>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}

export default Account;
