import React from "react";
import Alert from "@mui/material/Alert";
import { useState, useEffect } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/system";
import LoadingButton from "@mui/lab/LoadingButton";
import { db } from "../Firebase/config";
import firebase from "firebase/compat/app";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import TextField from "@mui/material/TextField";
import CreateLecutureAttendenceICON from "../Assets/Logos/CreateLecutureAttendenceICON.png";
// Moment JS for date
import moment from "moment";
import AttendancePagination from "./AttendancePagination";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SuccessAlert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

// Modal MUI Style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "1px solid #0086c9",
  borderRadius: "23px",
  boxShadow: 24,
  p: 4,
};

const CourseAttendence = ({ course, showCreateLectureButton }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [enrolledStudentData, setEnrolledStudentData] = useState([]);
  const [showCreateLectureBox, setShowCreateLectureBox] = useState(false);
  const [createLectureForm, setCreateLectureForm] = useState({
    lecturenumber: 0,
    lecturedate: moment(new Date()).format("YYYY-MM-DD"),
  });
  const [alertState, setAlertState] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "right",
  });
  const { vertical, horizontal, open } = alertState;

  const handleCreateLectureBoxClose = () => {
    setShowCreateLectureBox(false);
  };

  useEffect(() => {
    const fetchEnrolledStudentData = async () => {
      const enrolledStudentDataArray = [];
      for (const studentFirebaseId of course.enrolledStudents) {
        await db
          .collection("students")
          .doc(studentFirebaseId)
          .onSnapshot((snapshot) => {
            enrolledStudentDataArray.push({
              ...snapshot.data(),
              firebaseId: snapshot.id,
            });
          });
      }
      setEnrolledStudentData(enrolledStudentDataArray);
    };

    fetchEnrolledStudentData();
  }, []);

  // For Success Toast
  const handleClick = () => {
    setAlertState({ ...alertState, open: true });
  };
  const handleClose = () => {
    setAlertState({ ...alertState, open: false });
  };

  const handleChange = (e) => {
    e.preventDefault();
    setCreateLectureForm({
      ...createLectureForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let attendanceObject = {
      date: moment(createLectureForm.lecturedate).format("DD-MMM-YY"),
      lecturenumber: createLectureForm.lecturenumber,
      attendance: {},
    };

    for (const enrolledStudent of enrolledStudentData) {
      attendanceObject.attendance = {
        ...attendanceObject.attendance,
        [enrolledStudent.sid]: true,
      };
    }

    await db
      .collection("courses")
      .doc(course.firebaseId)
      .update({
        attendance: firebase.firestore.FieldValue.arrayUnion({
          ...attendanceObject,
        }),
        noOfLecturesDelivered: firebase.firestore.FieldValue.increment(1),
      });

    handleClick();
    setIsSaving(false);
    setCreateLectureForm({
      lecturenumber: 0,
      lecturedate: moment(new Date()).format("YYYY-MM-DD"),
    });
    handleCreateLectureBoxClose();
  };

  return (
    <div className="attendanceside w-100 container mt-1">
      <div className="title bg-dark  text-center text-white  rounded">
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
            Successfully Added
          </SuccessAlert>
        </Snackbar>
        <h3 className="text-white">Course Attendence</h3>
      </div>
      {/* Create Lecture Button */}
      <div
        className="panel border attendance mt-1 d-flex py-2 align-items-center rounded justify-content-center user-select-none"
        onClick={() => {
          setShowCreateLectureBox(!showCreateLectureBox);
        }}
      >
        <div className="icon">
          <img src={CreateLecutureAttendenceICON} alt="" width={30} />
        </div>
        <h5 className="text-dark text ps-1">Create Lecture</h5>
      </div>

      {/* Attendence Pagination */}
      {course.attendance && course.attendance.length !== 0 ? (
        <AttendancePagination
          data={enrolledStudentData}
          attendanceData={course.attendance}
          courseFirebaseId={course.firebaseId}
        />
      ) : (
        ""
      )}

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showCreateLectureBox}
        onClose={handleCreateLectureBoxClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showCreateLectureBox}>
          <Box sx={style}>
            <div className="w-100 container mt-1">
              <div className="title bg-dark  text-center text-white w-100 rounded py-1 ">
                <h4 className="text-white">Lecture Detail</h4>
              </div>

              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
              >
                {/*Lecture Number Input */}
                <div className="d-flex flex-column col mt-2">
                  <TextField
                    type="number"
                    id="outlined-basic"
                    label="Lecture Number"
                    variant="outlined"
                    inputProps={{
                      min: "0",
                    }}
                    name="lecturenumber"
                    placeholder="Enter the Lecture Number"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
                {/*Lecture Date */}
                <div className="d-flex flex-column col">
                  <label htmlFor="lecturedate">Lecture Date(MM/DD/YYYY)</label>
                  <TextField
                    type="date"
                    id="outlined-basic"
                    variant="outlined"
                    value={createLectureForm.lecturedate}
                    name="lecturedate"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>

                {/* Save Button */}
                <div className="d-flex justify-content-center mt-2">
                  <SaveButton
                    color="secondary"
                    type="submit"
                    loading={isSaving}
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    variant="contained"
                    className="w-100"
                  >
                    <span>Create</span>
                  </SaveButton>
                </div>
              </form>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default CourseAttendence;
