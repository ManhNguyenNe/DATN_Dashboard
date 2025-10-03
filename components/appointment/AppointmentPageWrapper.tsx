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
  const [activeTab, setActiveTab] = useState<string>("list");
  const [isInitialized, setIsInitialized] = useState(false);

  // useEffect để xử lý logic chuyển tab
  useEffect(() => {
    // Check localStorage for active tab
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('medicalRecordActiveTab');
      const savedPatient = localStorage.getItem('selectedPatientForMedicalRecord');

      console.log('🎯 AppointmentPageWrapper initializing:', {
        savedTab,
        hasSavedPatient: !!savedPatient
      });

      if (savedTab && savedPatient) {
        console.log('✅ Setting activeTab to:', savedTab);
        setActiveTab(savedTab);
        // Clean up localStorage after setting tab
        localStorage.removeItem('medicalRecordActiveTab');
      }
      setIsInitialized(true);
    }
  }, []);

  // Force update tab if not already switched after initialization
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      const savedPatient = localStorage.getItem('selectedPatientForMedicalRecord');
      if (savedPatient && activeTab === "list") {
        console.log('🔄 Force switching to medical-record tab');
        setActiveTab("medical-record");
      }
    }
  }, [isInitialized, activeTab]);

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