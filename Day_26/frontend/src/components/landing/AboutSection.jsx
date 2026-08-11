import { Button, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div className="relative">
          <img
            src="/landing/about.jpg"
            alt="Hotel interior"
            className="h-[360px] w-full rounded-[2rem] object-cover shadow-xl sm:h-[470px]"
          />

          <div className="absolute -bottom-6 left-5 rounded-2xl bg-white p-5 shadow-xl sm:left-8">
            <Text
              className="block text-2xl font-semibold"
              style={{
                color: "#C76A34",
              }}
            >
              140+
            </Text>

            <Text
              className="text-xs"
              style={{
                color: "#8B8179",
              }}
            >
              Happy guests served
            </Text>
          </div>
        </div>

        {/* Content */}
        <div>
          <Text
            className="mb-3 block text-xs font-bold uppercase tracking-[0.25em]"
            style={{
              color: "#C76A34",
            }}
          >
            About HotelPro
          </Text>

          <Title
            level={2}
            className="!mb-0 !text-3xl !font-semibold !leading-tight sm:!text-4xl"
          >
            A better stay starts with the right place.
          </Title>

          <Paragraph
            className="!mt-5 !leading-7"
            style={{
              color: "#756C65",
            }}
          >
            HotelPro brings comfortable rooms, attentive
            service, and simple booking together in one place.
            Whether you are travelling for work or taking a
            break, we make it easy to choose a stay that feels
            like home.
          </Paragraph>

          <Paragraph
            className="!mt-4 !leading-7"
            style={{
              color: "#756C65",
            }}
          >
            From a warm welcome at reception to a relaxed final
            checkout, every detail is designed around your
            comfort.
          </Paragraph>

          <a href="#services">
            <Button
              type="primary"
              size="large"
              className="!mt-4"
              style={{
                height: 46,
                paddingInline: 24,
                borderRadius: 999,
                background: "#2E2A27",
                borderColor: "#2E2A27",
                fontWeight: 600,
              }}
            >
              Explore our services
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;