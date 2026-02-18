import { Button, Card, Form, Input, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const DEMO_CREDENTIALS = {
  username: "admin",
  password: "123",
};

function Login() {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (
      values.username === DEMO_CREDENTIALS.username &&
      values.password === DEMO_CREDENTIALS.password
    ) {
      localStorage.setItem("fw_auth", "1");
      message.success("Muvaffaqiyatli kirdingiz");
      window.location.replace("/report");
      return;
    }

    message.error("Login yoki parol noto‘g‘ri");
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
        <Text type="secondary">Username va password kiriting</Text>

        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Username kiriting" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password kiriting" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Button type="primary" block size="large" onClick={handleSubmit}>
            Kirish
          </Button>

          <Text type="secondary" style={{ display: "block", marginTop: 10 }}>
            Demo: admin / 123
          </Text>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
