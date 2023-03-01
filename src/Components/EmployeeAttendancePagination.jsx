import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { useState, useEffect } from "react";
import MuiAlert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { db } from "../Firebase/config";
import Snackbar from "@mui/material/Snackbar";

const SuccessAlert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Modal MUI Style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "350px",
  bgcolor: "background.paper",
  border: "1px solid #0086c9",
  borderRadius: "23px",
  boxShadow: 24,
  p: 4,
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

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

const EmployeeAttendancePagination = ({
  data,
  attendanceData,
  attendanceFirebaseId,
  isAdminAttendance,
}) => {
  const rows = [...data];
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceDataPagination, setAttendanceDataPagination] = useState(
    attendanceData.sort(compareByDate)
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState( data && data.length != 0 ? data.length : 10);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const [alertState, setAlertState] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "right",
  });
  const { vertical, horizontal, open } = alertState;
  // For Success Toast
  const handleClick = () => {
    setAlertState({ ...alertState, open: true });
  };
  const handleClose = () => {
    setAlertState({ ...alertState, open: false });
  };

  useEffect(() => {
    db.collection("attendance")
      .doc(attendanceFirebaseId)
      .onSnapshot((snapshot) => {
        if (isAdminAttendance) {
          setAttendanceDataPagination(
            snapshot.data().adminattendance.sort(compareByDate)
          );
        } else {
          setAttendanceDataPagination(
            snapshot.data().staffattendance.sort(compareByDate)
          );
        }
      });
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //   It handles the attendance checkboxes changes
  const handleAttendanceCheckbox = (e, index, sid) => {
    e.preventDefault();
    let updatedAttendance = [...attendanceDataPagination];
    updatedAttendance[index].attendance[sid] =
      !updatedAttendance[index].attendance[sid];
    setAttendanceDataPagination(updatedAttendance);
  };

  const handleSaveAttendanceChanges = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Updating the admin one
    if (isAdminAttendance) {
      db.collection("attendance").doc(attendanceFirebaseId).update({
        adminattendance: attendanceDataPagination,
      });
    }
    // If it is staff attendance
    else {
      db.collection("attendance").doc(attendanceFirebaseId).update({
        staffattendance: attendanceDataPagination,
      });
    }
    setIsSaving(false);
    handleClick();
  };
  return (
    <div className="mt-2">
      {/* Success Message Toaster */}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        autoHideDuration={1500}
        key={vertical + horizontal}
      >
        <SuccessAlert
          onClose={handleClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Successfully Saved
        </SuccessAlert>
      </Snackbar>
      <SaveButton
        color="secondary"
        type="submit"
        loading={isSaving}
        loadingPosition="start"
        startIcon={<SaveIcon />}
        variant="contained"
        className="w-100"
        onClick={(e) => {
          handleSaveAttendanceChanges(e);
        }}
      >
        <span>Save Changes</span>
      </SaveButton>


      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Sr.</TableCell>
                <TableCell>Name(ID)</TableCell>
                {attendanceDataPagination
                  ? attendanceDataPagination.map((attendance) => {
                      return (
                        <TableCell
                          align="center"
                          style={{ minWidth: 170, align: "right" }}
                        >
                          <div className="d-flex flex-column justify-content-center align-items-center">
                            <span>{attendance.date}</span>
                          </div>
                        </TableCell>
                      );
                    })
                  : ""}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return true ? (
                    <StyledTableRow key={row.firebaseId}>
                      <StyledTableCell component="th" scope="row">
                        {index + 1}
                      </StyledTableCell>
                      <StyledTableCell component="th" scope="row">
                      {row.firstname +
                      " " +
                      row.lastname +
                      "(" +
                      (isAdminAttendance ? row.aid : row.staffid) +
                      ")"}
                      </StyledTableCell>
                      {attendanceDataPagination.map((attendance, index) => {
                        return index === 0 ? (
                          <StyledTableCell align="center">
                            <Checkbox
                              inputProps={{ "aria-label": "checkbox" }}
                              onChange={(e) => {
                                handleAttendanceCheckbox(
                                  e,
                                  index,
                                  row.aid || row.staffid
                                );
                              }}
                              checked={
                                attendance.attendance[row.aid || row.staffid]
                              }
                            />
                          </StyledTableCell>
                        ) : (
                          <StyledTableCell align="center">
                            {attendance.attendance[row.aid || row.staffid]
                          ? "P"
                          : attendance.attendance[row.aid || row.staffid] !==
                            undefined
                          ? "A"
                          : "-"}
                          </StyledTableCell>
                        );
                      })}
                    </StyledTableRow>
                  ) : (
                    ""
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
    </div>
  );
};

export default EmployeeAttendancePagination;

