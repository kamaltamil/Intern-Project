import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * UnauthorizedPage
 *
 * Shown when a user is authenticated but lacks permission
 * to access a specific route (403 scenario).
 */
function UnauthorizedPage() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE]">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you do not have permission to access this page."
        extra={
          token ? (
            <Button
              type="primary"
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "#C76A34",
                borderColor: "#C76A34",
              }}
            >
              Back to Dashboard
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#C76A34",
                borderColor: "#C76A34",
              }}
            >
              Go to Login
            </Button>
          )
        }
      />
    </div>
  );
}

export default UnauthorizedPage;
