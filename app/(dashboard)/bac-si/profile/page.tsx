"use client";

import React from "react";
import UserProfileComponent from "../../../../components/common/UserProfile";

const DoctorProfilePage: React.FC = () => {
    return <UserProfileComponent userRole="DOCTOR" />;
};

export default DoctorProfilePage;