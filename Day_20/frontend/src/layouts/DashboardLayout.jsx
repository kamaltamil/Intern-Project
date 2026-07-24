import { useState } from "react";
import { Layout, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import "./DashboardLayout.css";

const { Sider, Header, Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="dark"
        collapsible
        trigger={null}
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={80}
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      <Layout>
        <Header className="dashboard-header">
          <div className="header-left">
            <Button
              type="text"
              icon={
                collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() => setCollapsed(!collapsed)}
            />

            <h2 className="header-title">
              Task Manager
            </h2>
          </div>
        </Header>

        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;