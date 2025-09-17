//import node module libraries
import { Fragment } from "react";
import { Metadata } from "next";

//import custom components
import AppointmentPageWrapper from "../../../components/appointment/AppointmentPageWrapper";

export const metadata: Metadata = {
  title: "Đặt lịch khám | Dasher - Responsive Bootstrap 5 Admin Dashboard",
  description: "Quản lý lịch khám bệnh - Dasher Admin Dashboard",
};

const DatLich = () => {
  return (
    <Fragment>
      <AppointmentPageWrapper />
    </Fragment>
  );
};

export default DatLich;