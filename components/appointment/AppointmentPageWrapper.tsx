"use client";

//import node module libraries
import { useState } from "react";
import { Fragment } from "react";
import { AppointmentFilter } from "../../services";

//import custom components
import AppointmentHeader from "./AppointmentHeader";
import AppointmentManagement from "./AppointmentManagement";

const AppointmentPageWrapper = () => {
  const [currentFilters, setCurrentFilters] = useState<AppointmentFilter>({});
  const [activeTab, setActiveTab] = useState<string>("list");

  const handleSearch = (filters: AppointmentFilter) => {
    setCurrentFilters(filters);
  };

  const handleNewAppointment = () => {
    setActiveTab("create");
  };

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