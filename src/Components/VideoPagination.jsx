import React, { useContext } from "react";
import { searchKeyword } from "../Pages/SAdminDashboard";
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';

import "../Css/FeesPage.css";
import { db } from "../Firebase/config";
import firebase from 'firebase/compat/app';
import { showMaterialDeleteButtonContext } from "./CourseDetails";


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
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
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
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },


  "&:hover h3":{
    color:"white"
  }
}));


const VideoPagination = ({ data,courseFirebaseId}) => {

  const rows = [...data].reverse();
  const [page, setPage] = React.useState(0);
  const search=useContext(searchKeyword);
  const [rowsPerPage, setRowsPerPage] = React.useState(1);
   const {showMaterialDeleteButton} =useContext(showMaterialDeleteButtonContext);
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

 // It Deletes the Videos
  const handleVideoDelete=async(videoLink)=>{

    if(window.confirm("Are you sure to delete")){
      db.collection("courses").doc(courseFirebaseId).update({
        lectureVideos:firebase.firestore.FieldValue.arrayRemove(videoLink),
      })
      .catch((err)=>{
        console.log(err);
      })
    }
  }

  return (
    <TableContainer component={Paper} className="mt-1">
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Video Lectures</StyledTableCell>
            {(showMaterialDeleteButton)?<StyledTableCell></StyledTableCell>:""}
          </TableRow>
        </TableHead>
        <TableBody>
          
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => {
           return(
               ( row.title.toLowerCase().includes(search.toLowerCase()) || search.length===0)? <StyledTableRow key={row.fileTitle}>
                
                <StyledTableCell component="th" scope="row">
                    <h4>{row.title}</h4>
                    {/* {console.log(row.videoLink)} */}
                <iframe width="560" height="315" src={`${row.videoLink}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;" allowFullScreen></iframe>
               
              </StyledTableCell>
               {(showMaterialDeleteButton)? <StyledTableCell component="th" scope="row" onClick={()=>{handleVideoDelete(row)}}>
                <button type="button" class="btn btn-danger">Delete</button>
              </StyledTableCell>:""}
                
              
            </StyledTableRow>:""
           )
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
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  'aria-label': 'rows per page',
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

export default VideoPagination;
