"use client";

//import node module libraries
import { Fragment } from "react";

//import custom components
import AppointmentPageWrapper from "../../../components/appointment/AppointmentPageWrapper";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import { UserRole } from "../../../services";

const DatLich = () => {
  return (
    <Fragment>
      <ProtectedRoute requiredRoles={[UserRole.LE_TAN]}>
        <AppointmentPageWrapper />
      </ProtectedRoute>
    </Fragment>
  );
};

export default DatLich;