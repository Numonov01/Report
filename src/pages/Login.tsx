import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Login({
  onLogin,
}: {
  onLogin: (values: { identifier: string; password: string }) => Promise<void>;
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: {
    identifier: string;
    password: string;
  }) => {
    try {
      setSubmitting(true);
      await onLogin(values);
      message.success("Muvaffaqiyatli kirdingiz");
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message || "Login yoki parol noto‘g‘ri";
      message.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#ebedf0",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 420, borderRadius: 14 }}>
        <Title level={3} style={{ marginBottom: 6 }}>
          Tizimga kirish
        </Title>
        <Text type="secondary">Identifier va password kiriting</Text>

        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          onFinish={handleFinish}
        >
          <Form.Item
            name="identifier"
            label="Identifier"
            rules={[{ required: true, message: "Identifier kiriting" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username yoki email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password kiriting" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            loading={submitting}
          >
            Kirish
          </Button>
        </Form>
      </Card>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
