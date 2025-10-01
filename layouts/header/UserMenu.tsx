"use client";

//import node modules libraries
import React from "react";
import { Dropdown, Image, Badge } from "react-bootstrap";
import Link from "next/link";
import { IconLogin2, IconUser, IconSettings } from "@tabler/icons-react";

//import custom components
import { Avatar } from "components/common/Avatar";
import { getAssetPath } from "helper/assetPath";
import { useAuth } from "contexts/AuthContext";

interface UserToggleProps {
  children?: React.ReactNode;
  onClick?: () => void;
}
const CustomToggle = React.forwardRef<HTMLAnchorElement, UserToggleProps>(
  ({ children, onClick }, ref) => (
    <Link ref={ref} href="#" onClick={onClick}>
      {children}
    </Link>
  )
);

const UserMenu = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BAC_SI':
        return 'Bác sĩ';
      case 'LE_TAN':
        return 'Lễ tân';
      case 'ADMIN':
        return 'Quản trị viên';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'BAC_SI':
        return 'primary';
      case 'LE_TAN':
        return 'info';
      case 'ADMIN':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle}>
        <Avatar
          type="image"
          src={getAssetPath("/images/avatar/avatar-1.jpg")}
          size="sm"
          alt="User Avatar"
          className="rounded-circle"
        />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="p-0 dropdown-menu-md">
        <div className="d-flex gap-3 align-items-center border-dashed border-bottom px-4 py-4">
          <Image
            src={getAssetPath("/images/avatar/avatar-1.jpg")}
            alt=""
            className="avatar avatar-md rounded-circle"
          />
          <div className="flex-grow-1">
            <h4 className="mb-1 fs-5">{user?.name || user?.email || 'Người dùng'}</h4>
            <p className="mb-1 text-muted small">{user?.email}</p>
            {user?.role && (
              <Badge bg={getRoleBadgeVariant(user.role)} className="small">
                {getRoleDisplayName(user.role)}
              </Badge>
            )}
          </div>
        </div>
        <div className="p-3 d-flex flex-column gap-1">
          <Dropdown.Item
            as={Link}
            href={user?.role === 'BAC_SI' ? '/bac-si/profile' : '/le-tan/profile'}
            className="d-flex align-items-center gap-2"
          >
            <IconUser size={16} />
            <span>Thông tin cá nhân</span>
          </Dropdown.Item>
          <Dropdown.Item className="d-flex align-items-center gap-2">
            <IconSettings size={16} />
            <span>Cài đặt</span>
          </Dropdown.Item>
        </div>
        <div className="border-dashed border-top pt-3 px-4 pb-4">
          <button
            onClick={handleLogout}
            className="btn btn-link text-danger d-flex align-items-center gap-2 p-0 border-0 bg-transparent"
          >
            <IconLogin2 size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu;
