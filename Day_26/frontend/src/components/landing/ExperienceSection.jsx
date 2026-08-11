import { Col, Row, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

function ExperienceSection() {
  return (
    <section className="relative overflow-hidden bg-[#211C19] py-20 text-white sm:py-24">
      <img
        src="/landing/experience_section.jpg"
        alt="Hotel experience"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />

      <div className="absolute inset-0 bg-[#211C19]/65" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <Text
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{
              color: "#E4B07A",
            }}
          >
            The HotelPro experience
          </Text>

          <Title
            level={2}
            className="!mt-4 !text-3xl !font-semibold !leading-tight !text-white sm:!text-5xl"
          >
            Slow down. Settle in. Enjoy the stay.
          </Title>

          <Paragraph
            className="!mt-5 !max-w-xl !leading-7"
            style={{
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Relax in thoughtfully prepared rooms, enjoy easy
            dining options, and let our team take care of the
            details while you focus on the moments that matter.
          </Paragraph>

          <Row
            gutter={[
              20,
              20,
            ]}
            className="mt-8 max-w-xl"
          >
            <Col xs={12} sm={6}>
              <Text className="block text-2xl font-semibold text-white">
                140+
              </Text>

              <Text className="mt-1 block text-xs text-white/60">
                Guests
              </Text>
            </Col>

            <Col xs={12} sm={6}>
              <Text className="block text-2xl font-semibold text-white">
                24/7
              </Text>

              <Text className="mt-1 block text-xs text-white/60">
                Support
              </Text>
            </Col>

            <Col xs={12} sm={6}>
              <Text className="block text-2xl font-semibold text-white">
                3
              </Text>

              <Text className="mt-1 block text-xs text-white/60">
                Room types
              </Text>
            </Col>

            <Col xs={12} sm={6}>
              <Text className="block text-2xl font-semibold text-white">
                4.9
              </Text>

              <Text className="mt-1 block text-xs text-white/60">
                Guest rating
              </Text>
            </Col>
          </Row>
        </div>
      </div>
    </section>
  );
}

export default ExperienceSection;