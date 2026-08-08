import { Typography, Card } from "antd";
import DashboardLayout from "../components/DashboardLayout";

const { Title, Text } = Typography;

function ApprovalPage() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <Title level={3} className="!mb-1">
          Booking Approval
        </Title>
        <Text type="secondary">
          Review and approve pending room bookings.
        </Text>
        <Card className="mt-4">
          <div className="text-gray-500 text-center py-12">
            Booking Approval module is under active development.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ApprovalPage;
