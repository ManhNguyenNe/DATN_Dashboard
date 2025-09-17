"use client";
import React, { Fragment, useTransition, useState, useEffect } from "react";
import {
  Image,
  Accordion,
  ListGroup,
  Badge,
  Nav,
  NavItem,
  Button,
} from "react-bootstrap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuItemType } from "types/menuTypes";
import CustomToggle, { CustomToggleLevel2 } from "./SidebarMenuToggle";
import { Avatar } from "components/common/Avatar";
import { DashboardMenu } from "routes/DashboardRoute";
import { getAssetPath } from "helper/assetPath";

interface SidebarProps {
  hideLogo: boolean;
  containerId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ hideLogo = false, containerId }) => {
  const location = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  // Handle navigation with immediate UI feedback
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();

    // Normalize href for comparison
    const normalizedHref = href.startsWith('/') ? href : `/${href}`;
    const normalizedLocation = location.startsWith('/') ? location : `/${location}`;

    // If already on this page, do nothing
    if (normalizedLocation === normalizedHref) return;

    // Immediate optimistic update
    setOptimisticPath(normalizedHref);

    // Navigate with transition
    startTransition(() => {
      router.push(normalizedHref);
    });
  };

  // Reset optimistic state when location actually changes
  useEffect(() => {
    const normalizedLocation = location.startsWith('/') ? location : `/${location}`;
    const normalizedOptimistic = optimisticPath?.startsWith('/') ? optimisticPath : `/${optimisticPath}`;

    if (optimisticPath && normalizedLocation === normalizedOptimistic) {
      setOptimisticPath(null);
    }
  }, [location, optimisticPath]);

  // Get current active path (optimistic or actual)
  const getCurrentPath = () => {
    return optimisticPath || location;
  };

  // Helper function to check if path is active
  const isPathActive = (href: string) => {
    const currentPath = getCurrentPath();
    const normalizeHref = href.startsWith('/') ? href : `/${href}`;
    const normalizeCurrentPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
    return normalizeCurrentPath === normalizeHref;
  };

  const generateLink = (item: MenuItemType) => {
    const href = `${item.link}`;
    const isActive = isPathActive(href);

    return (
      <Link
        href={href}
        className={`nav-link ${isActive ? "active" : ""}`}
        onClick={(e) => handleNavigation(href, e)}
      >
        <span className="text">{item.name}</span>
        {item.badge && (
          <Badge
            className="ms-1"
            bg={item.badgecolor ? item.badgecolor : "primary"}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div id={containerId}>
      <div>
        {hideLogo || (
          <div className="brand-logo">
            <Link
              href="/"
              className="d-none d-md-flex align-items-center gap-2"
            >
              <Image src={getAssetPath("/images/brand/logo/logo-icon.svg")} alt="" />
              <span className="fw-bold fs-4 site-logo-text">Dasher</span>
            </Link>
          </div>
        )}
        <Accordion
          defaultActiveKey="0"
          as="ul"
          bsPrefix="navbar-nav flex-column"
        >
          {DashboardMenu.map(function (menu, index) {
            if (menu.grouptitle) {
              return (
                <Nav.Item key={index} as="li">
                  <div className="nav-heading">{menu.title}</div>
                  <hr className="mx-5 nav-line mb-1" />
                </Nav.Item>
              );
            } else {
              if (menu.children) {
                return (
                  <Fragment key={index}>
                    <CustomToggle eventKey={index.toString()} icon={menu.icon}>
                      {menu.title}
                    </CustomToggle>
                    <Accordion.Collapse eventKey={index.toString()}>
                      <ListGroup as="ul" className="dropdown-menu flex-column">
                        {menu.children.map(function (
                          menuLevel1Item,
                          menuLevel1Index
                        ) {
                          return (
                            <ListGroup.Item
                              as="li"
                              bsPrefix="nav-item"
                              key={menuLevel1Index}
                            >
                              <Link
                                href={`/${menuLevel1Item?.link}`}
                                className={`nav-link ${isPathActive(`/${menuLevel1Item.link}`) ? "active" : ""
                                  }`}
                                onClick={(e) => handleNavigation(`/${menuLevel1Item?.link}`, e)}
                              >
                                {menuLevel1Item.name}
                              </Link>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    </Accordion.Collapse>
                  </Fragment>
                );
              } else {
                return (
                  <Nav.Item as="li" key={index}>
                    <Link
                      href={menu.link ? `${menu.link}` : "#"}
                      className={`nav-link ${menu.link && isPathActive(menu.link) ? "active" : ""
                        }`}
                      onClick={menu.link ? (e) => handleNavigation(menu.link!, e) : undefined}
                    >
                      <span className="nav-icon">{menu.icon}</span>
                      <span className="text">{menu.title}</span>
                    </Link>
                  </Nav.Item>
                );
              }
            }
          })}
          <NavItem as="li" bsPrefix="">
            <div className="text-center py-5 upgrade-ui">
              <div>
                <Avatar
                  type="image"
                  src={getAssetPath("/images/avatar/avatar-1.jpg")}
                  size="md"
                  className="rounded-circle"
                />
                <div className="my-3">
                  <h5 className="mb-1 fs-6">Jitu Chauhan</h5>
                  <span className="text-secondary">Free Version - 1 Month</span>
                </div>
                <Button variant="primary" href="#!">
                  Upgrade
                </Button>
              </div>
            </div>
          </NavItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Sidebar;