import React, { useContext ,useRef,useState} from "react";
import { searchKeyword } from "../Pages/SAdminDashboard";
import { searchKeywordAdmin } from "../Pages/AdminDashboard";
import { searchKeywordStaff } from "../Pages/StaffDashboard";
import { searchKeywordStudent } from "../Pages/StudentDashboard";
import { searchKeywordTeacher } from "../Pages/TeacherDashboard";
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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CardActions from '@mui/material/CardActions';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LoadingButton from '@mui/lab/LoadingButton';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import firebase from 'firebase/compat/app';
import { db } from "../Firebase/config";

  
// Modal MUI Style
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width:"80%" ,
  bgcolor: 'background.paper',
  border: '1px solid #0086c9',
  borderRadius: "23px",
  boxShadow: 24,
  p: 4,
};


const SaveButton=styled(LoadingButton)({
  backgroundColor:"#00233a",
  '&:hover':{
    backgroundColor:"#393c41"
  }
})


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
    textDecoration: "underline blue",
  },

  "&:hover": {
    color: "blue",
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

  "&":{
    paddingRight:"5px",
  }

}));


const CoursePagination = ({data,showCourseDeleteBtn,isSuperAdmin,isAdmin,isStaff,isTeacher,isStudent}) => {
  const rows = [...data].reverse();
  const [page, setPage] = useState(0);
  const search = useContext((isSuperAdmin)?searchKeyword:(isAdmin)?searchKeywordAdmin:(isStaff)?searchKeywordStaff:(isTeacher)?searchKeywordTeacher:(isStudent)?searchKeywordStudent:"");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate=useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmIdentityBox,setShowConfirmIdentityBox]=useState(false);
  const [confirmIdentityForm,setConfirmIdentityForm]=useState({password:""});
  const [passwordErrorMsg,setPasswordErrorMsg]=useState("")
  const formRef=useRef(null);
  // Course to delete
  const [courseToDelete,setCourseToDelete]=useState({})

  const handleConfirmIdentityClose=()=>{setShowConfirmIdentityBox(false);setConfirmIdentityForm({password:""});setCourseToDelete("");setPasswordErrorMsg("")}

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
  
  // Handle the course navigation to detail
  const handleNavigation=(id)=>{
    navigate("detail",{state:{firebaseId:id}})
  }

// Handle Form change
  const handleFormChange=(e)=>{
    e.preventDefault();
    setConfirmIdentityForm({...confirmIdentityForm,[e.target.name]:e.target.value});
  }

  // Remove course from students array/side
  const removeCourseFromStudentsArray=(courseFirebaseId,enrolledStudents,courseName)=>{
    for(const studentId of enrolledStudents){
      db.collection("students").doc(studentId).update({
        courses:firebase.firestore.FieldValue.arrayRemove(courseFirebaseId),
        batch:firebase.firestore.FieldValue.arrayRemove(courseName)
      })
    }
  }

// Removing this course from instructor side
  const removeCourseFromInstructorArray=(courseFirebaseId,courseInstructorId,courseName)=>{
    db.collection("teachers").doc(courseInstructorId).update({
      courses:firebase.firestore.FieldValue.arrayRemove(courseFirebaseId),
      coursesname:firebase.firestore.FieldValue.arrayRemove(courseName)
    })
  }

  function deleteStudentFees(ids) {
  
    ids.forEach((id) => {
      const docRef = db.collection('fees').doc(id);
      docRef.delete();
    });
  }
  const deleteCourseStorageFiles =async (course) => {

    // Course Thumbnail
    await firebase.storage().refFromURL(course.courseThumbnail.URL).delete()
    //Course Outline File
    await firebase.storage().refFromURL(course.courseOutlineFile.courseOutlineFileURL).delete()
    if(course.lectureFiles.length!==0){
      course.lectureFiles.map(async(file)=>{
        await firebase.storage().refFromURL(file.fileURL).delete()
      })
    }
    if(course.courseAdditionalDocs.length!==0){
      course.courseAdditionalDocs.map(async(file)=>{
        await firebase.storage().refFromURL(file.additionalFileURL).delete()
      })
    }

    
  };
  

  const deleteCourseRecord=(courseFirebaseId)=>{
    // Get a reference to the Firestore collection
const collectionRef = firebase.firestore().collection("courses");

// Get a reference to the document you want to delete
const docRef = collectionRef.doc(courseFirebaseId);

// Delete the document
docRef.delete()
  .then(() => {
    return;
  })
  .catch((error) => {
    console.error(error);
  });
  }


  const handleCourseDelete = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // If confirmed
    if (window.confirm("Are you sure to delete this course because all related material will be deleted?")) {
      try {
        // Confirm the password
        const user = firebase.auth().currentUser;
        const credentials = firebase.auth.EmailAuthProvider.credential(user.email, confirmIdentityForm.password);
        await user.reauthenticateWithCredential(credentials);
  
        setPasswordErrorMsg("");
  
        // Password is also confirmed so delete everything.
        await deleteCourseStorageFiles(courseToDelete);
  
        // Removing Course from every student side
        if (courseToDelete.enrolledStudents.length !== 0) {
          removeCourseFromStudentsArray(courseToDelete.firebaseId, courseToDelete.enrolledStudents,courseToDelete.courseName);
        }
  // Removing course from instructor side
        if (courseToDelete.courseInstructorId.length !== 0) {
          removeCourseFromInstructorArray(courseToDelete.firebaseId, courseToDelete.courseInstructorId,courseToDelete.courseName);
        }

        await deleteStudentFees(courseToDelete.studentfees);
  
        await deleteCourseRecord(courseToDelete.firebaseId);
        setIsSaving(false);
        handleConfirmIdentityClose();
      } catch (err) {
        setPasswordErrorMsg("Incorrect Password");
        setIsSaving(false);
      }
    }
  };
  



  return (
    <TableContainer component={Paper} className="mt-1">
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell style={{ textDecoration: "none" }} className="text-center">
              Courses
            </StyledTableCell>
            
          </TableRow>
        </TableHead>
        <TableBody className="d-flex flex-wrap justify-content-evenly">
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => {
            return row.courseName.toLowerCase().includes(search.toLowerCase()) || row.courseId.toLowerCase().includes(search.toLowerCase())||
              search.length === 0 ? (
              <StyledTableRow key={row.courseId} >
                {/* Course Card */}
              <Card sx={{ maxWidth: 300 }} >
                <CardActionArea onClick={()=>{handleNavigation(row.firebaseId)}}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`${row.courseThumbnail.URL}`}
                    alt="Course Thumbnail"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {row.courseName}({row.courseId.toUpperCase()})
                    </Typography>
                   
                  </CardContent>
                </CardActionArea>
                 {(showCourseDeleteBtn)? <CardActions >
        <button className="mx-auto btn btn-danger" size="small" onClick={(e)=>{setCourseToDelete(row);setShowConfirmIdentityBox(true)}} >
          Delete
        </button>
        
      </CardActions>:""}

              </Card>
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


      {/* Confirm Identity Box */}
      <Modal
    aria-labelledby="transition-modal-title"
    aria-describedby="transition-modal-description"
    open={showConfirmIdentityBox}
    onClose={handleConfirmIdentityClose}
    closeAfterTransition
    BackdropComponent={Backdrop}
    BackdropProps={{
      timeout: 500,
    }}
  >
    <Fade in={showConfirmIdentityBox}>
      <Box sx={style}>
      <form onSubmit={(e)=>{
        handleCourseDelete(e)
    }} ref={formRef}>
        {/* Title Input*/}
        <div className="d-flex flex-column col">
            <label htmlFor="video-title">
              Password:<span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              className="py-1 px-2 rounded "
              onChange={(e) => {
                handleFormChange(e);
              }}
              required
            ></input>
          </div>
          
          {(passwordErrorMsg.length!==0)?<span className="required">{passwordErrorMsg}</span>:""}

          {/* Save Button */}
          <div className="d-flex justify-content-center mt-2">
          <SaveButton
          color="secondary"
          type="submit"
          loading={isSaving}
          loadingPosition="start"
          startIcon={<DeleteSweepIcon />}
          variant="contained"
          className="w-100"
          onClick={(e)=>{handleCourseDelete(e)}}
        >
          <span>Confirm&Delete</span>
        </SaveButton>
          </div>
        
    </form>
      </Box>
    </Fade>
  </Modal>
    
    </TableContainer>
  ) 
}

export default CoursePagination
