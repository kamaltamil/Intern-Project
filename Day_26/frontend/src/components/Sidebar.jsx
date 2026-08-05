import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

function Sidebar() {
  return (
    <Sider breakpoint="lg" collapsedWidth="0" className="!bg-white !min-h-screen border-r border-[#ECE6DF]">
      <div className="p-5 text-2xl font-semibold text-[#C76A34]">HotelPro</div>
      <Menu mode="inline" defaultSelectedKeys={['1']} className="!border-0">
        <Menu.Item key="1" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />}>Users</Menu.Item>
        <Menu.Item key="3" icon={<CalendarOutlined />}>Bookings</Menu.Item>
        <Menu.Item key="4" icon={<BarChartOutlined />}>Reports</Menu.Item>
        <Menu.Item key="5" icon={<MessageOutlined />}>Messages</Menu.Item>
      </Menu>
    </Sider>
  );
}

export default Sidebar;
