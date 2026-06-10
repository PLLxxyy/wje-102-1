import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LoginFormValues {
  account: string;
  password: string;
}

export function Login() {
  const { login } = useAuth();

  const onFinish = async (values: LoginFormValues) => {
    try {
      await login(values);
    } catch {
      message.error('登录失败，请检查账号和密码');
    }
  };

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <Typography.Title level={2}>进入共创工坊</Typography.Title>
        <Typography.Paragraph type="secondary">
          使用预置账号 `chef_wang / 123456` 或自己的账号继续编辑菜谱。
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="account" label="用户名或邮箱" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
        <Typography.Paragraph className="auth-switch">
          还没有账号？<Link to="/register">注册</Link>
        </Typography.Paragraph>
      </Card>
    </main>
  );
}
