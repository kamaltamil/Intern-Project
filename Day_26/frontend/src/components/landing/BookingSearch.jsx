import {
  CalendarOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";

function BookingSearch() {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate("/login");
  };

  return (
    <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 sm:-mt-20 lg:px-8">
      <div className="rounded-3xl bg-white p-4 shadow-[0_20px_60px_rgba(46,42,39,0.14)] sm:p-5">
        <Form
          layout="vertical"
          onFinish={handleSearch}
          requiredMark={false}
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:items-end">
            {/* Check-in */}
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B8179]">
                  <CalendarOutlined />
                  Check-in
                </span>
              }
              className="!mb-0"
            >
              <DatePicker
                bordered={false}
                className="w-full p-0"
                placeholder="Select date"
              />
            </Form.Item>

            {/* Check-out */}
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B8179]">
                  <CalendarOutlined />
                  Check-out
                </span>
              }
              className="!mb-0"
            >
              <DatePicker
                bordered={false}
                className="w-full p-0"
                placeholder="Select date"
              />
            </Form.Item>

            {/* Guests */}
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B8179]">
                  <UserOutlined />
                  Guests
                </span>
              }
              className="!mb-0"
            >
              <Select
                bordered={false}
                className="w-full p-0"
                defaultValue="2 Guests"
                options={[
                  {
                    value: "1 Guest",
                    label: "1 Guest",
                  },
                  {
                    value: "2 Guests",
                    label: "2 Guests",
                  },
                  {
                    value: "3 Guests",
                    label: "3 Guests",
                  },
                  {
                    value: "4+ Guests",
                    label: "4+ Guests",
                  },
                ]}
              />
            </Form.Item>

            {/* Search */}
            <Form.Item className="!mb-0">
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                block
                style={{
                  minHeight: 58,
                  borderRadius: 16,
                  background: "#C76A34",
                  borderColor: "#C76A34",
                  fontWeight: 600,
                }}
              >
                Search Rooms
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </section>
  );
}

export default BookingSearch;