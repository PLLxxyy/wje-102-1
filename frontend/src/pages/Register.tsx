import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export function Register() {
  const { register } = useAuth();

  const onFinish = async (values: RegisterFormValues) => {
    try {
      await register(values);
    } catch {
      message.error('注册失败，用户名或邮箱可能已被使用');
    }
  };

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <Typography.Title level={2}>创建工坊账号</Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, min: 3, max: 50 }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="bio" label="简介">
            <Input.TextArea rows={3} maxLength={300} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            注册并进入
          </Button>
        </Form>
        <Typography.Paragraph className="auth-switch">
          已有账号？<Link to="/login">登录</Link>
        </Typography.Paragraph>
      </Card>
    </main>
  );
}
