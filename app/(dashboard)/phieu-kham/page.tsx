"use client";

//import node module libraries
import { Fragment } from "react";

//import custom components
import MedicalRecordManagement from "../../../components/medical-record/MedicalRecordManagement";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import { UserRole } from "../../../services";

const MedicalRecordPage = () => {
    return (
        <Fragment>
            <ProtectedRoute requiredRoles={[UserRole.BAC_SI, UserRole.LE_TAN]}>
                <MedicalRecordManagement />
            </ProtectedRoute>
        </Fragment>
    );
};

export default MedicalRecordPage;