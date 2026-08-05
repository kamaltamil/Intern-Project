import { Card, Typography, message } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signupUser } from '../api/queries';
import CustomForm from '../components/CustomForm';

const { Title, Text } = Typography;

function SignupPage() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      message.success('Account created successfully! Please log in.');
      navigate('/login');
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Unable to create account');
    },
  });

  const onFinish = (values) => {
    signupMutation.mutate({
      name: values.name,
      email: values.email,
      username: values.username,
      password: values.password,
    });
  };

  if (token) {
    return <Navigate to="/" replace />;
  }


  const signupForm = [
    {
      label: 'Full Name',
      name: 'name',
      rules: [{ required: true, message: 'Name is required' }],
      placeholder: 'Enter your full name',
    },
    {
      label: 'Email',
      name: 'email',
      rules: [
        { required: true, message: 'Email is required' },
        { type: 'email', message: 'Enter a valid email' },
      ],
      placeholder: 'Enter your email',
    },
    {
      label: 'Username',
      name: 'username',
      rules: [{ required: true, message: 'Username is required' }],
      placeholder: 'Choose a username',
    },
    {
      label: 'Password',
      name: 'password',
      rules: [
        { required: true, message: 'Password is required' },
        { min: 6, message: 'Password must be at least 6 characters' },
      ],
      placeholder: 'Create a password',
    }, 
    {
      type: 'submit',
      label: 'Sign Up',
      buttonProps: {
        type: 'primary',
        htmlType: 'submit',
        block: true,
        size: 'large',
        loading: signupMutation.isLoading,
        style: { backgroundColor: '#C76A34', borderColor: '#C76A34' },
      },
    }
  ]
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-[#ECE6DF]">
        <Title level={3} className="!text-[#2E2A27]">Create Account</Title>
        <Text className="text-[#A74E2B]">Join the HotelPro Admin Portal</Text>

        <CustomForm form={signupForm} onFinish={onFinish} />

        <div className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C76A34] font-medium">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default SignupPage;
