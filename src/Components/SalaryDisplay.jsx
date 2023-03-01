import React from "react";
import { db } from "../Firebase/config";
import "../Css/DuesPage.css";
import { styled } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";
import { tableCellClasses } from "@mui/material/TableCell";
import { useState } from "react";
import DuesPaidICON from "../Assets/Logos/DuesPaidICON.png";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import moment from "moment";
import { useContext } from "react";
import { adminUser } from "../Pages/AdminDashboard";
import { sAdminUser } from "../Pages/SAdminDashboard";
import { isSuperAdminForTransaction } from "../Pages/DuesPage";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const SalaryDisplay = ({ salary, showPaidButton }) => {
  const [showSuccessfullyPaidAlert, setShowSuccessfullyAlert] = useState(false);
  const isSuperAdmin = useContext(isSuperAdminForTransaction);

  const user = useContext(isSuperAdmin ? sAdminUser : adminUser);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setShowSuccessfullyAlert(false);
  };
  const handleSalaryPay = (e, id) => {
    e.preventDefault();
    // Changes the paid attribute of record to true
    db.collection("salaries").doc(id).update({
      paid: true,
    });

    //Also making a receipt in transaction collection
    // Getting today date
    let today = new Date();
    let transDate = today.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });

    db.collection("transactions").add({
      // Generating the unique id
      id: Date.now().toString(),
      from: `${user.firstname + " " + user.lastname}(${user.said || user.aid},${
        user.designation
      })`,
      to: salary.id,
      date: transDate,
      amount: salary.salary,
      time: new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
    });
    setShowSuccessfullyAlert(true);
    setTimeout(() => {
      setShowSuccessfullyAlert(false);
    }, 2000);
  };
  return (
    <>
      <StyledTableCell align="right">
        <Avatar
          alt="Remy Sharp"
          src={`${salary.photoURL.URL}`}
          sx={{ width: 56, height: 56 }}
        />
      </StyledTableCell>
      <StyledTableCell align="right" className="text-uppercase">
        {salary.id}
      </StyledTableCell>
      <StyledTableCell align="right">{salary.name}</StyledTableCell>
      <StyledTableCell align="right">{salary.salary}</StyledTableCell>
      <StyledTableCell align="right">
        {moment(salary.date, "DD-MM-YYYY").format("MMM")}
      </StyledTableCell>
      <StyledTableCell align="right">
        <h5>{salary.paid ? "Paid" : "Not Paid"}</h5>
        {showPaidButton ? (
          <button
            type="button"
            className="salaryPaidButton border d-flex flex-column align-items-center rounded justify-content-center ms-auto me-2"
            onClick={(e) => {
              handleSalaryPay(e, salary.firebaseId);
            }}
          >
            <img src={DuesPaidICON} alt="" width={40} />
          </button>
        ) : (
          ""
        )}
      </StyledTableCell>
      <StyledTableCell align="right">{salary.feepaid}</StyledTableCell>

      {/* Successfully Updated Alert */}
      <Snackbar open={showSuccessfullyPaidAlert} onClose={handleClose}>
        <Alert severity="success">Successfully Updated!</Alert>
      </Snackbar>
    </>
  );
};

export default SalaryDisplay;
