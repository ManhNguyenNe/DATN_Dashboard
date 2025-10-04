"use client";

//import node module libraries
import { useState, useEffect } from "react";
import { Fragment } from "react";
import { AppointmentFilter } from "../../services";

//import custom components
import AppointmentHeader from "./AppointmentHeader";
import AppointmentManagement from "./AppointmentManagement";

const AppointmentPageWrapper = () => {
  const [currentFilters, setCurrentFilters] = useState<AppointmentFilter>({});

  // Khởi tạo activeTab thông minh dựa trên localStorage
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('medicalRecordActiveTab');
      const savedPatient = localStorage.getItem('selectedPatientForMedicalRecord');
      if (savedTab && savedPatient) {
        return savedTab;
      }
    }
    return "list";
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // useEffect để cleanup localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('medicalRecordActiveTab');
      const savedPatient = localStorage.getItem('selectedPatientForMedicalRecord');

      console.log('🎯 AppointmentPageWrapper initializing:', {
        savedTab,
        hasSavedPatient: !!savedPatient,
        currentActiveTab: activeTab
      });

      // Cleanup localStorage ngay sau khi đã sử dụng để khởi tạo state
      if (savedTab && savedPatient) {
        console.log('✅ Cleanup medicalRecordActiveTab after use');
        localStorage.removeItem('medicalRecordActiveTab');
      } else if (!savedPatient) {
        // Không có dữ liệu gì → cleanup toàn bộ
        console.log('🧹 No relevant data → cleanup all');
        localStorage.removeItem('medicalRecordActiveTab');
        localStorage.removeItem('selectedPatientForMedicalRecord');
      }

      setIsInitialized(true);
    }
  }, []);

  // Xóa useEffect thứ 2 vì không cần thiết và có thể gây lỗi

  const handleSearch = (filters: AppointmentFilter) => {
    setCurrentFilters(filters);
  };

  const handleNewAppointment = () => {
    setActiveTab("create");
  };

  console.log('🔄 AppointmentPageWrapper render, activeTab:', activeTab);

  return (
    <Fragment>
      <AppointmentHeader
        onNewAppointment={handleNewAppointment}
        searchPhone={currentFilters.phone || ""}
      />
      <AppointmentManagement
        onSearch={handleSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Fragment>
  );
};

export default AppointmentPageWrapper;