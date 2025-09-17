"use client";

//import node module libraries
import { useState } from "react";
import { Fragment } from "react";

//import custom components
import AppointmentHeader from "./AppointmentHeader";
import AppointmentManagement from "./AppointmentManagement";

const AppointmentPageWrapper = () => {
  const [searchPhone, setSearchPhone] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("list");

  const handlePhoneSearch = (phone: string) => {
    setSearchPhone(phone);
  };

  const handleNewAppointment = () => {
    setActiveTab("create");
  };

  return (
    <Fragment>
      <AppointmentHeader 
        onNewAppointment={handleNewAppointment}
        searchPhone={searchPhone}
      />
      <AppointmentManagement 
        onPhoneSearch={handlePhoneSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Fragment>
  );
};

export default AppointmentPageWrapper;