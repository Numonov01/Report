import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  Upload,
  message,
} from "antd";
import {
  CameraOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Account.css";

const { Text } = Typography;

function Account() {
  const [form] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState("/Boy.png");
  const [publicProfile, setPublicProfile] = useState(true);

  const onSave = async () => {
    await form.validateFields();
    message.success("O‘zgarishlar saqlandi");
  };

  const onPasswordSave = async () => {
    await securityForm.validateFields();
    message.success("Parol yangilandi");
    securityForm.resetFields();
  };

  const handleAvatarChange = ({ file }) => {
    if (!file?.originFileObj) {
      return;
    }
    const localUrl = URL.createObjectURL(file.originFileObj);
    setAvatarUrl(localUrl);
    message.success("Rasm yangilandi");
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
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
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

                    <div className="account-public-row">
                      <Text>Public profile</Text>
                      <Switch
                        checked={publicProfile}
                        onChange={setPublicProfile}
                      />
                    </div>

                    <Button danger className="account-delete-btn">
                      Delete user
                    </Button>
                  </Card>
                </Col>

                <Col xs={24} lg={16}>
                  <Card className="account-form-card" bordered={false}>
                    <Form
                      form={form}
                      layout="vertical"
                      initialValues={{
                        fullName: "Numonov Tohir",
                        email: "numonovtokhir@gmail.com",
                        phone: "+998 90 123 45 67",
                        role: "Administrator",
                        about:
                          "Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.",
                      }}
                    >
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
                            label="Role"
                            name="role"
                            rules={[
                              {
                                required: true,
                                message: "Role tanlang",
                              },
                            ]}
                          >
                            <Select
                              options={[
                                {
                                  value: "Administrator",
                                  label: "Administrator",
                                },
                                { value: "Operator", label: "Operator" },
                                { value: "Analitik", label: "Analitik" },
                              ]}
                            />
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
                          onClick={onSave}
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
                <Form form={securityForm} layout="vertical">
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
                      onClick={onPasswordSave}
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
