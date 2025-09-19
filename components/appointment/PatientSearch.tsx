"use client";

//import node module libraries
import { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { IconX, IconUserPlus, IconSearch } from "@tabler/icons-react";

interface PatientSearchProps {
    onSearch: (keyword: string) => void;
    onKeywordChange?: (keyword: string) => void; // Callback để update keyword realtime
    onAddPatient?: () => void;
    loading?: boolean;
    placeholder?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
    onSearch,
    onKeywordChange,
    onAddPatient,
    loading = false,
    placeholder = "Nhập CCCD, tên, hoặc số điện thoại để tìm kiếm..."
}) => {
    const [keyword, setKeyword] = useState<string>("");
    const isInitialMount = useRef<boolean>(true);

    // Auto search khi keyword thay đổi với debounce
    useEffect(() => {
        // Bỏ qua lần render đầu tiên (khi component mount)
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Debounce: chỉ search sau 600ms kể từ lần thay đổi cuối và tối thiểu 2 ký tự
        const timeoutId = setTimeout(() => {
            const trimmedKeyword = keyword.trim();
            // Chỉ search khi có ít nhất 2 ký tự hoặc khi xóa hết (để clear results)
            if (trimmedKeyword.length >= 2 || trimmedKeyword.length === 0) {
                onSearch(trimmedKeyword);
            }
        }, 600);

        // Cleanup function để clear timeout khi component re-render
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword]); // Bỏ onSearch khỏi dependency array để tránh infinite loop

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(keyword.trim());
    };

    const handleClear = () => {
        setKeyword("");
        onSearch("");
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKeyword = e.target.value;
        setKeyword(newKeyword);
        // Update keyword realtime cho parent component
        onKeywordChange?.(newKeyword);
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
                        <Col md={6} className="d-flex align-items-end justify-content-end">
                            {onAddPatient && (
                                <Button
                                    variant="success"
                                    type="button"
                                    onClick={onAddPatient}
                                    disabled={loading}
                                    style={{ minWidth: '150px' }}
                                >
                                    <IconUserPlus size={16} className="me-2" />
                                    Thêm bệnh nhân
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Col>
        </Row>
    );
};

export default PatientSearch;