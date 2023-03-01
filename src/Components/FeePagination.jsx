import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { searchKeyword } from "../Pages/SAdminDashboard";
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
import { searchKeywordAdmin } from "../Pages/AdminDashboard";
import "../Css/FeesPage.css";
import { searchKeywordStaff } from "../Pages/StaffDashboard";

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
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "#393c41",
  },

  "&:hover *": {
    color: "white",
  },
}));

const FeePagination = ({ data, isSuperAdmin, isAdmin, isStaff }) => {
  const rows = [...data];
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const search = useContext(
    isSuperAdmin ? searchKeyword : isAdmin ? searchKeywordAdmin : isStaff?searchKeywordStaff:""
  );
  const navigate = useNavigate();
  const handleClick = (id, row) => {
    console.log(isSuperAdmin);
    if (isSuperAdmin) {
      navigate("/sadmin/dashboard/fees/editfees", { state: row });
    } else {
      navigate("editfees", { state: row });
    }
  };

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

  //It checks whether the props date is passed or not
  function isDueDatePassed(dueDate) {
    const currentDate = new Date();
    const dueDateObject = new Date(dueDate + ", " + new Date().getFullYear());
    return dueDateObject.getTime() < currentDate.getTime();
  }
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>ID</StyledTableCell>
            <StyledTableCell align="right">Name</StyledTableCell>
            <StyledTableCell align="right">Total Fees</StyledTableCell>
            <StyledTableCell align="right">
              Fees Per Installement
            </StyledTableCell>
            <StyledTableCell align="right">Fees Paid</StyledTableCell>
            <StyledTableCell align="right">Due Date</StyledTableCell>
            <StyledTableCell align="right">Course</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => {
            const [searchCourseName, searchStudentId] = search.split("/");
            const isMatched =
              (searchCourseName
                ? row.sid.includes(search.toLowerCase()) ||
                  row.coursename
                    .toLowerCase()
                    .includes(searchCourseName.toLowerCase())
                : true) &&
              (searchStudentId
                ? row.sid
                    .toLowerCase()
                    .includes(searchStudentId.toLowerCase()) ||
                  row.name.toLowerCase().includes(searchStudentId.toLowerCase())
                : true);

            return isMatched ? (
              <StyledTableRow
                key={row.firebaseid}
                className={`fees-row ${
                  isDueDatePassed(row.duedate) && row.feepaid < row.totalfees
                    ? "fee-defaulter"
                    : ""
                }`}
                onClick={() => {
                  handleClick(row.firebaseid, row);
                }}
              >
                <StyledTableCell
                  component="th"
                  scope="row"
                  className="text-uppercase"
                >
                  {row.sid}
                </StyledTableCell>
                <StyledTableCell align="right">{row.name}</StyledTableCell>
                <StyledTableCell align="right">{row.totalfees}</StyledTableCell>
                <StyledTableCell align="right">
                  {row.feeperinstallment}
                </StyledTableCell>
                <StyledTableCell align="right">{row.feepaid}</StyledTableCell>
                <StyledTableCell align="right">{row.duedate}</StyledTableCell>
                <StyledTableCell align="right">
                  {row.coursename}
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
  );
};

export default FeePagination;
