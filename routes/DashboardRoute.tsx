//import node modules libraries
import { v4 as uuid } from "uuid";
import {
  IconFiles,
  IconShoppingBag,
  IconNews,
  IconFile,
  IconLock,
  IconStethoscope,
  IconCalendar,
  IconUsers,
  IconClipboardCheck,
  IconUserCheck,
  IconReportMedical,
  IconUser,
} from "@tabler/icons-react";

//import custom type
import { MenuItemType } from "types/menuTypes";
import { UserRole } from "../services";

// Menu dành cho Lễ tân
export const LeTanMenu: MenuItemType[] = [
  {
    id: uuid(),
    title: "Tổng quan",
    link: "/le-tan",
    icon: <IconFiles size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Đặt lịch khám",
    link: "/le-tan/dat-lich",
    icon: <IconCalendar size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Phiếu khám",
    link: "/le-tan/phieu-kham",
    icon: <IconStethoscope size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Quản lý bệnh nhân",
    link: "/le-tan/benh-nhan",
    icon: <IconUsers size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Thông tin cá nhân",
    link: "/le-tan/profile",
    icon: <IconUser size={20} strokeWidth={1.5} />,
  }
];

// Menu dành cho Bác sĩ
export const BacSiMenu: MenuItemType[] = [
  {
    id: uuid(),
    title: "Dashboard",
    link: "/bac-si",
    icon: <IconFiles size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Lịch làm việc",
    link: "/bac-si/lich-lam-viec",
    icon: <IconCalendar size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Khám bệnh",
    link: "/bac-si/kham-benh",
    icon: <IconClipboardCheck size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Chỉ định xét nghiệm",
    link: "/bac-si/chi-dinh-xet-nghiem",
    icon: <IconReportMedical size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Báo cáo khám",
    link: "/bac-si/bao-cao",
    icon: <IconReportMedical size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Thông tin cá nhân",
    link: "/bac-si/profile",
    icon: <IconUser size={20} strokeWidth={1.5} />,
  }
];

// Menu dành cho Admin
export const AdminMenu: MenuItemType[] = [
  {
    id: uuid(),
    title: "Dashboard",
    link: "/",
    icon: <IconFiles size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Quản lý người dùng",
    grouptitle: true,
  },
  {
    id: uuid(),
    title: "Đặt lịch khám",
    link: "/dat-lich",
    icon: <IconCalendar size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Phiếu khám",
    link: "/phieu-kham",
    icon: <IconStethoscope size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Quản lý bệnh nhân",
    link: "/benh-nhan",
    icon: <IconUsers size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Báo cáo & Thống kê",
    grouptitle: true,
  },
  {
    id: uuid(),
    title: "Ecommerce",
    link: "/ecommerce",
    icon: <IconShoppingBag size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Blog",
    link: "/blog",
    icon: <IconNews size={20} strokeWidth={1.5} />,
  }
];

// Function để lấy menu theo role
export const getMenuByRole = (role: UserRole): MenuItemType[] => {
  switch (role) {
    case UserRole.BAC_SI:
      return BacSiMenu;
    case UserRole.LE_TAN:
      return LeTanMenu;
    case UserRole.ADMIN:
      return AdminMenu;
    default:
      return LeTanMenu; // Default fallback
  }
};

// Backward compatibility - sử dụng LeTanMenu làm default
export const DashboardMenu: MenuItemType[] = LeTanMenu;
