"use client";

//import node module libraries
import { useState } from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { IconSearch, IconX, IconUserPlus } from "@tabler/icons-react";

interface PatientSearchProps {
    onSearch: (keyword: string) => void;
    onAddPatient?: () => void;
    loading?: boolean;
    placeholder?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
    onSearch,
    onAddPatient,
    loading = false,
    placeholder = "Nhập CCCD, tên, hoặc số điện thoại để tìm kiếm..."
}) => {
    const [keyword, setKeyword] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(keyword.trim());
    };

    const handleClear = () => {
        setKeyword("");
        onSearch("");
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    return (
        <Row className="mb-4">
            <Col xl={12} lg={12} md={12} sm={12}>
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Tìm kiếm bệnh nhân</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <IconSearch size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder={placeholder}
                                        value={keyword}
                                        onChange={handleKeywordChange}
                                        disabled={loading}
                                    />
                                    {keyword && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={handleClear}
                                            disabled={loading}
                                        >
                                            <IconX size={16} />
                                        </Button>
                                    )}
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex align-items-end">
                            <div className="d-flex gap-2 w-100">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading || !keyword.trim()}
                                    className="flex-grow-1"
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Đang tìm...
                                        </>
                                    ) : (
                                        <>
                                            <IconSearch size={16} className="me-2" />
                                            Tìm kiếm
                                        </>
                                    )}
                                </Button>
                                {onAddPatient && (
                                    <Button
                                        variant="success"
                                        type="button"
                                        onClick={onAddPatient}
                                        disabled={loading}
                                        className="flex-shrink-0"
                                    >
                                        <IconUserPlus size={16} className="me-2" />
                                        Thêm bệnh nhân
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Col>
        </Row>
    );
};

export default PatientSearch;