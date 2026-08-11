import { useState } from "react";
import { Button, Drawer, Layout, Menu, Space } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Header } = Layout;

const links = [
  ["Home", "#home"],
  ["Rooms", "#rooms"],
  ["Services", "#services"],
  ["About", "#about"],
  ["Contact", "#contact"],
];

function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  const desktopMenuItems = links.map(([label, href]) => ({
    key: href,
    label: (
      <a
        href={href}
        onClick={closeMenu}
        className="text-sm font-medium text-white/90 no-underline"
      >
        {label}
      </a>
    ),
  }));

  const mobileMenuItems = links.map(([label, href]) => ({
    key: href,
    label: (
      <a
        href={href}
        onClick={closeMenu}
        className="no-underline"
      >
        {label}
      </a>
    ),
  }));

  return (
    <Header
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 80,
        padding: 0,
        background: "transparent",
        borderBottom: "none",
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-3 text-white no-underline"
        >
          <img
            src="/logo/logo.png"
            alt="HotelPro"
            className="h-10 w-10 rounded-full object-cover"
          />

          <span className="text-xl font-semibold tracking-wide">
            HotelPro
          </span>
        </a>

        {/* Desktop Navigation */}
        <Menu
          mode="horizontal"
          items={desktopMenuItems}
          selectable={false}
          className="hidden flex-1 justify-center border-none bg-transparent lg:flex"
          style={{
            background: "transparent",
          }}
        />

        {/* Desktop Login / Signup */}
        <Space
          size={12}
          className="hidden lg:flex"
        >
          <Link to="/login">
            <Button
              ghost
              style={{
                height: 40,
                paddingInline: 20,
                borderRadius: 999,
                borderColor: "rgba(255,255,255,0.6)",
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              Login
            </Button>
          </Link>

          <Link to="/signup">
            <Button
              type="primary"
              style={{
                height: 40,
                paddingInline: 20,
                borderRadius: 999,
                background: "#C76A34",
                borderColor: "#C76A34",
                fontWeight: 600,
              }}
            >
              Sign up
            </Button>
          </Link>
        </Space>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="lg:hidden"
          style={{
            color: "#ffffff",
            fontSize: 22,
          }}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="HotelPro"
        placement="right"
        open={open}
        onClose={closeMenu}
        width={280}
      >
        <Menu
          mode="vertical"
          items={mobileMenuItems}
          selectable={false}
          style={{
            border: "none",
          }}
        />

        <div className="mt-6 flex gap-3 border-t border-[#ECE6DF] pt-6">
          <Link
            to="/login"
            className="flex-1"
            onClick={closeMenu}
          >
            <Button
              block
              size="large"
            >
              Login
            </Button>
          </Link>

          <Link
            to="/signup"
            className="flex-1"
            onClick={closeMenu}
          >
            <Button
              type="primary"
              block
              size="large"
              style={{
                background: "#C76A34",
                borderColor: "#C76A34",
              }}
            >
              Sign up
            </Button>
          </Link>
        </div>
      </Drawer>
    </Header>
  );
}

export default Navbar;