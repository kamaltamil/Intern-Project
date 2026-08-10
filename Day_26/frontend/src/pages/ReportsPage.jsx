import { Typography, Card } from "antd";
import DashboardLayout from "../components/DashboardLayout";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

function ReportsPage() {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <Title level={3} className="!mb-1" style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}>
          Reports
        </Title>
        <Text className="text-gray-400 text-sm">
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
