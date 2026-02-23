import { useEffect, useRef, useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Grid } from "antd";
import {
  AppstoreOutlined,
  LogoutOutlined,
  // FileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RedEnvelopeOutlined,
  // SettingOutlined,
  TeamOutlined,
  UserOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Router from "./router";
import { useAuth } from "./hooks/useAuth";
import { API_BASE_URL, USER_STORAGE_KEY } from "./api/axios";
import { getAccountMeApi } from "./api/account.api";
import "./App.css";
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
  getItem(
    <Link to={"/instruments"}>Uskunalar</Link>,
    "6",
    <AppstoreOutlined />,
  ),
  // getItem(<Link to={"/Files"}>Files</Link>, "11", <FileOutlined />),

  getItem("User", "sub1", <UserOutlined />, [
    getItem(<Link to={"/user/users"}>Foydalanuvchilar</Link>, "31"),
    getItem(<Link to={"/user/account"}>Akkaunt</Link>, "32"),
  ]),
];

const canAccessUsersPage = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  return normalizedRole === "admin" || normalizedRole === "boss";
};

const resolveAvatarUrl = (value) => {
  if (!value) {
    return undefined;
  }

  const raw = String(value).trim();
  const normalizedRaw = raw.replace(/\\/g, "/");

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

const App = () => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const location = useLocation();
  const { isAuthenticated, login, logout, user, setUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const avatarSyncAttemptedForRef = useRef(null);

  const handleLogin = async ({ identifier, password }) => {
    await login({ identifier, password });
    navigate("/report", { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userAvatarSrc = resolveAvatarUrl(
    user?.avatarUrl ||
      user?.avatar ||
      user?.url ||
      user?.avatarPath ||
      user?.profileImage,
  );

  const menuItems = canAccessUsersPage(user?.role)
    ? items
    : [
        getItem(
          <Link to={"/report"}>Report</Link>,
          "5",
          <RedEnvelopeOutlined />,
        ),
        getItem(
          <Link to={"/instruments"}>Uskunalar</Link>,
          "6",
          <AppstoreOutlined />,
        ),
        getItem("User", "sub1", <UserOutlined />, [
          getItem(<Link to={"/user/account"}>Akkaunt</Link>, "32"),
        ]),
      ];

  useEffect(() => {
    const hasAvatar = Boolean(
      user?.avatarUrl ||
      user?.avatar ||
      user?.url ||
      user?.avatarPath ||
      user?.profileImage,
    );

    const userSyncKey =
      user?.id || user?._id || user?.email || user?.phone || "anonymous";

    if (!isAuthenticated || hasAvatar) {
      if (!isAuthenticated) {
        avatarSyncAttemptedForRef.current = null;
      }
      return;
    }

    if (avatarSyncAttemptedForRef.current === userSyncKey) {
      return;
    }

    avatarSyncAttemptedForRef.current = userSyncKey;

    let cancelled = false;

    const syncMe = async () => {
      try {
        const me = await getAccountMeApi();
        if (cancelled || !me) {
          return;
        }

        const mergedUser = { ...me };
        setUser(mergedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mergedUser));
      } catch {
        // noop
      }
    };

    syncMe();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    setUser,
    user?._id,
    user?.avatar,
    user?.avatarPath,
    user?.avatarUrl,
    user?.email,
    user?.id,
    user?.phone,
    user?.profileImage,
    user?.url,
  ]);

  const profileMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: <Link to="/user/account">Profile</Link>,
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
      },
    ],
    onClick: ({ key }) => {
      if (key === "logout") {
        handleLogout();
      }
    },
  };

  const canSeeUsersTab = canAccessUsersPage(user?.role);

  const mobileTabs = [
    {
      key: "report",
      label: "Hisobot",
      to: "/report",
      icon: <FilePdfOutlined style={{ fontSize: 22 }} />,
    },
    {
      key: "instruments",
      label: "Uskunalar",
      to: "/instruments",
      icon: <AppstoreOutlined style={{ fontSize: 22 }} />,
    },
    ...(canSeeUsersTab
      ? [
          {
            key: "users",
            label: "Kontaktlar",
            to: "/user/users",
            icon: <TeamOutlined style={{ fontSize: 22 }} />,
          },
        ]
      : []),
    // {
    //   key: "sozlamalar",
    //   label: "Sozlamalar",
    //   to: "/TeamOne",
    //   icon: <SettingOutlined style={{ fontSize: 22 }} />,
    // },
    {
      key: "profil",
      label: "Profil",
      to: "/user/account",
      icon: <Avatar src={userAvatarSrc} icon={<UserOutlined />} size={26} />,
    },
  ];

  const getActiveMobileTabKey = () => {
    if (location.pathname.startsWith("/user/account")) {
      return "profil";
    }
    if (location.pathname.startsWith("/instruments")) {
      return "instruments";
    }
    if (location.pathname.startsWith("/user/users")) {
      return "users";
    }
    if (location.pathname.startsWith("/TeamOne")) {
      return "sozlamalar";
    }
    return "report";
  };

  const activeMobileTabKey = getActiveMobileTabKey();

  if (!isAuthenticated || location.pathname === "/login") {
    return (
      <Router
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        userRole={user?.role}
      />
    );
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      {!isMobile ? (
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
            items={menuItems}
          />
        </Sider>
      ) : null}

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
            {!isMobile ? (
              <Button
                type="text"
                onClick={() => {
                  setCollapsed((prev) => !prev);
                }}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                style={{ marginRight: 6 }}
                aria-label="Menyuni ochish yoki yopish"
              />
            ) : null}
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
          <Dropdown menu={profileMenu} trigger={["click"]}>
            <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              href="/"
              style={{
                color: "black",
                fontSize: 18,
              }}
            >
              <Avatar src={userAvatarSrc} icon={<UserOutlined />} size={50} />
              {/* Profile */}
            </a>
          </Dropdown>
        </Header>
        <Content
          style={{
            background: "#EBEDF0",
            borderRadius: 8,
            paddingBottom: isMobile ? 84 : 0,
          }}
        >
          <Router
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            userRole={user?.role}
          />
        </Content>
        {!isMobile ? (
          <Footer
            style={{
              textAlign: "center",
              background: "#fff",
              height: 50,
            }}
          >
            Hisobot ©{new Date().getFullYear()}
          </Footer>
        ) : null}
        {isMobile ? (
          <nav className="mobile-bottom-nav" aria-label="Mobil navigatsiya">
            {mobileTabs.map((tab) => {
              const isActive = activeMobileTabKey === tab.key;

              return (
                <Link
                  key={tab.key}
                  to={tab.to}
                  className={`mobile-bottom-nav__item ${isActive ? "is-active" : ""}`}
                >
                  <span className="mobile-bottom-nav__icon">{tab.icon}</span>
                  <span className="mobile-bottom-nav__label">{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </Layout>
    </Layout>
  );
};
export default App;
