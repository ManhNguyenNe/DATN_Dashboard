"use client";
import React from "react";
import { Spinner } from "react-bootstrap";

interface LoadingProps {
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const Loading: React.FC<LoadingProps> = ({
    size = "md",
    variant = "primary",
    text = "Loading...",
    fullScreen = false,
    className = "",
}) => {
    const spinnerSize = size === "sm" ? "sm" : undefined;

    const loadingContent = (
        <div className={`d-flex flex-column align-items-center justify-content-center gap-3 page-loading loading-spinner ${className}`}>
            <Spinner
                animation="border"
                variant={variant}
                size={spinnerSize}
                style={{
                    width: size === "lg" ? "3rem" : size === "md" ? "2rem" : "1rem",
                    height: size === "lg" ? "3rem" : size === "md" ? "2rem" : "1rem",
                }}
            />
            {text && (
                <div className={`text-${variant} fw-medium`} style={{ fontSize: size === "lg" ? "1.1rem" : "1rem" }}>
                    {text}
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div
                className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 loading-transition"
                style={{ zIndex: 9999 }}
            >
                {loadingContent}
            </div>
        );
    }

    return (
        <div className="py-5">
            {loadingContent}
        </div>
    );
};

export default Loading;