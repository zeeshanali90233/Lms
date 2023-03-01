import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { db } from "../Firebase/config";
import firebase from "firebase/compat/app";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useContext } from "react";
import Avatar from "@mui/material/Avatar";
import moment from "moment";
import { adminUser } from "./AdminDashboard";


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  
    "&": {
      width: "12rem",
  
    },
    
  }));

const AdminSalaryPage = () => {

    const [adminSalary,setAdminSalary]=useState({});
    const admin=useContext(adminUser);

    useEffect(() => {
        const fetchSalaryRecord = async () => {
            if (admin) {
              const snapshot = await db
                .collection("salaries")
                .where("id", "==", admin.aid)
                .get();
                setAdminSalary(snapshot.docs[0].data());
            }
          }

       fetchSalaryRecord();
      }, []);
  return (
    <div className="d-flex flex-column align-items-center">
        <div className="teacher-salary-details  mt-5 ">
       
    <Table sx={{ minWidth: 100 }} aria-label="customized table">
      <TableBody>
        <TableRow>
          <TableHead>
            <StyledTableCell>ID</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left"> {adminSalary.id}</StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Admin Name</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {" "}
            {adminSalary.name}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Salary</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {adminSalary.salary}PKR
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Status</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {(adminSalary.paid)?"Paid":"Not Paid"}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Salary Month</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {moment(adminSalary.date,"DD-MM-YYYY").format("MMMM")}
          </StyledTableCell>
        </TableRow>
       
      </TableBody>
    </Table>
  </div>
    </div>

  )
}

export default AdminSalaryPage
