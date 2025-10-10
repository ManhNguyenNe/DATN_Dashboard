"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import { paymentService, PaymentStatusResponse } from "../../services/api";
import { medicalRecordService, type SimpleMedicalRecordCreateData } from "../../services";

interface QRPaymentModalProps {
    show: boolean;
    onHide: () => void;
    qrCodeData: string;
    invoiceId: number;
    orderCode: number;
    onPaymentSuccess: () => void;
    onPaymentError: (error: string) => void;
    // Thêm dữ liệu cần thiết để tạo phiếu khám
    medicalRecordData?: {
        patientId: number;
        doctorId?: number | undefined;
        healthPlanId?: number | undefined;
        symptoms: string;
    };
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
    show,
    onHide,
    qrCodeData,
    invoiceId,
    orderCode,
    onPaymentSuccess,
    onPaymentError,
    medicalRecordData
}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed' | 'waiting'>('waiting');
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [countdown, setCountdown] = useState<number>(10);
    const [checkingStarted, setCheckingStarted] = useState<boolean>(false);

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCheckingRef = useRef<boolean>(false); // Flag để prevent duplicate calls
    const isCompletedRef = useRef<boolean>(false); // Flag để track khi đã hoàn thành (success hoặc failed)
    const isCreatingRecordRef = useRef<boolean>(false); // Flag để prevent duplicate medical record creation

    // Generate QR code khi component mount hoặc qrCodeData thay đổi
    useEffect(() => {
        if (qrCodeData && show) {
            generateQRCode(qrCodeData);
            startCountdown();
        }
    }, [qrCodeData, show]);

    // Cleanup intervals khi component unmount hoặc modal hide
    useEffect(() => {
        if (!show) {
            cleanup();
        }

        return () => {
            cleanup();
        };
    }, [show]);

    const cleanup = () => {
        console.log('🧹 Cleanup called - clearing all intervals and timeouts');

        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            console.log('✅ Cleared payment status polling interval');
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            console.log('✅ Cleared countdown interval');
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            console.log('✅ Cleared timeout');
        }

        // Reset checking flag khi cleanup
        isCheckingRef.current = false;
        console.log('✅ All intervals and timeouts cleared successfully');
    };

    const generateQRCode = async (data: string) => {
        try {
            // Dynamic import của QRCode để tránh lỗi SSR
            const QRCode = (await import('qrcode')).default;

            const url = await QRCode.toDataURL(data, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(url);
        } catch (error) {
            console.error('Error generating QR code:', error);
            onPaymentError("Lỗi khi tạo mã QR");
        }
    };

    const startCountdown = () => {
        setCountdown(10);
        setCheckingStarted(false);

        countdownIntervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                    }
                    startPaymentStatusChecking();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startPaymentStatusChecking = () => {
        setCheckingStarted(true);
        setPaymentStatus('checking');
        setStatusMessage("Đang kiểm tra trạng thái thanh toán...");

        console.log('🚀 Starting payment status polling for orderCode:', orderCode);

        // Bắt đầu polling mỗi 5 giây
        pollIntervalRef.current = setInterval(() => {
            // Double check với ref để đảm bảo không gọi khi đã completed
            if (!isCompletedRef.current) {
                console.log('⏰ Interval triggered - checking payment status...');
                checkPaymentStatus();
            } else {
                console.log('⚠️ Interval triggered but payment already completed - skipping');
            }
        }, 5000);

        // Gọi lần đầu ngay lập tức
        checkPaymentStatus();
    };

    const createMedicalRecord = async () => {
        // Prevent duplicate calls - QUAN TRỌNG!
        if (isCreatingRecordRef.current) {
            console.log('⚠️ Medical record creation already in progress - skipping duplicate call');
            return;
        }

        isCreatingRecordRef.current = true;
        console.log('🏥 Starting medical record creation...');

        try {
            if (!medicalRecordData) {
                throw new Error("Không có dữ liệu phiếu khám");
            }

            setStatusMessage("Đang tạo phiếu khám...");

            const medicalRecordRequest: SimpleMedicalRecordCreateData = {
                patientId: medicalRecordData.patientId,
                doctorId: medicalRecordData.doctorId || null,
                healthPlanId: medicalRecordData.healthPlanId || null,
                symptoms: medicalRecordData.symptoms,
                invoiceId: invoiceId
            };

            const response = await medicalRecordService.createSimpleMedicalRecord(medicalRecordRequest);

            console.log('Medical record API response:', response);

            // Kiểm tra response - API có thể trả về message "successfully" khi thành công
            if (response && (response.data || response.message?.toLowerCase().includes('success'))) {
                console.log('Medical record created successfully');

                // Lưu medical record ID vào localStorage
                const medicalRecordId = response.data;
                if (medicalRecordId) {
                    localStorage.setItem('currentMedicalRecordId', medicalRecordId.toString());
                    console.log('💾 Đã lưu medical record ID vào localStorage:', medicalRecordId);
                }

                setStatusMessage("Thanh toán và tạo phiếu khám thành công!");
                // Gọi callback success để update parent component
                onPaymentSuccess();
            } else {
                console.log('Medical record creation failed:', response);
                throw new Error(response?.message || "Không thể tạo phiếu khám");
            }
        } catch (error: any) {
            console.error('Error creating medical record:', error);

            // Kiểm tra xem có phải là lỗi thực sự không
            const errorMessage = error.response?.data?.message || error.message || "Lỗi khi tạo phiếu khám";

            // Nếu message có chứa "success" thì có thể đây không phải là lỗi thực sự
            if (errorMessage.toLowerCase().includes('success')) {
                console.log('API returned success message in error block, treating as success');

                // Thử lấy medical record ID từ error response
                const medicalRecordId = error.response?.data?.data;
                if (medicalRecordId) {
                    localStorage.setItem('currentMedicalRecordId', medicalRecordId.toString());
                    console.log('💾 Đã lưu medical record ID vào localStorage:', medicalRecordId);
                }

                setStatusMessage("Thanh toán và tạo phiếu khám thành công!");
                onPaymentSuccess();
            } else {
                setPaymentStatus('failed');
                setStatusMessage(`Thanh toán thành công nhưng lỗi tạo phiếu khám: ${errorMessage}`);
                onPaymentError(errorMessage);
            }
        }
    };

    const checkPaymentStatus = async () => {
        // Prevent duplicate calls và calls sau khi đã completed
        if (isCheckingRef.current || isCompletedRef.current) {
            console.log('⏭️ Skipping payment check - already checking or completed');
            return;
        }

        isCheckingRef.current = true;
        console.log('🔍 Checking payment status for orderCode:', orderCode);

        try {
            const response: PaymentStatusResponse = await paymentService.checkPaymentStatus(orderCode);

            // Check lại một lần nữa SAU KHI có response - tránh race condition
            if (isCompletedRef.current) {
                console.log('⚠️ Payment already completed during API call - aborting');
                return;
            }

            if (response.data === true) {
                // Thanh toán thành công - SET FLAG NGAY LẬP TỨC TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ
                console.log('✅ Payment successful! Setting completed flag and stopping all polling.');
                isCompletedRef.current = true;

                setPaymentStatus('success');
                setStatusMessage("Thanh toán thành công! Đang tạo phiếu khám...");

                // Dừng polling NGAY LẬP TỨC
                cleanup();

                // Tạo phiếu khám nếu có dữ liệu
                if (medicalRecordData) {
                    await createMedicalRecord();
                } else {
                    // Gọi callback success để update parent component
                    onPaymentSuccess();
                }
            } else {
                // Vẫn chưa thanh toán, tiếp tục chờ
                console.log('⏳ Payment still pending, continuing to poll...');
                setStatusMessage("Đang chờ thanh toán...");
            }
        } catch (error: any) {
            console.error('❌ Error checking payment status:', error);
            isCompletedRef.current = true; // Set completed flag
            setPaymentStatus('failed');
            setStatusMessage("Lỗi khi kiểm tra trạng thái thanh toán");
            cleanup();

            // Gọi callback error
            setTimeout(() => {
                onPaymentError("Lỗi khi kiểm tra trạng thái thanh toán");
            }, 2000);
        } finally {
            // CHỈ reset isCheckingRef nếu chưa completed
            // Nếu đã completed, giữ nguyên để tránh race condition
            if (!isCompletedRef.current) {
                isCheckingRef.current = false;
            }
        }
    };

    const handleClose = () => {
        console.log('🔒 User closing modal - cleaning up...');
        cleanup();

        // Nếu thanh toán thành công, gọi callback để reset form
        if (paymentStatus === 'success') {
            console.log('✅ User manually closing successful payment modal');
        }

        // Reset tất cả states và flags
        setPaymentStatus('waiting');
        setStatusMessage("");
        setCountdown(10);
        setCheckingStarted(false);
        setQrCodeUrl("");
        isCheckingRef.current = false;
        isCompletedRef.current = false;
        isCreatingRecordRef.current = false; // Reset medical record creation flag
        onHide();
    };

    const getStatusVariant = () => {
        switch (paymentStatus) {
            case 'success':
                return 'success';
            case 'failed':
                return 'danger';
            case 'checking':
                return 'info';
            default:
                return 'primary';
        }
    };

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'success':
                return <i className="bi bi-check-circle-fill me-2"></i>;
            case 'failed':
                return <i className="bi bi-x-circle-fill me-2"></i>;
            case 'checking':
                return <Spinner animation="border" size="sm" className="me-2" />;
            default:
                return <i className="bi bi-qr-code me-2"></i>;
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <i className="bi bi-qr-code me-2"></i>
                    Thanh toán bằng mã QR
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="text-center">
                {/* QR Code Display */}
                <div className="mb-4">
                    {qrCodeUrl ? (
                        <div>
                            <img
                                src={qrCodeUrl}
                                alt="QR Code for payment"
                                className="img-fluid mb-3"
                                style={{ maxWidth: '300px', border: '1px solid #dee2e6', borderRadius: '8px' }}
                            />
                            <p className="text-muted">
                                Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                            </p>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            <Spinner animation="border" />
                            <span className="ms-2">Đang tạo mã QR...</span>
                        </div>
                    )}
                </div>

                {/* Countdown Display */}
                {!checkingStarted && countdown > 0 && (
                    <Alert variant="warning" className="mb-3">
                        <i className="bi bi-clock me-2"></i>
                        Sẽ bắt đầu kiểm tra trạng thái thanh toán sau {countdown} giây
                    </Alert>
                )}

                {/* Status Display */}
                {(checkingStarted || paymentStatus === 'success' || paymentStatus === 'failed') && statusMessage && (
                    <Alert variant={getStatusVariant()} className="mb-3">
                        <div className="d-flex align-items-center justify-content-center">
                            {getStatusIcon()}
                            {statusMessage}
                        </div>
                    </Alert>
                )}

                {/* Instructions */}
                {paymentStatus === 'waiting' && (
                    <div className="mt-4">
                        <h6 className="text-primary mb-3">Hướng dẫn thanh toán:</h6>
                        <div className="text-start">
                            <ol className="ps-3">
                                <li className="mb-2">Mở ứng dụng ngân hàng trên điện thoại</li>
                                <li className="mb-2">Chọn chức năng "Quét mã QR" hoặc "Chuyển khoản QR"</li>
                                <li className="mb-2">Quét mã QR hiển thị trên màn hình</li>
                                <li className="mb-2">Xác nhận thông tin và thực hiện thanh toán</li>
                                <li>Chờ hệ thống xác nhận thanh toán thành công</li>
                            </ol>
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleClose}>
                    {paymentStatus === 'success' ? 'Đóng' : 'Hủy'}
                </Button>
                {paymentStatus === 'success' && (
                    <Button variant="success" onClick={handleClose}>
                        <i className="bi bi-check-lg me-2"></i>
                        Hoàn tất thanh toán
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default QRPaymentModal;