"use client";
import { useState, useEffect, useRef } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import medicalServiceService, { ServiceSearchResult } from '../../services/medicalServiceService';

interface ServiceSearchInputProps {
    onServiceSelect: (service: ServiceSearchResult) => void;
    placeholder?: string;
    selectedService?: ServiceSearchResult | null;
}

const ServiceSearchInput = ({
    onServiceSelect,
    placeholder = "Tìm kiếm dịch vụ...",
    selectedService
}: ServiceSearchInputProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ServiceSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Don't search if term is too short
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await medicalServiceService.searchServices(searchTerm);
                setSearchResults(results);
                setShowDropdown(results.length > 0);
            } catch (error) {
                console.error('Lỗi khi tìm kiếm dịch vụ:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 300); // Debounce 300ms

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectService = (service: ServiceSearchResult) => {
        onServiceSelect(service);
        setSearchTerm(service.name);
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleInputChange = (value: string) => {
        setSearchTerm(value);
        if (selectedService && value !== selectedService.name) {
            // User is changing the selection, clear it
            onServiceSelect(null as any);
        }
    };

    return (
        <div ref={dropdownRef} className="position-relative">
            <div className="position-relative">
                <Search
                    className="position-absolute top-50 translate-middle-y ms-3"
                    style={{ pointerEvents: 'none', color: '#6c757d' }}
                />
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={selectedService ? selectedService.name : searchTerm}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                        if (searchResults.length > 0) {
                            setShowDropdown(true);
                        }
                    }}
                    style={{ paddingLeft: '2.5rem' }}
                    className="pe-5"
                />
                {loading && (
                    <Spinner
                        animation="border"
                        size="sm"
                        className="position-absolute top-50 translate-middle-y end-0 me-3"
                    />
                )}
            </div>

            {showDropdown && searchResults.length > 0 && (
                <ListGroup className="position-absolute w-100 mt-1" style={{
                    zIndex: 1050,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {searchResults.map((service) => (
                        <ListGroup.Item
                            key={service.id}
                            action
                            onClick={() => handleSelectService(service)}
                            className="cursor-pointer"
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <div className="fw-semibold">{service.name}</div>
                                    <small className="text-muted">
                                        {service.code} • {service.roomName}
                                    </small>
                                    {service.description && (
                                        <div>
                                            <small className="text-muted">{service.description}</small>
                                        </div>
                                    )}
                                </div>
                                <div className="text-end ms-3">
                                    <div className="fw-bold text-primary">
                                        {service.price.toLocaleString('vi-VN')}đ
                                    </div>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {showDropdown && searchResults.length === 0 && searchTerm.length >= 2 && !loading && (
                <ListGroup className="position-absolute w-100 mt-1" style={{ zIndex: 1050 }}>
                    <ListGroup.Item className="text-muted text-center">
                        Không tìm thấy dịch vụ nào
                    </ListGroup.Item>
                </ListGroup>
            )}
        </div>
    );
};

export default ServiceSearchInput;
