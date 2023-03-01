import React from 'react'
import { useState,useEffect } from 'react';
import { db } from '../Firebase/config';
import { useContext } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import { searchKeywordAdmin } from '../Pages/AdminDashboard';
import { searchKeywordTeacher } from '../Pages/TeacherDashboard';
import { searchKeywordStudent } from '../Pages/StudentDashboard';
import { searchKeywordStaff } from '../Pages/StaffDashboard';

function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (event) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (event) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event) => {
      onPageChange(event, page + 1);
    };
  
    const handleLastPageButtonClick = (event) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
  }
  
  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };
  
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  
    "&": {
      cursor: "pointer",
    },
  
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  
    "&:hover h3": {
      color: "white",
    },
  }));


const AssignedRolePagination = ({collectionName}) => {
    const [rows,setRows]=useState([]);
    const [page, setPage] = React.useState(0);
    const search = useContext((collectionName==="admin")?searchKeywordAdmin:(collectionName==="teachers")?searchKeywordTeacher:(collectionName==="students")?searchKeywordStudent:(collectionName==="staff")?searchKeywordStaff:"");
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  

    useEffect(() => {
      let firebaseId;
      if(collectionName === "admin"){
        firebaseId = localStorage.getItem("adminUser");
      } else if(collectionName === "staff"){
        firebaseId = localStorage.getItem("staffUser");
      } else if(collectionName === "teachers"){
        firebaseId = localStorage.getItem("teacherUser");
      }else if(collectionName === "students"){
        firebaseId = localStorage.getItem("studentUser");
      }
      setTimeout(()=>{},1000)
      const getSnapshotData = async () => {
        const snapshot = await db.collection(collectionName).doc(firebaseId).get();
        const data = snapshot.data().assignedrole.reverse();
        setRows(data);
      };  
    
      getSnapshotData();
    }, []);
    
    
  return (
    <TableContainer component={Paper} className="mt-1">
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
          <StyledTableCell>Task/Message</StyledTableCell>
            <StyledTableCell align="right">Assigned By</StyledTableCell>
            <StyledTableCell align="right">Date</StyledTableCell>
            <StyledTableCell align="right">Time</StyledTableCell>
 
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Outiline FIle */}
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => {
            return  row.role.toLowerCase().includes(search.toLowerCase()) || row.assignedby.toLowerCase().includes(search.toLowerCase()) || 
              search.length === 0 ? (
              <StyledTableRow key={row.role}>
                <StyledTableCell
                  component="th"
                  scope="row"
                style={{  wordWrap:"break-word"}}
                >
                  {row.role}
                </StyledTableCell>
                <StyledTableCell
                 align="right"
                 
                >
                  {row.assignedby}
                </StyledTableCell>
                <StyledTableCell
                 align="right"
                 
                >
                  {row.date}
                </StyledTableCell>
                <StyledTableCell
                  align="right"
                 
                >
                  {row.time}
                </StyledTableCell>
                
              </StyledTableRow>
            ) : (
              ""
            );
          })}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  "aria-label": "rows per page",
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

export default AssignedRolePagination
