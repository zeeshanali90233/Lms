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
import { teacherUser } from "../Pages/TeacherDashboard";
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

// Teacher Form Init
const teacherFormInit = {
  tid: "",
  firstname: "",
  lastname: "",
  cnic: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  doj: "",
  initsalary: "",
  designation: "",
  courses: [],
  emergencyname: "",
  emergencyrelationship: "",
  emergencyphone: "",
  teacherphoto: "",
  teachercnicphoto: "",
  degreefile: "",
  medicalrecordsphoto: "",
  cv: "",
  additionaldocuments: [],
  type: "teacher",
  assignedrole: [],
};

const TeacherEditProfile = () => {
  const [teacherForm, setTeacherForm] = useState(teacherFormInit);
  const [teacherPhotoURL, setTeacherPhotoURL] = useState(
    teacherForm && teacherForm.teacherphoto !== undefined
      ? teacherForm.teacherphoto.URL
      : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);
  const [teacherData, setTeacherData] = useState(useContext(teacherUser));
  const { firebaseId } = useContext(teacherUser);
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
    db.collection("teachers")
      .doc(firebaseId)
      .onSnapshot((snapshot) => {
        setTeacherForm({ ...snapshot.data(), firebaseId: snapshot.id });
        setTeacherData({ ...snapshot.data(), firebaseId: snapshot.id });
        setTeacherPhotoURL(snapshot.data().teacherphoto.URL);
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
          navigate("/teacher/login");
        }, 1500);
      })

      .catch((err) => {
        setPasswordBoxErrorMessage("Incorrect Current Password");
      });
    return;
  };

  const handleChange = (e) => {
    if (e.target.name === "teacherphoto") {
      setTeacherForm({
        ...teacherForm,
        [e.target.name]: e.target.files[0],
      });
      setTeacherPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else if (
      e.target.name === "teachercnicphoto" ||
      e.target.name === "medicalrecordsphoto" ||
      e.target.name === "degreefile" ||
      e.target.name === "cv"
    ) {
      setTeacherForm({
        ...teacherForm,
        [e.target.name]: e.target.files[0],
      });
    } else if (e.target.name === "additionaldocuments") {
      setTeacherForm({ ...teacherForm, [e.target.name]: e.target.files });
    } else if (e.target.name === "dob") {
      if (validateDob(e.target.value)) {
        setTeacherForm({
          ...teacherForm,
          [e.target.name]: e.target.value,
        });
      } else {
        alert("Date of birth is not correct!");
        return;
      }
    } else {
      setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
    }
    // console.log(teacherForm)
  };

  // It handles the edit further form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const teacherRef = db.collection("teachers");
    // Create a storage reference
    const storageRef = firebase.storage().ref();

    // Taking the files
    const { teacherphoto } = teacherForm;

    await teacherRef.doc(firebaseId).update({
      firstname: teacherForm.firstname,
      lastname: teacherForm.lastname,
      dob: teacherForm.dob,
      gender: teacherForm.gender,
      address: teacherForm.address,
      email: teacherForm.email,
      phone: teacherForm.phone,
      institutename: teacherForm.institutename,
      passingyear: teacherForm.passingyear,
      degree: teacherForm.degree,
      obtgpa: teacherForm.obtgpa,
      emergencyname: teacherForm.emergencyname,
      emergencyphone: teacherForm.emergencyphone,
      emergencyrelationship: teacherForm.emergencyrelationship,
    });

    // Profile Photo
    if (teacherForm.teacherphoto.URL === undefined) {
      const metadata = {
        contentType: teacherphoto.type,
        customMetadata: {
          fileExtension: teacherphoto.name.split(".").pop(),
        },
      };
      if (teacherData.teacherphoto.length !== 0) {
        await firebase
          .storage()
          .refFromURL(teacherData.teacherphoto.URL)
          .delete()
          .then(async () => {
            const teacherphotoSnapshot = await storageRef
              .child(`teacher/${teacherForm.tid}/teacherphoto`)
              .put(teacherphoto);
            let URL = await teacherphotoSnapshot.ref.getDownloadURL();
            let teacherphotoURL = { URL, metadata };
            await teacherRef.doc(firebaseId).update({
              teacherphoto: teacherphotoURL,
            });
          });
      } else {
        const teacherphotoSnapshot = await storageRef
          .child(`teacher/${teacherForm.tid}/teacherphoto`)
          .put(teacherphoto);
        let URL = await teacherphotoSnapshot.ref.getDownloadURL();
        let teacherphotoURL = { URL, metadata };
        await teacherRef.doc(firebaseId).update({
          teacherphoto: teacherphotoURL,
        });
      }
    }

    setIsSaving(false);
    setIsSuccessfullyAdded(true);
    // formRef.current.reset();
    // Setting student form to init
    console.log("SuccessFully Added");
    setTimeout(() => {
      // Removing the alert from top after 2s
      setIsSuccessfullyAdded(false);
    }, 5000);
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
      {!isObjectEmpty(teacherForm) ? (
        <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">
          {/* Profile Photo */}
          {teacherForm && teacherForm.teacherphoto !== "" ? (
            <button
              className="panel border profilephoto d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacherForm.teacherphoto,
                  `${
                    teacherForm.firstname.toUpperCase() +
                    " " +
                    teacherForm.lastname.toUpperCase() +
                    "(" +
                    teacherForm.tid +
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

          {/* teacher  CNIC */}
          {teacherForm && teacherForm.teachercnicphoto !== "" ? (
            <button
              className="panel border cnic d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacherForm.teachercnicphoto,
                  `${
                    teacherForm.firstname.toUpperCase() +
                    " " +
                    teacherForm.lastname.toUpperCase() +
                    "CNIC" +
                    "(" +
                    teacherForm.tid +
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

          {/* Degree*/}
          {teacherForm && teacherForm.degreefile !== "" ? (
            <button
              className="panel border parentcnic d-flex px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacherForm.degreefile,
                  `${
                    teacherForm.firstname.toUpperCase() +
                    " " +
                    teacherForm.lastname.toUpperCase() +
                    "DegreeFile" +
                    "(" +
                    teacherForm.tid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={DegreeFileICON} alt="" width={30} />
              </div>
              <h5 className="text-dark text">Degree</h5>
            </button>
          ) : (
            ""
          )}

          {/* CV*/}
          {teacherForm && teacherForm.cv.length !== 0 ? (
            <button
              className="panel border parentcnic d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacherForm.cv,
                  `${
                    teacherForm.firstname.toUpperCase() +
                    " " +
                    teacherForm.lastname.toUpperCase() +
                    "DegreeFile" +
                    "(" +
                    teacherForm.tid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={DegreeFileICON} alt="" width={30} />
              </div>
              <h5 className="text-dark text">CV</h5>
            </button>
          ) : (
            ""
          )}

          {/* Medical Records */}
          {teacherForm && teacherForm.medicalrecordsphoto.length !== 0 ? (
            <button
              className="panel border medicalrecords d-flex  px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacherForm.medicalrecordsphoto,
                  `${
                    teacherForm.firstname.toUpperCase() +
                    " " +
                    teacherForm.lastname.toUpperCase() +
                    "MedicalRecord" +
                    "(" +
                    teacherForm.tid +
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
          {teacherForm && teacherForm.additionaldocuments.length !== 0 ? (
            <button
              className="panel border additionalfiles d-flex px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                teacherForm.additionaldocuments.forEach((eachFile, index) => {
                  handleDownload(
                    eachFile,
                    `${
                      teacherForm.firstname.toUpperCase() +
                      " " +
                      teacherForm.lastname.toUpperCase() +
                      "AdditionalFile " +
                      index +
                      1 +
                      "(" +
                      teacherForm.tid +
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

      {showFurtherEditBox ? (
        <>
          {" "}
          <div>
            <h2 className="text-center">Instructor Admission Form</h2>
          </div>
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            ref={formRef}
          >
            {/* Student Photo */}
            <div className=" d-flex justify-content-center me-auto">
              <div>
                <img
                  src={teacherPhotoURL !== "" ? teacherPhotoURL : emptyProfile}
                  alt="teacherPicture "
                  width={130}
                  className="rounded"
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="input-group mb-3">
                <input
                  type="file"
                  className="form-control"
                  id="teacherphoto"
                  name="teacherphoto"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                ></input>
              </div>
            </div>
            {/* Main Teacher Information */}
            <div className="row">
              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="Teacher ID"
                  variant="outlined"
                  type="text"
                  name="tid"
                  title="The input should start with 't' or 'T' followed by 4 characters that can be either letters or numbers."
                  inputProps={{
                    pattern: "[tT][a-zA-Z0-9]{4}",
                  }}
                  placeholder="t1234"
                  value={teacherForm.tid}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  disabled
                  required
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
                  placeholder="Mukesh"
                  value={teacherForm.firstname}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                />
              </div>

              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="Last Name"
                  variant="outlined"
                  type="text"
                  name="lastname"
                  placeholder="khan"
                  value={teacherForm.lastname}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="d-flex flex-column col">
                <label htmlFor="">Date Of Birth</label>
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  type="date"
                  name="dob"
                  value={teacherForm.dob}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                />
              </div>
              <div className="d-flex flex-column col">
                <InputLabel id="demo-simple-select-helper-label">
                  Gender *
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  name="gender"
                  value={teacherForm.gender}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                >
                  {/* <MenuItem value={""}>Select Gender</MenuItem> */}
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
                placeholder="street#2 washington, America "
                className="py-1 px-2 rounded "
                value={teacherForm.address}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
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
                  value={teacherForm.phone}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                />
              </div>

              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="CNIC"
                  variant="outlined"
                  type="text"
                  name="cnic"
                  inputProps={{ pattern: "[0-9]{5}-[0-9]{7}-[0-9]" }}
                  placeholder="xxxxx-xxxxxxx-x"
                  value={teacherForm.cnic}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  disabled
                  required
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="d-flex flex-column col">
                <TextField
                  id="outlined-basic"
                  label="Email"
                  variant="outlined"
                  type="email"
                  name="email"
                  value={teacherForm.email}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                />
              </div>
            </div>

            {/* Qualification */}
            <div className="mt-2">
              <h3 className="text-center">Qualification</h3>

              <div className="row">
                <div className="d-flex flex-column col">
                  <TextField
                    id="outlined-basic"
                    label="Degree"
                    variant="outlined"
                    type="text"
                    name="degree"
                    placeholder="BS(CS)"
                    value={teacherForm.degree}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
              </div>
              <div className="row mt-2">
                <div className="d-flex flex-column col">
                  <TextField
                    id="outlined-basic"
                    label="Institute Name"
                    variant="outlined"
                    type="text"
                    name="institutename"
                    placeholder="IIT,India"
                    value={teacherForm.institutename}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="d-flex flex-column col">
                  <label htmlFor="passingyear">
                    Pasing Year:<span className="required">*</span>
                  </label>
                  <TextField
                    id="outlined-basic"
                    variant="outlined"
                    type="date"
                    name="passingyear"
                    value={teacherForm.passingyear}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
                <div className="d-flex flex-column col mt-4">
                  <TextField
                    id="outlined-basic"
                    label="Obtained CGPA"
                    variant="outlined"
                    inputProps={{ min: 0 }}
                    type="number"
                    name="obtgpa"
                    placeholder="3.8"
                    value={teacherForm.obtgpa}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
              </div>
            </div>
            {/* Course Allotment */}
            <div className="mt-2">
              <h3 className="text-center">Designation</h3>

              <div className="row mt-2">
                <div className="d-flex flex-column col">
                  <TextField
                    label="Designation"
                    type="text"
                    id="designation"
                    name="designation"
                    value={teacherForm.designation}
                    placeholder="Professor"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    disabled
                    autoFocus
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="d-flex flex-column col">
                <label htmlFor="doj">
                  Date of joining:<span className="required">*</span>
                </label>
                <TextField
                  type="date"
                  name="doj"
                  id="doj"
                  value={teacherForm.doj}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  disabled
                />
              </div>
              <div className="d-flex flex-column col mt-4">
                <TextField
                  type="number"
                  label="Salary"
                  id="init_salary"
                  name="initsalary"
                  placeholder="50000"
                  value={teacherForm.initsalary}
                  inputProps={{ min: 0 }}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                  disabled
                />
              </div>
            </div>
            {/* Emergency Contact Section */}
            <div className="mt-2">
              <h3 className="text-center">Emergency Contact Form</h3>
              <div className="row">
                <div className="d-flex flex-column col">
                  <TextField
                    label="Name"
                    type="text"
                    id="emergency-name"
                    name="emergencyname"
                    placeholder="Ansoo"
                    value={teacherForm.emergencyname}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="d-flex flex-column col">
                <TextField
                  label="Relationship"
                  type="text"
                  id="emergency-relationship"
                  name="emergencyrelationship"
                  placeholder="sister"
                  value={teacherForm.emergencyrelationship}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                />
              </div>
              <div className="d-flex flex-column col">
                <TextField
                  label="Phone Number"
                  type="tel"
                  id="emergency-phone"
                  name="emergencyphone"
                  placeholder="03xxxxxxxxx"
                  value={teacherForm.emergencyphone}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                />
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

export default TeacherEditProfile;
