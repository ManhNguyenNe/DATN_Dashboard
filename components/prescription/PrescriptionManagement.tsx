"use client";
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { Plus, Pencil, Trash, Receipt, Check, X } from 'react-bootstrap-icons';
import { prescriptionService } from '../../services/prescriptionService';
import {
    PrescriptionResponse,
    CreatePrescriptionRequest,
    UpdatePrescriptionRequest,
    PrescriptionDetailFormData
} from '../../types/PrescriptionTypes';
import { useMessage } from '../common/MessageProvider';
import dynamic from 'next/dynamic';

// Dynamic import để tránh lỗi SSR và import issues
const AddMedicineModal = dynamic(() => import('./AddMedicineModal'), { ssr: false });
const EditMedicineModal = dynamic(() => import('./EditMedicineModal'), { ssr: false });

interface PrescriptionManagementProps {
    medicalRecordId: number;
    readonly?: boolean;
}

const PrescriptionManagement: React.FC<PrescriptionManagementProps> = ({
    medicalRecordId,
    readonly = false
}) => {
    const message = useMessage();
    const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
    const [showEditMedicineModal, setShowEditMedicineModal] = useState(false);

    // Form states
    const [generalInstructions, setGeneralInstructions] = useState('');
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
    const [editingMedicine, setEditingMedicine] = useState<PrescriptionDetailFormData | null>(null);

    // States for inline editing
    const [editingInstructionsId, setEditingInstructionsId] = useState<number | null>(null);
    const [editingInstructionsValue, setEditingInstructionsValue] = useState('');

    useEffect(() => {
        loadPrescriptions();
    }, [medicalRecordId]);

    const loadPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await prescriptionService.getPrescriptionsByMedicalRecordId(medicalRecordId);

            // API trả về một đơn thuốc duy nhất
            const prescriptionData: PrescriptionResponse[] = response.data ? [response.data] : [];

            setPrescriptions(prescriptionData);
        } catch (error) {
            console.error('Lỗi khi tải đơn thuốc:', error);
            message.error('Không thể tải danh sách đơn thuốc');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePrescription = async () => {
        try {
            setSaving(true);
            const data: CreatePrescriptionRequest = {
                medicalRecordId,
                generalInstructions: generalInstructions.trim() || undefined
            };

            await prescriptionService.createPrescription(data);
            message.success('Tạo đơn thuốc thành công');
            setShowCreateModal(false);
            setGeneralInstructions('');
            await loadPrescriptions();
        } catch (error) {
            console.error('Lỗi khi tạo đơn thuốc:', error);
            message.error('Không thể tạo đơn thuốc');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePrescription = async (prescriptionId: number, newInstructions: string) => {
        try {
            setSaving(true);
            const data: UpdatePrescriptionRequest = {
                id: prescriptionId,
                medicalRecordId,
                generalInstructions: newInstructions.trim() || undefined
            };

            await prescriptionService.updatePrescription(data);
            message.success('Cập nhật đơn thuốc thành công');
            await loadPrescriptions();
        } catch (error) {
            console.error('Lỗi khi cập nhật đơn thuốc:', error);
            message.error('Không thể cập nhật đơn thuốc');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMedicine = async (detailId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thuốc này khỏi đơn?')) {
            return;
        }

        try {
            setSaving(true);
            await prescriptionService.deletePrescriptionDetail(detailId);
            message.success('Xóa thuốc khỏi đơn thành công');
            await loadPrescriptions();
        } catch (error) {
            console.error('Lỗi khi xóa thuốc:', error);
            message.error('Không thể xóa thuốc khỏi đơn');
        } finally {
            setSaving(false);
        }
    };

    const handleAddMedicine = (prescriptionId: number) => {
        setSelectedPrescriptionId(prescriptionId);
        setShowAddMedicineModal(true);
    };

    const handleEditMedicine = (detail: any, prescriptionId: number) => {
        setSelectedPrescriptionId(prescriptionId);
        setEditingMedicine({
            id: detail.id, // ID của prescription detail
            medicineId: detail.medicineResponse.id,
            usageInstructions: detail.usageInstructions || '',
            quantity: detail.quantity,
            medicine: detail.medicineResponse
        });
        setShowEditMedicineModal(true);
    };

    const onMedicineAdded = () => {
        loadPrescriptions();
        setShowAddMedicineModal(false);
        setSelectedPrescriptionId(null);
    };

    const onMedicineUpdated = () => {
        loadPrescriptions();
        setShowEditMedicineModal(false);
        setSelectedPrescriptionId(null);
        setEditingMedicine(null);
    };

    const handleStartEditInstructions = (prescriptionId: number, currentInstructions: string) => {
        setEditingInstructionsId(prescriptionId);
        setEditingInstructionsValue(currentInstructions || '');
    };

    const handleSaveInstructions = async (prescriptionId: number) => {
        try {
            setSaving(true);
            await handleUpdatePrescription(prescriptionId, editingInstructionsValue);
            setEditingInstructionsId(null);
            setEditingInstructionsValue('');
        } catch (error) {
            // Error already handled in handleUpdatePrescription
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEditInstructions = () => {
        setEditingInstructionsId(null);
        setEditingInstructionsValue('');
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải đơn thuốc...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                    <Receipt className="me-2" />
                    Đơn thuốc
                    <Badge bg="primary" className="ms-2">
                        {prescriptions.length} đơn
                    </Badge>
                </h6>
                {/* {!readonly && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        disabled={saving}
                    >
                        <Plus className="me-1" size={16} />
                        Tạo đơn thuốc mới
                    </Button>
                )} */}
            </div>

            {prescriptions.length > 0 ? (
                <div className="prescription-list">
                    {prescriptions.map((prescription, index) => (
                        <Card key={prescription.id} className="mb-3">
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Đơn thuốc #{index + 1}</strong>
                                        <Badge bg="secondary" className="ms-2">{prescription.code}</Badge>
                                    </div>
                                    <div className="text-muted small">
                                        <div>Bác sĩ: {prescription.doctorCreated}</div>
                                        <div>Ngày kê: {new Date(prescription.prescriptionDate).toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {/* Hướng dẫn chung */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <strong>Hướng dẫn chung:</strong>
                                        {!readonly && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => handleStartEditInstructions(prescription.id, prescription.generalInstructions || '')}
                                                disabled={saving || editingInstructionsId === prescription.id}
                                                title={prescription.generalInstructions?.trim() ? "Chỉnh sửa hướng dẫn chung" : "Thêm hướng dẫn chung"}
                                            >
                                                {prescription.generalInstructions?.trim() ? (
                                                    <Pencil size={14} />
                                                ) : (
                                                    <Plus size={14} />
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    {editingInstructionsId === prescription.id ? (
                                        <div className="mt-1">
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={editingInstructionsValue}
                                                onChange={(e) => setEditingInstructionsValue(e.target.value)}
                                                placeholder="Nhập hướng dẫn chung cho đơn thuốc (ví dụ: Uống thuốc sau bữa ăn, tránh đồ cay nóng...)"
                                                disabled={saving}
                                                autoFocus
                                            />
                                            <div className="d-flex gap-2 mt-2">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleSaveInstructions(prescription.id)}
                                                    disabled={saving}
                                                >
                                                    <Check size={14} className="me-1" />
                                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={handleCancelEditInstructions}
                                                    disabled={saving}
                                                >
                                                    <X size={14} className="me-1" />
                                                    Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-1 p-2 bg-light rounded">
                                            {prescription.generalInstructions?.trim() ? (
                                                <span>{prescription.generalInstructions}</span>
                                            ) : (
                                                <span className="text-muted fst-italic">
                                                    Chưa có hướng dẫn chung
                                                    {!readonly && (
                                                        <span> - Click nút + để thêm</span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Danh sách thuốc */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <strong>Chi tiết thuốc:</strong>
                                    {!readonly && (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleAddMedicine(prescription.id)}
                                            disabled={saving}
                                        >
                                            <Plus className="me-1" size={14} />
                                            Thêm thuốc
                                        </Button>
                                    )}
                                </div>

                                {prescription.detailResponses && prescription.detailResponses.length > 0 ? (
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>STT</th>
                                                <th>Tên thuốc</th>
                                                <th style={{ width: '120px' }}>Nồng độ</th>
                                                <th style={{ width: '120px' }}>Dạng bào chế</th>
                                                <th style={{ width: '100px' }}>Số lượng</th>
                                                <th>Hướng dẫn sử dụng</th>
                                                {!readonly && <th style={{ width: '120px' }}>Thao tác</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prescription.detailResponses.map((detail, detailIndex) => (
                                                <tr key={detail.id}>
                                                    <td>{detailIndex + 1}</td>
                                                    <td>
                                                        <div>
                                                            <strong>{detail.medicineResponse.name}</strong>
                                                            {detail.medicineResponse.description && (
                                                                <div className="small text-muted">
                                                                    {detail.medicineResponse.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>{detail.medicineResponse.concentration}</td>
                                                    <td>{detail.medicineResponse.dosageForm}</td>
                                                    <td>
                                                        {detail.quantity} {detail.medicineResponse.unit}
                                                    </td>
                                                    <td>{detail.usageInstructions || 'Không có hướng dẫn'}</td>
                                                    {!readonly && (
                                                        <td>
                                                            <div className="d-flex gap-1">
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    onClick={() => handleEditMedicine(detail, prescription.id)}
                                                                    disabled={saving}
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <Pencil size={14} />
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteMedicine(detail.id)}
                                                                    disabled={saving}
                                                                    title="Xóa"
                                                                >
                                                                    <Trash size={14} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-4 mb-0">
                                        <Receipt size={32} className="mb-2" />
                                        <h6>Đơn thuốc chưa có thuốc</h6>
                                        <p className="mb-3 text-muted">Đơn thuốc đã được tạo nhưng chưa có thuốc nào được kê.</p>
                                        {!readonly && (
                                            <Button
                                                variant="primary"
                                                onClick={() => handleAddMedicine(prescription.id)}
                                                disabled={saving}
                                            >
                                                <Plus className="me-1" size={16} />
                                                Thêm thuốc đầu tiên
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4">
                    <Receipt size={48} className="mb-3" />
                    <h6>Chưa có đơn thuốc</h6>
                    <p className="mb-0">Bệnh nhân chưa có đơn thuốc nào được kê.</p>
                    {!readonly && (
                        <Button
                            variant="primary"
                            className="mt-3"
                            onClick={() => setShowCreateModal(true)}
                            disabled={saving}
                        >
                            <Plus className="me-1" />
                            Tạo đơn thuốc đầu tiên
                        </Button>
                    )}
                </div>
            )}

            {/* Modal tạo đơn thuốc mới */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo đơn thuốc mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Hướng dẫn chung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Nhập hướng dẫn chung cho đơn thuốc (ví dụ: Uống thuốc sau bữa ăn, tránh đồ cay nóng...)"
                                value={generalInstructions}
                                onChange={(e) => setGeneralInstructions(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                                Hướng dẫn chung áp dụng cho toàn bộ đơn thuốc
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreatePrescription}
                        disabled={saving}
                    >
                        {saving ? 'Đang tạo...' : 'Tạo đơn thuốc'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal thêm thuốc */}
            {selectedPrescriptionId && (
                <AddMedicineModal
                    show={showAddMedicineModal}
                    onHide={() => {
                        setShowAddMedicineModal(false);
                        setSelectedPrescriptionId(null);
                    }}
                    prescriptionId={selectedPrescriptionId}
                    onSuccess={onMedicineAdded}
                />
            )}

            {/* Modal chỉnh sửa thuốc */}
            {selectedPrescriptionId && editingMedicine && (
                <EditMedicineModal
                    show={showEditMedicineModal}
                    onHide={() => {
                        setShowEditMedicineModal(false);
                        setSelectedPrescriptionId(null);
                        setEditingMedicine(null);
                    }}
                    prescriptionId={selectedPrescriptionId}
                    medicine={editingMedicine}
                    onSuccess={onMedicineUpdated}
                />
            )}
        </div>
    );
};

export default PrescriptionManagement;