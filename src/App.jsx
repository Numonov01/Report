import { useEffect, useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Drawer, Grid } from "antd";
import {
  LogoutOutlined,
  FileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RedEnvelopeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Router from "./router";
const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem(<Link to={"/report"}>Report</Link>, "5", <RedEnvelopeOutlined />),
  getItem(<Link to={"/Files"}>Files</Link>, "11", <FileOutlined />),

  getItem("User", "sub1", <UserOutlined />, [
    getItem(<Link to={"/user/users"}>Foydalanuvchilar</Link>, "31"),
    getItem(<Link to={"/user/account"}>Akkaunt</Link>, "32"),
  ]),
];

const App = () => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("fw_auth") === "1",
  );
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogin = () => {
    localStorage.setItem("fw_auth", "1");
    setIsAuthenticated(true);
    navigate("/report", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("fw_auth");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (isMobile) {
      setMobileNavOpen(false);
    }
  }, [location.pathname, isMobile]);

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <Link to="/user/account">
          <UserOutlined />
          Profile
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" onClick={handleLogout}>
        <LogoutOutlined />
        Logout
      </Menu.Item>
    </Menu>
  );

  if (!isAuthenticated || location.pathname === "/login") {
    return <Router isAuthenticated={isAuthenticated} onLogin={handleLogin} />;
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      {isMobile ? (
        <Drawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          placement="left"
          width={240}
          closable={false}
          bodyStyle={{ padding: 0, background: "white" }}
        >
          <Menu
            theme="light"
            defaultSelectedKeys={["1"]}
            mode="inline"
            style={{ height: "100%" }}
            items={items}
            onClick={() => setMobileNavOpen(false)}
          />
        </Drawer>
      ) : (
        <Sider
          collapsible
          breakpoint="lg"
          collapsedWidth={0}
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          trigger={null}
          style={{
            background: "white",
          }}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="light"
            defaultSelectedKeys={["1"]}
            mode="inline"
            style={{ position: "sticky", top: 0 }}
            items={items}
          />
        </Sider>
      )}

      <Layout>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: "1",
            width: "100%",
            background: "white", //Nav
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              type="text"
              onClick={() => {
                if (isMobile) {
                  setMobileNavOpen((prev) => !prev);
                  return;
                }
                setCollapsed((prev) => !prev);
              }}
              icon={
                isMobile ? (
                  mobileNavOpen ? (
                    <MenuFoldOutlined />
                  ) : (
                    <MenuUnfoldOutlined />
                  )
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              style={{ marginRight: 6 }}
              aria-label="Menyuni ochish yoki yopish"
            />
            <img
              src="../firewall.png"
              alt="icon"
              style={{
                width: 55,
                marginRight: 10,
              }}
            />
            {/* <Avatar size={40} style={{ marginRight: 10 }}>
              FW
            </Avatar> */}
            <h3 className="brand">Hisobot</h3>
          </div>
          <Dropdown overlay={menu} trigger={["click"]}>
            <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              href="/"
              style={{
                color: "black",
                fontSize: 18,
              }}
            >
              <Avatar src="../Boy.png" size={50} />
              {/* Profile */}
            </a>
          </Dropdown>
        </Header>
        <Content style={{ background: "#EBEDF0", borderRadius: 8 }}>
          <Router isAuthenticated={isAuthenticated} onLogin={handleLogin} />
        </Content>
        <Footer
          style={{
            textAlign: "center",
            background: "#fff",
            height: 50,
          }}
        >
          Hisobot ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;
