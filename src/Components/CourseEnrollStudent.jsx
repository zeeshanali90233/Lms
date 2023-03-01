import React from "react";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/system";
import LoadingButton from "@mui/lab/LoadingButton";
import { db } from "../Firebase/config";
import firebase from "firebase/compat/app";
import TextField from "@mui/material/TextField";
import moment from "moment";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";

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

const CourseEnrollStudent = ({
  courseFirebaseId,
  courseName,
  showEnrollStudentBox,
  setShowEnrollStudentBox,
}) => {
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [studentToEnrollForm, setStudentToEnrollForm] = useState({});
  const [studentData, setStudentData] = useState("");

  const handleChange = (e) => {
    setStudentToEnrollForm({
      ...studentToEnrollForm,
      [e.target.name]: e.target.value,
    });
    // console.log(studentToEnrollForm);
  };
  const handleShowEnrollStudentBoxClose = () => {setShowEnrollStudentBox(false);setStudentToEnrollForm({}) };

  // It submits the enrollment form/request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const querySnapshot = await db
        .collection("students")
        .where("sid", "==", studentToEnrollForm.sid)
        .get();
      if (querySnapshot.docs.length === 0) {
        setIsSaving(false);
        alert("Incorrect Student ID");
        return;
      }

      const studentData = {
        ...querySnapshot.docs[0].data(),
        firebaseId: querySnapshot.docs[0].id,
      };
      if (
        studentData.courses &&
        studentData.courses.includes(courseFirebaseId)
      ) {
        setIsSaving(false);
        alert("Student is Already Enrolled");
        return;
      }
      
      // Generating a date for fee receipt
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);
      const formattedDate = currentDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      
      const feeReceipt = {
        sid: studentData.sid,
        name: studentData.firstname + " " + studentData.lastname,
        totalfees: studentToEnrollForm.fees,
        noofinstallments: studentToEnrollForm.noofinstallments,
        feepaid: 0,
        feeperinstallment: parseInt(
          studentToEnrollForm.fees / studentToEnrollForm.noofinstallments
          ),
          studentfirebaseid: studentData.firebaseId,
          coursefirebaseid: courseFirebaseId,
          coursename: courseName,
          duedate: moment(studentToEnrollForm.duedate).format('MMM DD, YYYY'),
          remarks:"",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        
       
      // Adding to fees record
      const feedocRef = await db.collection("fees").add(feeReceipt);

      // Updating the students and courses record
      await db
        .collection("students")
        .doc(studentData.firebaseId)
        .update({
          courses: firebase.firestore.FieldValue.arrayUnion(courseFirebaseId),
          batch: firebase.firestore.FieldValue.arrayUnion(courseName),
          coursesfee: firebase.firestore.FieldValue.arrayUnion(feedocRef.id),
        });

      await db
        .collection("courses")
        .doc(courseFirebaseId)
        .update({
          noOfStudents: firebase.firestore.FieldValue.increment(1),
          enrolledStudents: firebase.firestore.FieldValue.arrayUnion(
            studentData.firebaseId
          ),
          studentfees: firebase.firestore.FieldValue.arrayUnion(feedocRef.id),
        });

      setIsSaving(false);
      setShowEnrollStudentBox({});
      setIsSuccessfullyAdded(true);
      setShowEnrollStudentBox(false);
      setTimeout(() => {
        setIsSuccessfullyAdded(false);
      }, 2000);
    } catch (err) {
      setIsSaving(false);
      console.log(err);
      alert("Something Went Wrong");
    }
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={showEnrollStudentBox}
      onClose={handleShowEnrollStudentBoxClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={showEnrollStudentBox}>
        <Box sx={style}>
          <div className="w-100 container mt-1">
            <div className="title bg-dark  text-center text-white w-100 rounded py-1 ">
              <h4 className="text-white">Enrollment</h4>
            </div>
            {isSuccessfullyAdded ? (
              <Alert severity="success">Successfully Added</Alert>
            ) : (
              ""
            )}
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
            >
              <div className="row">
                {/* Student ID Input */}
                <div className="d-flex flex-column col mt-2">
                  <TextField
                    id="outlined-basic"
                    label=" Student ID"
                    type="text"
                    name="sid"
                    title="The input should start with 's' or 'S' followed by 4 characters that can be either letters or numbers."
                    value={studentToEnrollForm.sid}
                    inputProps={{
                      pattern: "[sS][a-zA-Z0-9]{4}",
                    }}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="row">
                {/*Fees Input */}
                <div className="d-flex flex-column col mt-2">
                  <TextField
                    id="outlined-basic"
                    label="Fees"
                    type="number"
                    name="fees"
                    value={studentToEnrollForm.fees}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
                {/* No of installment */}
                <div className="d-flex flex-column col mt-2">
                  <TextField
                    id="outlined-basic"
                    label="No Of Installments"
                    type="number"
                    name="noofinstallments"
                    value={studentToEnrollForm.noofinstallments}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <label htmlFor="duedate">DueDate</label>
                {/* Due Date */}
                <div className="d-flex flex-column col mt-2">
                  <TextField
                    id="outlined-basic"
                    type="date"
                    name="duedate"
                    value={studentToEnrollForm.duedate}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
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
                  <span>Enroll</span>
                </SaveButton>
              </div>
            </form>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CourseEnrollStudent;
