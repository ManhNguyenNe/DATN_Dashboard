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
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Check localStorage for active tab
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('medicalRecordActiveTab');
      const savedPatient = localStorage.getItem('selectedPatientForMedicalRecord');

      console.log('🎯 AppointmentPageWrapper initializing:', {
        savedTab,
        hasSavedPatient: !!savedPatient
      });

      if (savedTab) {
        localStorage.removeItem('medicalRecordActiveTab');
        console.log('✅ Setting activeTab to:', savedTab);
        return savedTab;
      }
    }
    return "list";
  });

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