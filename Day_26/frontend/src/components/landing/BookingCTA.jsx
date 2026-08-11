import { Button, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

function BookingCTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#C76A34] px-6 py-12 text-center text-white sm:px-10 sm:py-16">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />

        <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-black/10" />

        <div className="relative mx-auto max-w-2xl">
          <Text className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">
            Plan your next stay
          </Text>

          <Title
            level={2}
            className="!mt-3 !mb-0 !text-3xl !font-semibold !text-white sm:!text-4xl"
          >
            Ready for your next stay?
          </Title>

          <Paragraph
            className="!mx-auto !mt-4 !max-w-xl !leading-7"
            style={{
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Book your room today and enjoy a comfortable hotel
            experience from arrival to checkout.
          </Paragraph>

          <Link to="/login">
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              className="!mt-7"
              style={{
                height: 48,
                paddingInline: 28,
                borderRadius: 999,
                background: "#ffffff",
                borderColor: "#ffffff",
                color: "#C76A34",
                fontWeight: 600,
              }}
            >
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BookingCTA;