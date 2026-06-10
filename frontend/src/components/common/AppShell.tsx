import {
  AuditOutlined,
  BookOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Space, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/enums';

const { Header, Content } = Layout;

export function AppShell() {
  const location = useLocation();
  const { currentUser, token, logout, loadProfile } = useAuth();

  useEffect(() => {
    if (token && !currentUser) {
      void loadProfile();
    }
  }, [currentUser, loadProfile, token]);

  const items = useMemo(
    () => [
      { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
      { key: '/recipe/create', icon: <PlusCircleOutlined />, label: <Link to="/recipe/create">创建</Link> },
      { key: '/my/recipes', icon: <BookOutlined />, label: <Link to="/my/recipes">我的菜谱</Link> },
      { key: '/collections', icon: <FolderOpenOutlined />, label: <Link to="/collections">收藏夹</Link> },
      ...(currentUser?.role === UserRole.Admin
        ? [{ key: '/admin/logs', icon: <AuditOutlined />, label: <Link to="/admin/logs">日志</Link> }]
        : []),
    ],
    [currentUser?.role],
  );

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Link to="/" className="brand-mark">
          <span className="brand-symbol">火</span>
          <span>菜谱共创工坊</span>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={items}
          className="app-menu"
        />
        <Space>
          {currentUser ? (
            <>
              <Typography.Text>{currentUser.username}</Typography.Text>
              <Button icon={<LogoutOutlined />} onClick={logout} />
            </>
          ) : (
            <Button type="primary">
              <Link to="/login">登录</Link>
            </Button>
          )}
        </Space>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
    </Layout>
  );
}
