import React from 'react'
import { Button } from 'antd';
import "./CustomButton.css";

const CustomButton = ({
        children, 
        variant='dafault', 
        size='middle',
        icon,
        loading=false, 
        disabled=false, 
        ...props
    }) => {

    return (
        <Button
            type={variant}
            size={size}
            icon={icon}
            loading={loading}
            disabled={disabled}
            {...props}
        >
            {children}
        </Button>
)}
 
export default CustomButton