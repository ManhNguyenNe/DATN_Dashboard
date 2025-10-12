"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';
import { useMessage } from '../common/MessageProvider';
import { Save } from 'react-bootstrap-icons';
import { prescriptionService } from '../../services/prescriptionService';
import { PrescriptionDetailFormData, UpdatePrescriptionDetailRequest } from '../../types/PrescriptionTypes';

interface EditMedicineModalProps {
    show: boolean;
    onHide: () => void;
    prescriptionId: number;
    medicine: PrescriptionDetailFormData;
    onSuccess: () => void;
}

const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
    show,
    onHide,
    prescriptionId,
    medicine,
    onSuccess
}) => {
    const message = useMessage();
    const [usageInstructions, setUsageInstructions] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (show && medicine) {
            setUsageInstructions(medicine.usageInstructions);
            setQuantity(medicine.quantity);
        }
    }, [show, medicine]);

    const handleUpdateMedicine = async () => {
        if (!medicine?.medicineId || !medicine?.id) {
            message.error('Thông tin thuốc không hợp lệ');
            return;
        }

        if (quantity <= 0) {
            message.error('Số lượng phải lớn hơn 0');
            return;
        }

        try {
            setSaving(true);
            const data: UpdatePrescriptionDetailRequest = {
                id: medicine.id,
                prescriptionId,
                medicineId: medicine.medicineId,
                usageInstructions: usageInstructions.trim() || undefined,
                quantity
            };

            await prescriptionService.updatePrescriptionDetail(data);
            message.success('Cập nhật thuốc thành công');
            onSuccess();
            onHide();
        } catch (error) {
            console.error('Lỗi khi cập nhật thuốc:', error);
            message.error('Không thể cập nhật thuốc');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        onHide();
    };

    if (!medicine) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa thuốc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Thông tin thuốc hiện tại */}
                <div className="mb-3 p-3 bg-light rounded">
                    <strong>Thuốc:</strong> {medicine.medicine?.name}<br />
                    <strong>Nồng độ:</strong> {medicine.medicine?.concentration}<br />
                    <strong>Dạng bào chế:</strong> {medicine.medicine?.dosageForm}
                </div>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Hướng dẫn sử dụng <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Ví dụ: Uống 1 viên x 3 lần/ngày sau bữa ăn"
                            value={usageInstructions}
                            onChange={(e) => setUsageInstructions(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Số lượng <span className="text-danger">*</span></Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            />
                            <InputGroup.Text>{medicine.medicine?.unit}</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleUpdateMedicine}
                    disabled={saving}
                >
                    {saving ? 'Đang cập nhật...' : (
                        <>
                            <Save className="me-1" size={16} />
                            Cập nhật
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditMedicineModal;