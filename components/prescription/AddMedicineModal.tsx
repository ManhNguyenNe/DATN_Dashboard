"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, InputGroup, Table, Spinner } from 'react-bootstrap';
import { Search, Plus } from 'react-bootstrap-icons';
import { prescriptionService, medicineService } from '../../services/prescriptionService';
import { MedicineResponse, CreatePrescriptionDetailRequest } from '../../types/PrescriptionTypes';
import { useMessage } from '../common/MessageProvider';

interface AddMedicineModalProps {
    show: boolean;
    onHide: () => void;
    prescriptionId: number;
    onSuccess: () => void;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
    show,
    onHide,
    prescriptionId,
    onSuccess
}) => {
    const message = useMessage();
    const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState<MedicineResponse | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [dosage, setDosage] = useState<string>('');
    const [instructions, setInstructions] = useState<string>('');

    useEffect(() => {
        if (show) {
            loadMedicines();
            resetForm();
        }
    }, [show]);

    useEffect(() => {
        if (searchKeyword.length >= 2) {
            searchMedicines(searchKeyword);
        } else if (searchKeyword.length === 0) {
            loadMedicines();
        }
    }, [searchKeyword]);

    const loadMedicines = async () => {
        try {
            setLoading(true);
            const response = await medicineService.getMedicines();
            setMedicines(response.data || []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách thuốc:', error);
            message.error('Không thể tải danh sách thuốc');
        } finally {
            setLoading(false);
        }
    };

    const searchMedicines = async (keyword: string) => {
        try {
            setLoading(true);
            const response = await medicineService.getMedicines(keyword);
            setMedicines(response.data || []);
        } catch (error) {
            console.error('Lỗi khi tìm kiếm thuốc:', error);
            message.error('Không thể tìm kiếm thuốc');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = async () => {
        try {
            if (!selectedMedicine) {
                message.error('Vui lòng chọn thuốc');
                return;
            }

            if (quantity <= 0) {
                message.error('Số lượng phải lớn hơn 0');
                return;
            }

            const data: CreatePrescriptionDetailRequest = {
                prescriptionId,
                medicineId: selectedMedicine.id,
                quantity,
                usageInstructions: `${dosage.trim() || ''} ${instructions.trim() || ''}`.trim() || undefined,
            };

            await prescriptionService.createPrescriptionDetail(data);
            message.success('Thêm thuốc vào đơn thành công');

            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Lỗi khi thêm thuốc:', error);
            message.error('Không thể thêm thuốc vào đơn');
        }
    };

    const resetForm = () => {
        setSelectedMedicine(null);
        setQuantity(1);
        setDosage('');
        setInstructions('');
        setSearchKeyword('');
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Thêm thuốc vào đơn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Tìm kiếm thuốc</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search size={16} />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên thuốc..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                    </InputGroup>
                </Form.Group>

                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {loading ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang tải...
                        </div>
                    ) : medicines.length > 0 ? (
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Chọn</th>
                                    <th>Tên thuốc</th>
                                    <th>Nồng độ</th>
                                    <th>Dạng bào chế</th>
                                    <th>Đơn vị</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((medicine) => (
                                    <tr
                                        key={medicine.id}
                                        className={selectedMedicine?.id === medicine.id ? 'table-primary' : ''}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedMedicine(medicine)}
                                    >
                                        <td>
                                            <Form.Check
                                                type="radio"
                                                name="selectedMedicine"
                                                checked={selectedMedicine?.id === medicine.id}
                                                onChange={() => setSelectedMedicine(medicine)}
                                            />
                                        </td>
                                        <td>{medicine.name}</td>
                                        <td>{medicine.concentration || 'N/A'}</td>
                                        <td>{medicine.dosageForm || 'N/A'}</td>
                                        <td>{medicine.unit || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted py-3">
                            {searchKeyword ? 'Không tìm thấy thuốc phù hợp' : 'Không có thuốc nào'}
                        </div>
                    )}
                </div>

                {selectedMedicine && (
                    <div className="mb-3">
                        <h6>Thuốc đã chọn: {selectedMedicine.name}</h6>

                        <div className="row">
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lượng *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-8">
                                <Form.Group className="mb-3">
                                    <Form.Label>Cách dùng</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="VD: 1 viên/lần, uống sau ăn"
                                        value={`${dosage} ${instructions}`.trim()}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const parts = value.split(',');
                                            setDosage(parts[0]?.trim() || '');
                                            setInstructions(parts[1]?.trim() || '');
                                        }}
                                    />
                                    <Form.Text className="text-muted">
                                        Nhập liều dùng và hướng dẫn, phân cách bằng dấu phẩy
                                    </Form.Text>
                                </Form.Group>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleAddMedicine}
                    disabled={!selectedMedicine || loading}
                >
                    <Plus size={16} className="me-1" />
                    Thêm thuốc
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddMedicineModal;
