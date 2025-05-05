"use client";

import { Layout, Menu } from 'antd';
import { TeamOutlined, UserOutlined, CheckCircleOutlined, FormOutlined, ToolOutlined, NotificationFilled } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

const { Sider } = Layout;

export default function Sidebar() {
  const currentPath = usePathname();
  const { user, clearUserFromLocalStorage } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const isPublicPage = currentPath.startsWith('/public');
  const isLoginPage = currentPath.startsWith('/login');
  const hiddenSidebar = isPublicPage || isLoginPage;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [window.innerWidth]);

  const logout = () => {
    clearUserFromLocalStorage();
    router.push("/login");
  }

  const items = [
    { key: 'parceiros', label: 'Parceiros', icon: <TeamOutlined /> },
    { key: 'servicos', label: 'Serviços', icon: <ToolOutlined /> },
    { key: 'formularios', label: 'Formulários', icon: <FormOutlined /> },
    { key: 'colaboradores', label: 'Colaboradores', icon: <UserOutlined /> },
    { key: 'checkins', label: 'Checkins', icon: <CheckCircleOutlined /> },
    { key: 'notifications', label: 'Notificações', icon: <NotificationFilled /> },
  ];
  const [size, setSize] = useState(80);

  const handleResize = () => {
    if(size === 80){
      setSize(200)
    } else {
      setSize(80)
    }
  }

  return (
    !hiddenSidebar && user && (
      <>
      <div className='relative'>
        <div style={{ width: `${isMobile ? 80 : 250}px` }}></div>

        <div className='border-r-2 border-gray-200 bg-gray-700 text-gray-500 fixed z-10 h-full'>
          <Sider width={isMobile ? size : 250} style={{ backgroundColor: "#364153", border: 0, borderWidth: 0, margin: 0 }}>
            <Profile
              isMobile={isMobile}
              handleResize={handleResize}
              size={size}
              user={user}
              logout={logout}
            />

            <div className='h-12' />

              {user.role.name.toLowerCase() === "admin" && 
              <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              style={{ height: '100%', borderRight: 0, backgroundColor: "#364153" }}
              >
              {items.map(item => (
                <Menu.Item
                  key={item.key}
                  icon={item.icon}
                  style={{ color: "#e5e7eb" }}
                  className="menu-item"
                >
                  <Link href={`/${item.key}`}>{!isMobile && item.label}</Link>
                </Menu.Item>
              ))}
              </Menu>}

              <style jsx global>
                {`
                  .ant-menu-item-selected {
                    background-color: #1e2939 !important;
                  }
                `}
              </style>

          </Sider>
        </div>
      </div>
      </>
    )
  );
};

function Profile({ isMobile, handleResize, size, user, logout }: { isMobile: boolean, handleResize: any, size: number, user: any, logout: () => void }) {
  return (
    <div className="bg-gray-700 flex flex-col p-4 gap-4 text-white">
      <div className={`flex items-center gap-2 ${isMobile && "flex-col"}`}>
        <Avatar size={isMobile ? 40 : 50} icon={<UserOutlined />} onClick={() => handleResize()} />
        {
        (!isMobile || size > 80) && (
          <div>
            <span className={`font-semibold ${isMobile && "text-xs"}`}>{user.name ?? "CONTATE O ADM"}</span>
          </div>
        )}
      </div>
      <Button type="primary" style={{ fontWeight: "600" }} onClick={logout}>
        Sair
      </Button>
    </div>
  );
}
