import React from 'react'
import { Button, Flex, Form, Input, DatePicker, Row, Col } from 'antd'

const AddUser = ({ users, setUsers }) => {
  const [form] = Form.useForm()

  const handlesubmit = (values) => {
    const newUser = {
      id: Date.now(),
      firstname: values.firstname || '',
      lastname: values.lastname || '',
      email: values.email || '',
      mobile: values.mobile || '',
      location: values.location || '',
      dob: values.dateofbirth ? values.dateofbirth.format('DD-MM-YYYY') : ''
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    form.resetFields()
  }


    
  return (
    <Flex direction="row" justify='center' align='center'>
        <Form 
            form={form}
            name="form_item_path" 
            layout="vertical" 
            onFinish={handlesubmit}
            style={{ 
                width:"50%", 
                backgroundColor: "#F1F2EB", 
                padding: "16px", 
                borderRadius: "10px", 
                boxShadow: "0px 0px 2px 3px rgba(0,0,0,0.1)" 
            }}>
            <Row gutter={16} style={{width: "100%"}}>
                <Col span={12}>
                    <Form.Item 
                        label="First Name"
                        name="firstname"
                        rules={[
                            {
                                required: true,
                                message: "Enter your first name"
                            },
                            {
                                pattern: /^[A-Za-z]+$/,
                                message: "Name should only contain text"
                            }
                        ]}
                    >
                        <Input style={{ color: "balck" }} placeholder='Enter first name' />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item 
                        label="Last Name"
                        name="lastname"
                        rules={[
                            {
                                pattern: /^[A-Za-z]+$/,
                                message: "Name should only contain text"
                            }
                        ]}
                    >
                        <Input style={{ color: "black" }} placeholder='Enter last name' />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item 
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Enter the valid email"
                            }
                        ]}
                    >
                        <Input type={'email'} placeholder="Enter your e-mail" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item 
                        label="Date-Of-Birth"
                        name="dateofbirth"
                    >
                        <DatePicker 
                            style={{width: "100%"}}
                        ></DatePicker>
                    </Form.Item>
                </Col>
                <Col span={12} style={{width: "100%"}}>
                    <Form.Item 
                        label="Mobile"
                        name="mobile"
                        rules={[
                            {
                                required: true,
                                message: "Enter the mobile number"
                            },
                            {
                                pattern: /[0-9]{10}/,
                                message: "Enter valid mobile number"
                            }
                        ]}
                    >
                        <Input type={'number'} placeholder="Enter your mobile" />
                    </Form.Item>
                </Col>
                <Col span={12} style={{width: "100%"}}>
                    <Form.Item 
                        label="Location"
                        name="location"
                    >
                        <Input placeholder="Enter your location" />
                    </Form.Item>
                </Col>
            </Row>
            <Flex justify='center' align='center'> 
                <Button color="cyan" variant="solid" htmlType="submit">
                    Add
                </Button>
            </Flex>
        </Form>
    </Flex>
  );
};

export default AddUser