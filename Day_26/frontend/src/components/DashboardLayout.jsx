import { Layout } from "antd";
import { useSelector } from "react-redux";
import RoleSidebar from "./RoleSidebar";
import TopHeader from "./TopHeader";

const { Content } = Layout;

/**
 * DashboardLayout
 *
 * Wraps all authenticated pages with the sidebar and top header.
 *
 * Permissions are loaded from Redux (set during login via setAuth).
 * No extra permission-fetch needed here — login already returns permissions.
 */
function DashboardLayout({ children }) {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";

  return (
    <Layout
      className="min-h-screen w-full"
      style={{
        background: isDark ? "#0f0f23" : "#F8F4EE",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        position: "fixed",
        inset: 0,
      }}
    >
      <RoleSidebar />

      <Layout
        style={{
          background: isDark ? "#0f0f23" : "#F8F4EE",
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <TopHeader />

        <Content
          style={{
            padding: 16,
            background: isDark ? "#0f0f23" : "#F8F4EE",
            color: isDark ? "#f0f0f0" : "#2E2A27",
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
