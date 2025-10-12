"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Row,
  Col,
  Image,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import Link from "next/link";
import {
  IconEye,
  IconEyeOff,
  IconLogin,
} from "@tabler/icons-react";

import { getAssetPath } from "../../../helper/assetPath";
import { useAuth } from "../../../contexts/AuthContext";
import { useMessage } from "../../../components/common/MessageProvider";
import { type LoginRequest } from "../../../services";

const SignIn = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const message = useMessage();

  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { username?: string; password?: string } = {};

    if (!formData.username.trim()) {
      errors.username = "Email/Username là bắt buộc";
    } else if (!formData.username.includes("@")) {
      errors.username = "Vui lòng nhập email hợp lệ";
    }

    if (!formData.password.trim()) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoginLoading(true);
      await login(formData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      message.error(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Fragment>
      <Row className="mb-8">
        <Col xl={{ span: 4, offset: 4 }} md={12}>
          <div className="text-center">
            <Link
              href="/"
              className="fs-2 fw-bold d-flex align-items-center gap-2 justify-content-center mb-6"
            >
              <Image src={getAssetPath("/images/brand/logo/logo-icon.svg")} alt="Phòng khám" />
              <span>Phòng Khám</span>
            </Link>
            <h1 className="mb-1">Chào mừng trở lại</h1>
            <p className="mb-0 text-muted">
              Đăng nhập để truy cập hệ thống quản lý phòng khám
            </p>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xl={5} lg={6} md={8}>
          <Card className="card-lg mb-6">
            <Card.Body className="p-6">
              <Form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                  <Form.Label htmlFor="username">
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    isInvalid={!!formErrors.username}
                    placeholder="Nhập email của bạn"
                  />
                  {formErrors.username && (
                    <div className="invalid-feedback d-block">
                      {formErrors.username}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <Form.Label htmlFor="password">
                    Mật khẩu <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      isInvalid={!!formErrors.password}
                      placeholder="Nhập mật khẩu"
                    />
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                      style={{ zIndex: 10 }}
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <IconEyeOff size={16} />
                      ) : (
                        <IconEye size={16} />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <div className="invalid-feedback d-block">
                      {formErrors.password}
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loginLoading}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {loginLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <IconLogin size={16} className="me-2" />
                        Đăng nhập
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center text-muted">
                <small>
                  Demo: Sử dụng email <strong>bacsi@gmail.com</strong> và mật khẩu <strong>123456</strong>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default SignIn;