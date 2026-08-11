import { Button, Typography } from "antd";
import {
  ArrowRightOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-[620px] overflow-hidden bg-[#27221F] sm:min-h-[680px]"
    >
      <img
        src="/landing/hero.jpg"
        alt="Hotel reception"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,20,17,0.78)_0%,rgba(25,20,17,0.46)_50%,rgba(25,20,17,0.18)_100%)]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-5 pb-24 pt-32 sm:min-h-[680px] lg:px-8">
        <div className="max-w-2xl text-white">
          <Text
            className="mb-4 block text-xs font-semibold uppercase tracking-[0.28em]"
            style={{
              color: "#E4B07A",
            }}
          >
            Welcome to HotelPro
          </Text>

          <Title
            level={1}
            className="!mb-0 !text-4xl !font-semibold !leading-tight !text-white sm:!text-5xl lg:!text-6xl"
          >
            Comfortable stays,
            <br />
            <span style={{ color: "#E4B07A" }}>
              memorable experiences.
            </span>
          </Title>

          <Paragraph
            className="!mt-6 !max-w-xl !text-base !leading-7 sm:!text-lg"
            style={{
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Find the perfect room, relax in thoughtful spaces,
            and enjoy a seamless hotel experience from booking
            to checkout.
          </Paragraph>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  height: 48,
                  paddingInline: 24,
                  borderRadius: 999,
                  background: "#C76A34",
                  borderColor: "#C76A34",
                  fontWeight: 600,
                }}
              >
                Book Now
              </Button>
            </Link>

            <a href="#rooms">
              <Button
                size="large"
                icon={<PlayCircleOutlined />}
                style={{
                  height: 48,
                  paddingInline: 24,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#ffffff",
                  fontWeight: 600,
                  backdropFilter: "blur(6px)",
                }}
              >
                Explore Rooms
              </Button>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 border-t border-white/20 pt-6 text-sm text-white/75">
            <span>
              <strong className="text-white">
                24/7
              </strong>{" "}
              Guest Support
            </span>

            <span>
              <strong className="text-white">
                Best
              </strong>{" "}
              Room Selection
            </span>

            <span>
              <strong className="text-white">
                Secure
              </strong>{" "}
              Booking
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;