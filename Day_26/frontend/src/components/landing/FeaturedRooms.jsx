import {
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Row,
  Tag,
  Typography,
} from "antd";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const rooms = [
  {
    type: "Single",
    title: "Comfort Single",
    price: 50,
    image: "/landing/Comfort_Single.jpg",
    text: "A calm and practical room for solo stays.",
  },
  {
    type: "Double",
    title: "Classic Double",
    price: 80,
    image: "/landing/Classic_Double.jpg",
    text: "A spacious room designed for two guests.",
  },
  {
    type: "Suite",
    title: "Signature Suite",
    price: 120,
    image: "/landing/Signature_Suite.jpg",
    text: "Extra space and comfort for a special stay.",
  },
];

function FeaturedRooms() {
  return (
    <section
      id="rooms"
      className="mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8"
    >
      {/* Heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Text
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{
              color: "#C76A34",
            }}
          >
            Our rooms
          </Text>

          <Title
            level={2}
            className="!mt-3 !mb-0 !text-3xl !font-semibold sm:!text-4xl"
          >
            Choose your perfect room.
          </Title>

          <Paragraph
            className="!mt-3 !mb-0 !max-w-xl !leading-7"
            style={{
              color: "#756C65",
            }}
          >
            Comfortable spaces for short visits, family trips,
            and longer stays.
          </Paragraph>
        </div>

        <Link to="/login">
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            style={{
              color: "#C76A34",
              fontWeight: 600,
              padding: 0,
            }}
          >
            View booking options
          </Button>
        </Link>
      </div>

      {/* Room Cards */}
      <Row
        gutter={[
          24,
          24,
        ]}
        className="mt-10"
      >
        {rooms.map((room) => (
          <Col
            key={room.type}
            xs={24}
            md={12}
            lg={8}
          >
            <Card
              hoverable
              className="h-full overflow-hidden rounded-3xl"
              cover={
                <img
                  src={room.image}
                  alt={room.title}
                  className="h-60 w-full object-cover"
                />
              }
              styles={{
                body: {
                  padding: 24,
                },
              }}
              style={{
                borderColor: "#ECE6DF",
                borderRadius: 24,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Tag
                    bordered={false}
                    style={{
                      margin: 0,
                      paddingInline: 0,
                      background: "transparent",
                      color: "#C76A34",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {room.type} room
                  </Tag>

                  <Title
                    level={3}
                    className="!mt-1 !mb-0 !text-xl !font-semibold"
                  >
                    {room.title}
                  </Title>
                </div>

                <div className="text-right">
                  <Text className="text-xl font-bold">
                    ${room.price}
                  </Text>

                  <Text
                    className="block text-xs"
                    style={{
                      color: "#8B8179",
                    }}
                  >
                    / day
                  </Text>
                </div>
              </div>

              <Paragraph
                className="!mt-4 !mb-0 !text-sm !leading-6"
                style={{
                  color: "#756C65",
                }}
              >
                {room.text}
              </Paragraph>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#756C65]">
                <span>
                  <CheckOutlined className="mr-1 text-[#C76A34]" />
                  WiFi
                </span>

                <span>
                  <CheckOutlined className="mr-1 text-[#C76A34]" />
                  Daily service
                </span>

                <span>
                  <CheckOutlined className="mr-1 text-[#C76A34]" />
                  Comfort bed
                </span>
              </div>

              <Link to="/login">
                <Button
                  block
                  size="large"
                  className="!mt-6"
                  style={{
                    height: 44,
                    borderRadius: 999,
                    borderColor: "#C76A34",
                    color: "#C76A34",
                    fontWeight: 600,
                  }}
                >
                  Book this room
                </Button>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}

export default FeaturedRooms;
