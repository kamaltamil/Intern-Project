import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Layout, Typography } from "antd";
import { Link } from "react-router-dom";

const { Footer: AntFooter } = Layout;
const { Title, Paragraph, Text } = Typography;

function Footer() {
  return (
    <AntFooter
      id="contact"
      className="!bg-[#171311] !p-0 !text-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo/logo.png"
                alt="HotelPro"
                className="h-10 w-10 rounded-full object-cover"
              />

              <Title
                level={3}
                className="!mb-0 !text-xl !font-semibold !text-white"
              >
                HotelPro
              </Title>
            </div>

            <Paragraph
              className="!mt-5 !max-w-xs !text-sm !leading-6"
              style={{
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Comfortable rooms, thoughtful service, and a
              simpler way to plan your next stay.
            </Paragraph>
          </div>

          {/* Quick Links */}
          <div>
            <Title
              level={4}
              className="!mb-0 !text-base !font-semibold !text-white"
            >
              Quick Links
            </Title>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="#home"
                className="text-white/55 no-underline hover:text-white"
              >
                Home
              </a>

              <a
                href="#rooms"
                className="text-white/55 no-underline hover:text-white"
              >
                Rooms
              </a>

              <a
                href="#services"
                className="text-white/55 no-underline hover:text-white"
              >
                Services
              </a>

              <a
                href="#about"
                className="text-white/55 no-underline hover:text-white"
              >
                About
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <Title
              level={4}
              className="!mb-0 !text-base !font-semibold !text-white"
            >
              Our Services
            </Title>

            <div className="mt-4 flex flex-col gap-3 text-sm text-white/55">
              <span>24/7 Reception</span>
              <span>Room Service</span>
              <span>Breakfast</span>
              <span>Housekeeping</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <Title
              level={4}
              className="!mb-0 !text-base !font-semibold !text-white"
            >
              Contact Us
            </Title>

            <div className="mt-4 flex flex-col gap-3 text-sm text-white/55">
              <span className="flex gap-2">
                <EnvironmentOutlined />
                HotelPro, Trichy
              </span>

              <span className="flex gap-2">
                <PhoneOutlined />
                +91 98765 43210
              </span>

              <span className="flex gap-2">
                <MailOutlined />
                hello@hotelpro.com
              </span>

              <div className="flex gap-4 pt-2">
                <Link
                  to="/login"
                  className="text-[#E4B07A] no-underline hover:text-white"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="text-[#E4B07A] no-underline hover:text-white"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} HotelPro. All rights reserved.
        </div>
      </div>
    </AntFooter>
  );
}

export default Footer;