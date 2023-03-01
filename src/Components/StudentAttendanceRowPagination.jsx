import React,{useState,useEffect} from 'react'
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
import LoadingButton from '@mui/lab/LoadingButton';
import { db } from "../Firebase/config";

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
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
 
  }));


   // Comparator Function to sort attendance
   const compareByDate = (a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
  
    if (dateA < dateB) {
      return 1; // a should come after b
    } else if (dateA > dateB) {
      return -1; // a should come before b
    } else {
      return 0; // a and b are equal
    }
  };




const StudentAttendanceRowPagination = ( {student,attendanceData,courseId}) => {
    const rows = [student];
    const [attendanceDataPagination,setAttendanceDataPagination]=useState(attendanceData);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [presentPercentage,setPresentPercentage]=useState(0);
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
    let totalLectures = 0;
    let totalPresents = 0;
    let percentage=0;
    attendanceData.forEach((attendance) => {
      if (attendance.attendance[student.sid] && attendance.attendance[student.sid] !== undefined) {
        totalLectures += 1;
        totalPresents += 1;
      }
      else if (!attendance.attendance[student.sid]) {
        totalLectures += 1;
      }
    });
    percentage=(totalPresents/totalLectures)*100;
    setPresentPercentage(percentage.toFixed(1));
  }, [attendanceData, student.sid]);
  

  return (
    <div className="mt-2" >
      <div className="percentage text-center d-flex justify-content-between w-100 flex-wrap">
       <div>
       Course ID:{courseId}
       </div>
       <div>
       Present Percentage:{presentPercentage}%
       </div>
      </div>
    <TableContainer component={Paper} >
    <Table sx={{ minWidth: 700 }} aria-label="customized table">
      <TableHead>
        <TableRow>
          <StyledTableCell>Name(ID)</StyledTableCell>
          {(attendanceDataPagination)?attendanceDataPagination.map((attendance)=>{
            return(

                <StyledTableCell align="center"><div className="d-flex flex-column justify-content-center align-items-center"><span>{attendance.date}</span><span>L-{attendance.lecturenumber}</span></div></StyledTableCell>
            )
          }):""}
       
        </TableRow>
      </TableHead>            
      <TableBody>
        {(rowsPerPage > 0
          ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          : rows
        ).map((row,index) => {
          return true? (
            <StyledTableRow
              key={student.firebaseId}
              
            >
              
              <StyledTableCell component="th" scope="row">
                {student.firstname+" "+student.lastname+"("+student.sid+")"}
              </StyledTableCell>
              {(attendanceData && attendanceData.length!==0)?attendanceData.map((attendance,index)=>{
                return(
                    <StyledTableCell align="center"  >
                
                    {(attendance.attendance[student.sid])?"P":(attendance.attendance[student.sid]!==undefined)?"A":"-"}
                  </StyledTableCell>
                );
              }):""}
              
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
  </div>);
}

export default StudentAttendanceRowPagination
