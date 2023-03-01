import React from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { db } from "../Firebase/config";
import { useState, useRef } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/system";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { useContext } from "react";
import { useEffect } from "react";
import ProfilePhotoICON from "../Assets/Logos/ProfilePhotoICON.png";
import DegreeFileICON from "../Assets/Logos/DegreeFileICON.png";
import MedicalRecordICON from "../Assets/Logos/MedicalRecordICON.png";
import AdditionalFilesICON from "../Assets/Logos/AdditionalFilesICON.png";
import CnicICON from "../Assets/Logos/CnicICON.png";
import EditFormICON from "../Assets/Logos/EditFormICON.png";
import ChangePasswordICON from "../Assets/Logos/ChangePasswordICON.png";
import { studentUser } from "../Pages/StudentDashboard";
// MUI Modal Component
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate } from "react-router-dom";

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

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

// Student Form Attributes
const studentFormInit = {
  sid: "",
  firstname: "",
  lastname: "",
  cnic: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  parentname: "",
  parentphone: "",
  parentemail: "",
  parentcnic: "",
  totalfees: "",
  noofintallments: 1,
  courses: [],
  emergencyname: "",
  emergencyrelationship: "",
  emergencyphone: "",
  previousschoolname: "",
  previousschooladdress: "",
  studentphoto: "",
  studentcnicphoto: "",
  parentcnicphoto: "",
  medicalrecordsphoto: "",
  additionaldocuments: [],
  assignedtask: [],
  type: "student",
  enrolleddate: "",
};

const StudentEditProfile = () => {
  const [studentForm, setStudentForm] = useState(studentFormInit);
  const [studentPhotoURL, setStudentPhotoURL] = useState(""); //Student Photo URL
  const [isSaving, setIsSaving] = useState(false); //Is Form saving
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);
  const [studentData, setStudentData] = useState(useContext(studentUser));
  const { firebaseId } = useContext(studentUser);
  // Panels
  const [showFurtherEditBox, setShowFurtherEditBox] = useState(false);
  const [showChangePasswordBox, setShowChangePasswordBox] = useState(false);
  // Password Change States
  const [passwordBoxErrorMessage, setPasswordBoxErrorMessage] = useState("");
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currpassword: "",
    newpassword: "",
    confirmpassword: "",
  });

  const [passwordChangedSuccessMessage, setPasswordChangedSuccessMessage] =
    useState("");

  // Navigation
  const navigate = useNavigate();
  const handleChangePasswordBoxClose = () => {
    setShowChangePasswordBox(false);
    setPasswordBoxErrorMessage("");
    setPasswordChangeForm({
      currpassword: "",
      newpassword: "",
      confirmpassword: "",
    });
  };

  useEffect(() => {
    db.collection("students")
      .doc(firebaseId)
      .onSnapshot((snapshot) => {
        setStudentForm({ ...snapshot.data(), firebaseId: snapshot.id });
        setStudentData({ ...snapshot.data(), firebaseId: snapshot.id });
        setStudentPhotoURL(snapshot.data().studentphoto.URL);
      });
  }, []);

  // It handles the form changes
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordChangeForm({
      ...passwordChangeForm,
      [e.target.name]: e.target.value,
    });
    if (
      e.target.name == "confirmpassword" &&
      passwordChangeForm.newpassword !== e.target.value
    ) {
      setPasswordBoxErrorMessage("New and Confirm Password Should Be Same");
    } else if (
      e.target.name == "confirmpassword" &&
      passwordChangeForm.newpassword === e.target.value
    ) {
      setPasswordBoxErrorMessage("");
    }
  };

  // It changes the password
  const changePassword = (e) => {
    e.preventDefault();
    setIsSaving(false);
    if (
      passwordChangeForm.newpassword !== passwordChangeForm.confirmpassword ||
      !validatePassword(passwordChangeForm.newpassword)
    ) {
      setPasswordBoxErrorMessage(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
      );
      return;
    }

    setPasswordBoxErrorMessage("");
    const user = firebase.auth().currentUser;
    const credentials = firebase.auth.EmailAuthProvider.credential(
      user.email,
      passwordChangeForm.currpassword
    );
    user
      .reauthenticateWithCredential(credentials)
      .then(() => {
        user.updatePassword(passwordChangeForm.newpassword);
      })
      .then(() => {
        setPasswordChangedSuccessMessage("Password Changed Successfully");
        setTimeout(() => {
          setIsSaving(false);
          setPasswordChangedSuccessMessage("");
          handleChangePasswordBoxClose();
          firebase.auth().signOut();
          navigate("/student/login");
        }, 1500);
      })

      .catch((err) => {
        setPasswordBoxErrorMessage("Incorrect Current Password");
      });
    return;
  };

  const isObjectEmpty = (objectName) => {
    return JSON.stringify(objectName) === "{}";
  };

  // It Validates the password
  function validatePassword(password) {
    // Check if password meets minimum length requirement
    if (password.length < 8) {
      return false;
    }

    // Check if password contains at least one uppercase letter, one lowercase letter, one number, and one special character
    var regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (!regex.test(password)) {
      return false;
    }

    // Password meets all requirements
    return true;
  }

  // It downloads the files
  const handleDownload = (file, fileTitle = "") => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", file.URL, true);
    xhr.responseType = "blob";
    xhr.onload = function (event) {
      const blob = xhr.response;
      // Set the content-disposition header to specify the original file type and extension
      const contentDispositionHeader = `attachment; filename=${fileTitle}.${file.metadata.customMetadata.fileExtension};`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileTitle}.${file.metadata.customMetadata.fileExtension}`;
      link.setAttribute("style", "display: none;");
      link.setAttribute(
        "download",
        `${fileTitle}.${file.metadata.customMetadata.fileExtension}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    xhr.send();
  };

  return (
    <div className="add-student-form container mt-2 w-100 ">
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div className="title bg-dark  text-center text-white w-100">
        <h5 className="text-white">Files</h5>
      </div>
      {/* Panels */}
      <div>
        {/* Change Password  */}
        <div
          className="panel border edit d-flex flex-column px-1 py-1 align-items-center rounded justify-content-center"
          onClick={() => {
            setShowChangePasswordBox(!showChangePasswordBox);
            setShowFurtherEditBox(false);
          }}
        >
          <div className="icon">
            <img src={ChangePasswordICON} alt="" width={30} />
          </div>
          <div className="text-dark text">Change Password</div>
        </div>

        {/* Further Edit Form  */}
        <div
          className="panel border edit d-flex flex-column px-1 py-1 align-items-center rounded justify-content-center"
          onClick={() => {
            setShowChangePasswordBox(false);
            setShowFurtherEditBox(!showFurtherEditBox);
          }}
        >
          <div className="icon">
            <img src={EditFormICON} alt="" width={30} />
          </div>
          <div className="text-dark text">Edit Further</div>
        </div>
      </div>
      {/* File Download Buttons */}
      {!isObjectEmpty(studentForm) ? (
        <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">
          {/* Profile Photo */}
          {studentForm && studentForm.studentphoto !== "" ? (
            <button
              className="panel border profilephoto d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  studentForm.studentphoto,
                  `${
                    studentForm.firstname.toUpperCase() +
                    " " +
                    studentForm.lastname.toUpperCase() +
                    "(" +
                    studentForm.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={ProfilePhotoICON} alt="" width={30} />
              </div>
              <h5 className="text-dark text">Profile Photo</h5>
            </button>
          ) : (
            ""
          )}

          {/*student CNIC */}
          {studentForm && studentForm.studentcnicphoto !== "" ? (
            <button
              className="panel border cnic d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  studentForm.studentcnicphoto,
                  `${
                    studentForm.firstname.toUpperCase() +
                    " " +
                    studentForm.lastname.toUpperCase() +
                    "CNIC" +
                    "(" +
                    studentForm.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CnicICON} alt="" width={30} />
              </div>
              <h5 className="text-dark text">CNIC</h5>
            </button>
          ) : (
            ""
          )}

          {/* Parent/Guardian CNIC*/}
          {studentForm && studentForm.parentcnicphoto !== "" ? (
            <button
              className="panel border parentcnic d-flex px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  studentForm.parentcnicphoto,
                  `${
                    studentForm.firstname.toUpperCase() +
                    " " +
                    studentForm.lastname.toUpperCase() +
                    "DegreeFile" +
                    "(" +
                    studentForm.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CnicICON} alt="" width={30} />
              </div>
              <h5 className="text-dark text">Parent/Guardian CNIC</h5>
            </button>
          ) : (
            ""
          )}

          {/* Medical Records */}
          {studentForm && studentForm.medicalrecordsphoto.length !== 0 ? (
            <button
              className="panel border medicalrecords d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  studentForm.medicalrecordsphoto,
                  `${
                    studentForm.firstname.toUpperCase() +
                    " " +
                    studentForm.lastname.toUpperCase() +
                    "MedicalRecord" +
                    "(" +
                    studentForm.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={MedicalRecordICON} alt="" width={30} />
              </div>
              <h5 className="text-dark text"> Medical Records</h5>
            </button>
          ) : (
            ""
          )}

          {/* Additional Records */}
          {studentForm && studentForm.additionaldocuments.length !== 0 ? (
            <button
              className="panel border additionalfiles d-flex px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                studentForm.additionaldocuments.forEach((eachFile, index) => {
                  handleDownload(
                    eachFile,
                    `${
                      studentForm.firstname.toUpperCase() +
                      " " +
                      studentForm.lastname.toUpperCase() +
                      "AdditionalFile " +
                      index +
                      1 +
                      "(" +
                      studentForm.sid +
                      ")"
                    }`
                  );
                });
              }}
            >
              <div className="icon">
                <img src={AdditionalFilesICON} alt="" width={30} />
              </div>
              <h5 className="text-dark text">Additional Files</h5>
            </button>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}

      {/* Change Password Box */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showChangePasswordBox}
        onClose={handleChangePasswordBoxClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showChangePasswordBox}>
          <Box sx={style}>
            <form
              onSubmit={(e) => {
                changePassword(e);
              }}
              ref={formRef}
            >
              {passwordChangedSuccessMessage !== "" ? (
                <Alert severity="success">
                  {passwordChangedSuccessMessage}
                </Alert>
              ) : (
                ""
              )}
              {/* Current Password*/}
              <div className="d-flex flex-column col">
                <TextField
                  id="currpassword"
                  label="Current Password"
                  variant="outlined"
                  type="password"
                  placeholder="Enter the current password"
                  name="currpassword"
                  onChange={(e) => {
                    handlePasswordChange(e);
                  }}
                  required
                />
              </div>
              {/*New Password*/}
              <div className="d-flex flex-column col mt-2">
                <TextField
                  id="newpassword"
                  label="New Password"
                  variant="outlined"
                  type="password"
                  placeholder="Enter the new password"
                  name="newpassword"
                  onChange={(e) => {
                    handlePasswordChange(e);
                  }}
                  required
                />
              </div>
              {/* Confirm Password */}
              <div className="d-flex flex-column col mt-2">
                <TextField
                  id="confirmpassword"
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmpassword"
                  onChange={(e) => {
                    handlePasswordChange(e);
                  }}
                  required
                />
              </div>
              {passwordBoxErrorMessage !== "" ? (
                <span className="required">{passwordBoxErrorMessage}</span>
              ) : (
                ""
              )}

              {/* Save Button */}
              <div className="d-flex justify-content-center mt-2">
                <SaveButton
                  color="secondary"
                  type="submit"
                  loading={isSaving}
                  loadingPosition="start"
                  startIcon={<VpnKeyIcon />}
                  variant="contained"
                  className="w-100"
                >
                  <span>Change Password</span>
                </SaveButton>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default StudentEditProfile;
