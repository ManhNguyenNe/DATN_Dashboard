"use client";

import React, { useEffect, useState } from "react";
import { Spinner, ProgressBar } from "react-bootstrap";

interface EnhancedLoadingProps {
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    text?: string;
    fullScreen?: boolean;
    className?: string;
    showProgress?: boolean;
    estimatedTime?: number; // in milliseconds
    tips?: string[];
    showTips?: boolean;
}

const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
    size = "md",
    variant = "primary",
    text = "Đang tải...",
    fullScreen = false,
    className = "",
    showProgress = false,
    estimatedTime = 3000,
    tips = [
        "Đang kết nối với máy chủ...",
        "Đang xử lý dữ liệu...",
        "Đang tải giao diện...",
        "Sắp hoàn thành..."
    ],
    showTips = false
}) => {
    const [progress, setProgress] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);

    const spinnerSize = size === "sm" ? "sm" : undefined;

    // Simulate progress if showProgress is enabled
    useEffect(() => {
        if (!showProgress) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const increment = Math.random() * 15 + 5; // Random increment between 5-20
                const newProgress = Math.min(prev + increment, 95); // Max 95% until actually complete
                return newProgress;
            });
        }, 200);

        // Complete progress after estimated time
        const timeout = setTimeout(() => {
            setProgress(100);
        }, estimatedTime);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [showProgress, estimatedTime]);

    // Rotate tips if showTips is enabled
    useEffect(() => {
        if (!showTips || tips.length === 0) return;

        const interval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % tips.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [showTips, tips]);

    const loadingContent = (
        <div className={`d-flex flex-column align-items-center justify-content-center gap-3 page-loading loading-spinner ${className}`}>
            {/* Main spinner */}
            <div className="position-relative">
                <Spinner
                    animation="border"
                    variant={variant}
                    size={spinnerSize}
                    style={{
                        width: size === "lg" ? "3rem" : size === "md" ? "2rem" : "1rem",
                        height: size === "lg" ? "3rem" : size === "md" ? "2rem" : "1rem",
                    }}
                />

                {/* Pulsing effect */}
                <div
                    className={`position-absolute top-50 start-50 translate-middle border border-${variant} rounded-circle`}
                    style={{
                        width: size === "lg" ? "4rem" : size === "md" ? "3rem" : "2rem",
                        height: size === "lg" ? "4rem" : size === "md" ? "3rem" : "2rem",
                        animation: "pulse 2s infinite",
                        opacity: 0.3
                    }}
                />
            </div>

            {/* Loading text */}
            {text && (
                <div className={`text-${variant} fw-medium`} style={{ fontSize: size === "lg" ? "1.1rem" : "1rem" }}>
                    {text}
                </div>
            )}

            {/* Progress bar */}
            {showProgress && (
                <div className="w-100" style={{ maxWidth: "300px" }}>
                    <ProgressBar
                        now={progress}
                        variant={variant}
                        animated
                        className="mb-2"
                        style={{ height: "6px" }}
                    />
                    <div className="text-center">
                        <small className="text-muted">{Math.round(progress)}%</small>
                    </div>
                </div>
            )}

            {/* Tips rotation */}
            {showTips && tips.length > 0 && (
                <div className="text-center" style={{ minHeight: "1.5rem" }}>
                    <small
                        className="text-muted fst-italic"
                        style={{
                            animation: "fadeInOut 2s infinite",
                            maxWidth: "250px"
                        }}
                    >
                        {tips[currentTip]}
                    </small>
                </div>
            )}

            {/* Loading dots animation */}
            <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div
                className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center loading-transition"
                style={{
                    zIndex: 9999,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(2px)'
                }}
            >
                {loadingContent}

                {/* Custom CSS for animations */}
                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% {
                            transform: translate(-50%, -50%) scale(1);
                            opacity: 0.3;
                        }
                        50% {
                            transform: translate(-50%, -50%) scale(1.1);
                            opacity: 0.1;
                        }
                    }
                    
                    @keyframes fadeInOut {
                        0%, 100% { opacity: 0.7; }
                        50% { opacity: 1; }
                    }
                    
                    .loading-dots {
                        display: flex;
                        gap: 4px;
                    }
                    
                    .loading-dots span {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background-color: var(--bs-${variant});
                        animation: loading-dots 1.5s infinite ease-in-out;
                    }
                    
                    .loading-dots span:nth-child(1) { animation-delay: 0s; }
                    .loading-dots span:nth-child(2) { animation-delay: 0.3s; }
                    .loading-dots span:nth-child(3) { animation-delay: 0.6s; }
                    
                    @keyframes loading-dots {
                        0%, 60%, 100% {
                            transform: scale(1);
                            opacity: 0.4;
                        }
                        30% {
                            transform: scale(1.3);
                            opacity: 1;
                        }
                    }
                    
                    .loading-transition {
                        animation: fadeIn 0.3s ease-in-out;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    return loadingContent;
};

export default EnhancedLoading;