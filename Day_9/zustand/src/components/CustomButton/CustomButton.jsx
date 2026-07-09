import React from 'react';
import { Button } from 'antd';
import './CustomButton.css';

const CustomButton = ({
  children,
  color = 'default',
  variant = 'default',
  size = 'middle',
  icon,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
    
  const customClass = variant === 'accent' ? 'accent-btn' : variant === 'secondary' ? 'secondary-btn' : '';

  return (
    <Button
      color={color}
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      className={`${customClass} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;