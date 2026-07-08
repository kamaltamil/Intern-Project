import React from 'react';
import { Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../Components/CustomButton/CustomButton';

const NotFound = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('sessionToken');

  const handleGoHome = () => {
    // If logged in, send them back to the workspace. If not, send them to login.
    if (token) {
      navigate('/dashboard/tasks');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh', 
      width: '100%' 
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <CustomButton variant="primary" size="large" onClick={handleGoHome}>
            Back to Safe Zone
          </CustomButton>
        }
      />
    </div>
  );
};

export default NotFound;
