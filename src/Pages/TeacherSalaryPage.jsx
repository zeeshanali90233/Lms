import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { db } from "../Firebase/config";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useContext } from "react";
import { teacherUser } from "./TeacherDashboard";
import moment from "moment";


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

const TeacherSalaryPage = () => {

    const [teacherSalary,setTeacherSalary]=useState({});
    const teacher=useContext(teacherUser);

    useEffect(() => {
        const fetchSalaryRecord = async () => {
            if (teacher) {
              const snapshot = await db
                .collection("salaries")
                .where("id", "==", teacher.tid)
                .get();
                setTeacherSalary(snapshot.docs[0].data());
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
          <StyledTableCell align="left"> {teacherSalary.id}</StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Teacher Name</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {" "}
            {teacherSalary.name}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Salary</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {teacherSalary.salary}PKR
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Status</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {(teacherSalary.paid)?"Paid":"Not Paid"}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <TableHead>
            <StyledTableCell>Salary Month</StyledTableCell>
          </TableHead>
          <StyledTableCell align="left">
            {moment(teacherSalary.date,"DD-MM-YYYY").format("MMMM")}
          </StyledTableCell>
        </TableRow>
       
      </TableBody>
    </Table>
  </div>
    </div>

  )
}

export default TeacherSalaryPage
