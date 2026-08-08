import { Typography, Card } from "antd";
import DashboardLayout from "../components/DashboardLayout";

const { Title, Text } = Typography;

function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <Title level={3} className="!mb-1">
          Reports
        </Title>
        <Text type="secondary">
          Analytics and reporting metrics.
        </Text>
        <Card className="mt-4">
          <div className="text-gray-500 text-center py-12">
            Reports module is under active development.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ReportsPage;
