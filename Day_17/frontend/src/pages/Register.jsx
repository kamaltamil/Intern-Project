import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { registerUser } from "../api/authApi";

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/dashboard/tasks" replace />;
  }

  const handleRegister = async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await registerUser(values.name, values.email, values.password);
      dispatch(login(response));
      navigate("/dashboard/tasks");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card title={<Title level={3}>Create Account</Title>} className="login-card">
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 20 }} />}
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter your name" }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Invalid email" }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter password" }, { min: 6, message: "Minimum 6 characters" }]}> 
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Sign Up</Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
