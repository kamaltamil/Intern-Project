import {
  CarOutlined,
  CoffeeOutlined,
  CustomerServiceOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

const services = [
  [
    CustomerServiceOutlined,
    "24/7 Reception",
    "Friendly support whenever you need it.",
  ],
  [
    HomeOutlined,
    "Room Service",
    "Enjoy comfort without leaving your room.",
  ],
  [
    WifiOutlined,
    "Free WiFi",
    "Stay connected throughout your visit.",
  ],
  [
    CoffeeOutlined,
    "Breakfast",
    "Start your morning with a fresh meal.",
  ],
  [
    SafetyCertificateOutlined,
    "Housekeeping",
    "Clean, comfortable spaces every day.",
  ],
  [
    CarOutlined,
    "Parking",
    "Convenient parking for a stress-free stay.",
  ],
];

function ServicesSection() {
  return (
    <section
      id="services"
      className="bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <Text
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{
              color: "#C76A34",
            }}
          >
            Our services
          </Text>

          <Title
            level={2}
            className="!mt-3 !text-3xl !font-semibold sm:!text-4xl"
          >
            Everything you need for a relaxing stay.
          </Title>

          <Paragraph
            className="!mt-4 !leading-7"
            style={{
              color: "#756C65",
            }}
          >
            Thoughtful facilities and simple service make
            every HotelPro visit more comfortable.
          </Paragraph>
        </div>

        {/* Services */}
        <Row
          gutter={[
            16,
            16,
          ]}
          className="mt-12"
        >
          {services.map(([Icon, title, text]) => (
            <Col
              key={title}
              xs={24}
              sm={12}
              lg={8}
            >
              <Card
                bordered
                hoverable
                className="h-full rounded-3xl"
                styles={{
                  body: {
                    padding: 28,
                  },
                }}
                style={{
                  borderColor: "#ECE6DF",
                  background: "#FCFAF7",
                  borderRadius: 24,
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2E2D5] text-xl text-[#C76A34]">
                  <Icon />
                </div>

                <Title
                  level={4}
                  className="!mt-5 !mb-0 !text-lg"
                >
                  {title}
                </Title>

                <Paragraph
                  className="!mt-2 !mb-0 !text-sm !leading-6"
                  style={{
                    color: "#756C65",
                  }}
                >
                  {text}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}

export default ServicesSection;