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
import { staffUser } from "../Pages/StaffDashboard";
import ProfilePhotoICON from "../Assets/Logos/ProfilePhotoICON.png";
import MedicalRecordICON from "../Assets/Logos/MedicalRecordICON.png";
import AdditionalFilesICON from "../Assets/Logos/AdditionalFilesICON.png";
import CnicICON from "../Assets/Logos/CnicICON.png";
import EditFormICON from "../Assets/Logos/EditFormICON.png";
import ChangePasswordICON from "../Assets/Logos/ChangePasswordICON.png";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
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

const SuccessAlert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

const staffFormInit = {
  staffid: "",
  firstname: "",
  lastname: "",
  cnic: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  designation: "",
  initsalary: "",
  education: "",
  emergencyname: "",
  emergencyrelationship: "",
  emergencyphone: "",
  staffphoto: "",
  staffcnicphoto: "",
  medicalrecordsphoto: "",
  additionaldocuments: [],
  assignedrole: [],
  courseauthority: { review: false, add: false, edit: false },
  feesauthority: { review: false, add: false, edit: false },
  studentauthority: { review: false, add: false, edit: false },
};

const StaffEditProfile = () => {
  const [staffForm, setStaffForm] = useState(staffFormInit);
  const [staffPhotoURL, setStaffPhotoURL] = useState(
    staffForm && staffForm.staffphoto !== undefined
      ? staffForm.staffphoto.URL
      : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef(null);
  const [staffData, setStaffData] = useState(useContext(staffUser));
  const { firebaseId } = useContext(staffUser);
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
    // Getting the superadmin
    // Only Importing this so that user can see the live changes otherwise the superadmin data is coming from context

    db.collection("staff")
      .doc(firebaseId)
      .onSnapshot((snapshot) => {
        setStaffForm({ ...snapshot.data(), firebaseId: snapshot.id });
        setStaffData({ ...snapshot.data(), firebaseId: snapshot.id });
        setStaffPhotoURL(snapshot.data().staffphoto.URL);
      });
  }, []);
  //   It Validates the date of birth that it should not be the date of today or after
  const validateDob = (value) => {
    const today = new Date();
    const inputDate = new Date(value);

    if (inputDate > today) {
      return false;
    } else {
      return true;
    }
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

  const changePassword = (e) => {
    e.preventDefault();
    setIsSaving(true);
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
          navigate("/staff/login");
        }, 1500);
      })

      .catch((err) => {
        setPasswordBoxErrorMessage("Incorrect Current Password");
      });
      setIsSaving(false);
    return;
  };

  const handleChange = (e) => {
    if (e.target.name === "staffphoto") {
      setStaffForm({ ...staffForm, [e.target.name]: e.target.files[0] });
      setStaffPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else if (
      e.target.name === "staffcnicphoto" ||
      e.target.name === "medicalrecordsphoto"
    ) {
      setStaffForm({ ...staffForm, [e.target.name]: e.target.files[0] });
    } else if (e.target.name === "additionaldocuments") {
      setStaffForm({ ...staffForm, [e.target.name]: e.target.files });
    } else if (e.target.name === "dob") {
      if (validateDob(e.target.value)) {
        setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
      } else {
        alert("Date of birth is not correct!");
        return;
      }
    } else {
      setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const staffRef = db.collection("staff");
    const storageRef = firebase.storage().ref();

    await staffRef.doc(staffForm.firebaseId).update({
      dob: staffForm.dob,
      gender: staffForm.gender,
      address: staffForm.address,
      phone: staffForm.phone,
      email: staffForm.email,
      education: staffForm.education,
      institutename: staffForm.institutename,
      yearofpass: staffForm.yearofpass,
      emergencyname: staffForm.emergencyname,
      emergencyphone: staffForm.emergencyphone,
      emergencyrelationship: staffForm.emergencyrelationship,
    });

    const { staffphoto } = staffForm;

    // Staff Photo
    if (
      JSON.stringify(staffForm.staffphoto) !==
      JSON.stringify(staffData.staffphoto)
    ) {
      await firebase
        .storage()
        .refFromURL(staffData.staffphoto.URL)
        .delete()
        .then(async () => {
          const metadata = {
            contentType: staffphoto.type,
            customMetadata: {
              fileExtension: staffphoto.name.split(".").pop(),
            },
          };
          const staffphotoSnapshot = await storageRef
            .child(`staff/${staffForm.staffid}/staffphoto`)
            .put(staffphoto, { metadata });
          const URL = await staffphotoSnapshot.ref.getDownloadURL();
          let staffphotoURL = { URL, metadata };
          await db.collection("staff").doc(staffForm.firebaseId).update({
            staffphoto: staffphotoURL,
          });
        });
    }

    setIsSaving(false);
    handleClick()
  };

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
    <div className="edit-admin-form w-100 ">
      <div className="title bg-dark  text-center text-white w-100">
        <h5 className="text-white">Files</h5>
      </div>
      {/* Panels */}
      <div className="container">
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
      {!isObjectEmpty(staffForm) ? (
        <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly ">
          {/* Profile Photo */}
          {staffForm && staffForm.staffphoto !== "" ? (
            <button
              className="panel border profilephoto d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  staffData.staffphoto,
                  `${
                    staffData.firstname.toUpperCase() +
                    " " +
                    staffData.lastname.toUpperCase() +
                    "(" +
                    staffData.eid +
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

          {/* Super Admin CNIC */}
          {staffForm && staffForm.staffcnicphoto !== "" ? (
            <button
              className="panel border cnic d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  staffData.staffcnicphoto,
                  `${
                    staffData.firstname.toUpperCase() +
                    " " +
                    staffData.lastname.toUpperCase() +
                    "CNIC" +
                    "(" +
                    staffData.eid +
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

          {/* Medical Records */}
          {staffForm && staffForm.medicalrecordsphoto.length !== 0 ? (
            <button
              className="panel border medicalrecords d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  staffData.medicalrecordsphoto,
                  `${
                    staffData.firstname.toUpperCase() +
                    " " +
                    staffData.lastname.toUpperCase() +
                    "MedicalRecord" +
                    "(" +
                    staffData.eid +
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
          {staffForm && staffForm.additionaldocuments.length !== 0 ? (
            <button
              className="panel border additionalfiles d-flex px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                staffData.additionaldocuments.forEach((eachFile, index) => {
                  handleDownload(
                    eachFile,
                    `${
                      staffData.firstname.toUpperCase() +
                      " " +
                      staffData.lastname.toUpperCase() +
                      "AdditionalFile " +
                      index +
                      1 +
                      "(" +
                      staffData.eid +
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

      {/* Further Edit Box */}
      {showFurtherEditBox ? (
        <>
          {/* Success Message Toaster */}
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={open}
            onClose={handleClose}
            autoHideDuration={1500}
            key={vertical + horizontal}
          >
            <Alert
              onClose={handleClose}
              severity="success"
              sx={{ width: "100%" }}
            >
              Successfully Added
            </Alert>
          </Snackbar>
          <div>
            <h2 className="text-center">Staff Edit Form</h2>
          </div>
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            className="container"
            ref={formRef}
          >
            {/*Admin Photo */}
            <div className=" d-flex justify-content-center me-auto">
              <div>
                <img
                  className="rounded"
                  src={staffPhotoURL !== "" ? staffPhotoURL : emptyProfile}
                  alt="staffphoto "
                  width={130}
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="input-group mb-3">
                <input
                  type="file"
                  className="form-control"
                  id="staffphoto"
                  name="staffphoto"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                ></input>
              </div>
            </div>
            {/* Main Information */}
            <div className="row">
              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="Staff ID"
                  variant="outlined"
                  inputProps={{
                    pattern: "[eE][a-zA-Z0-9]{4}",
                  }}
                  type="text"
                  name="staffid"
                  placeholder="e1234"
                  title="The input should start with 'e' or 'E' followed by 4 characters that can be either letters or numbers."
                  value={staffForm.staffid}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  disabled
                />
              </div>
            </div>

            <div className="row mt-2">
              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="First Name"
                  variant="outlined"
                  type="text"
                  name="firstname"
                  placeholder="Andaleep"
                  value={staffForm.firstname}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  disabled
                />
              </div>

              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="Last Name"
                  variant="outlined"
                  type="text"
                  name="lastname"
                  placeholder="Khan"
                  value={staffForm.lastname}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  disabled
                />
              </div>
            </div>
            <div className="row">
              <div className="d-flex flex-column col">
                <InputLabel id="demo-simple-select-helper-label">
                  Date of Birth *
                </InputLabel>
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  type="date"
                  name="dob"
                  value={staffForm.dob}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                />
              </div>
              <div className="d-flex flex-column col">
                <InputLabel id="demo-simple-select-helper-label">
                  Gender *
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  name="gender"
                  value={staffForm.gender}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                >
                  <MenuItem value={""}>Select Gender</MenuItem>
                  <MenuItem value={"male"}>Male</MenuItem>
                  <MenuItem value={"female"}>Female</MenuItem>
                  <MenuItem value={"other"}>Other</MenuItem>
                </Select>
              </div>
            </div>
            <div className="d-flex flex-column ">
              <label htmlFor="address">
                Address:<span className="required">*</span>
              </label>
              <textarea
                type="text"
                id="address"
                name="address"
                placeholder="street#2 Bhopal, India"
                className="py-1 px-2 rounded "
                value={staffForm.address}
                onChange={(e) => {
                  handleChange(e);
                }}
              ></textarea>
            </div>

            <div className="row mt-2">
              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="Phone Number"
                  variant="outlined"
                  type="tel"
                  name="phone"
                  placeholder="03xxxxxxxxx"
                  value={staffForm.phone}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                />
              </div>
            </div>

            <div className="row mt-2">
              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="CNIC"
                  variant="outlined"
                  type="text"
                  name="cnic"
                  inputProps={{ pattern: "[0-9]{5}-[0-9]{7}-[0-9]" }}
                  placeholder="xxxxx-xxxxxxx-x"
                  value={staffForm.cnic}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  disabled
                />
              </div>

              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="Email"
                  variant="outlined"
                  type="email"
                  name="email"
                  value={staffForm.email}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                />
              </div>
            </div>

            {/*Qualification */}
            <div className="mt-2">
              <h3 className="text-center">Qualification</h3>
              <div className="row">
                <div className="d-flex flex-column col">
                  <InputLabel id="demo-simple-select-helper-label">
                    Education*
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-helper-label"
                    name="education"
                    id="eduacation"
                    value={staffForm.education}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  >
                    <MenuItem value={""}>Select Education Level</MenuItem>
                    <MenuItem value={"matric"}>Matric</MenuItem>
                    <MenuItem value={"intermediate"}>Intermediate</MenuItem>
                    <MenuItem value={"graduated"}>Graduated</MenuItem>
                  </Select>
                </div>
              </div>
              <div className="row mt-1">
                <div className="d-flex flex-column col mt-4">
                  <TextField
                    id="outlined-basic"
                    label="Institute Name"
                    variant="outlined"
                    type="text"
                    name="institutename"
                    placeholder="IIT India"
                    value={staffForm.institutename}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>

                <div className="d-flex flex-column col ">
                  <InputLabel id="demo-simple-select-helper-label">
                    Year of passing
                  </InputLabel>
                  <TextField
                    id="outlined-basic"
                    variant="outlined"
                    type="date"
                    name="yearofpass"
                    value={staffForm.yearofpass}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="mt-2">
              <h3 className="text-center">Emergency Contact Form</h3>
              <div className="row">
                <div className="d-flex flex-column col">
                  <TextField
                    id="outlined-basic"
                    label="Name"
                    variant="outlined"
                    type="text"
                    name="emergencyname"
                    placeholder="Ali"
                    value={staffForm.emergencyname}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="row mt-2">
                <div className="d-flex flex-column col">
                  <TextField
                    id="outlined-basic"
                    label="Relationship"
                    variant="outlined"
                    type="text"
                    name="emergencyrelationship"
                    placeholder="brother"
                    value={staffForm.emergencyrelationship}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
                <div className="d-flex flex-column col">
                  <TextField
                    id="outlined-basic"
                    label="Phone Number"
                    variant="outlined"
                    type="tel"
                    name="emergencyphone"
                    placeholder="03xxxxxxxxx"
                    value={staffForm.emergencyphone}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row mb-5 mt-3 ">
              <div className="d-flex justify-content-center ">
                <SaveButton
                  color="secondary"
                  type="submit"
                  loading={isSaving}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="contained"
                  className="w-100"
                >
                  <span>Save</span>
                </SaveButton>
              </div>
            </div>
          </form>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default StaffEditProfile;
