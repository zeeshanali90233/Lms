import React from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
import "../Css/AddStudentForm.css";
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
import Compress from "compress.js";
// MUI table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


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
  education:"",
  emergencyname: "",
  emergencyrelationship: "",
  emergencyphone: "",
  staffphoto: "",
  staffcnicphoto: "",
  medicalrecordsphoto: "",
  additionaldocuments: [],
  assignedrole: [],
  courseauthority:{review:false,add:false,edit:false},
  feesauthority:{review:false,add:false,edit:false},
  studentauthority:{review:false,add:false,edit:false},
};

const rows = [
  {authorityname:"Students"},
{authorityname:"Courses"},
{authorityname:"Fees"},
];

const AddStaffForm = () => {
  const [staffForm, setStaffForm] = useState(staffFormInit);
  const [staffPhotoURL, setStaffPhotoURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);
  const recaptchaContainerRef = useRef(null);
  const profilePictureRef=useRef(null);

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



  const handleChange = (e) => {
    if (e.target.name === "staffphoto") {
      setStaffForm({ ...staffForm, [e.target.name]: e.target.files[0] });
      setStaffPhotoURL(URL.createObjectURL(e.target.files[0]));
      // console.log(profilePictureRef.current)
      // console.log(profilePictureRef.current.clientHeight)
      // console.log(profilePictureRef.current.clientWidth)
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
    // console.log(staffForm);
  };


  const handleAuthorityChange=(e,authorityname)=>{
    e.preventDefault();
    if(authorityname==="Students"){
      setStaffForm({ ...staffForm, studentauthority: {...staffForm.studentauthority,[e.target.name]:e.target.checked} });
    }
    else if(authorityname==="Courses"){
      setStaffForm({ ...staffForm, courseauthority: {...staffForm.courseauthority,[e.target.name]:e.target.checked} });
    }
    else if(authorityname==="Fees"){
      setStaffForm({ ...staffForm, feesauthority: {...staffForm.feesauthority,[e.target.name]:e.target.checked} });
    }
    // console.log(staffForm);

  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const staffRef = db.collection("staff");
    const salaryref = db.collection("salaries");

    // Checks Whether a user is not already exists
    //Add email and password to firebase auth
       
    try {
      // Create user with email and password
      const signInMethods = await firebase.auth().createUserWithEmailAndPassword(
        `${staffForm.staffid}@alm.edu.pk`,
        "123456789"
      );
    } catch (err) {
      setIsSaving(false);
      alert("Staff with same ID already exists");
      return;
    }
    

    

    // Taking the files
    const {
      staffphoto,
      staffcnicphoto,
      medicalrecordsphoto,
      additionaldocuments,
    } = staffForm;
    const staffTextForm = staffForm;
    staffTextForm.staffid = staffTextForm.staffid.toLowerCase();
    staffTextForm.staffphoto = "";
    staffTextForm.staffcnicphoto = "";
    staffTextForm.medicalrecordsphoto = "";
    staffTextForm.additionaldocuments = "";
    // Create a storage reference
    const storageRef = firebase.storage().ref();

    let staffphotoURL = "";
    let staffcnicphotoURL = "";
    let medicalrecordsphotoURL = "";

    // Creating due date for the fees receipt in fee collection
    // get the current date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    const currentDate = `${dd}-${mm}-${yyyy}`;

    await staffRef
      .add(staffForm)
      .then(async (doc) => {
        //Upload the files
        if (staffphoto) {
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
          staffphotoURL = { URL, metadata };
        }
        if (staffcnicphoto) {
          const metadata = {
            contentType: staffcnicphoto.type,
            customMetadata: {
              fileExtension: staffcnicphoto.name.split(".").pop(),
            },
          };
          const staffcnicphotoSnapshot = await storageRef
            .child(`staff/${staffForm.staffid}/cnicphoto`)
            .put(staffcnicphoto, { metadata });
          const URL = await staffcnicphotoSnapshot.ref.getDownloadURL();
          staffcnicphotoURL = { URL, metadata };
        }
        if (medicalrecordsphoto) {
          const metadata = {
            contentType: medicalrecordsphoto.type,
            customMetadata: {
              fileExtension: medicalrecordsphoto.name.split(".").pop(),
            },
          };
          const medicalrecordphotoSnapshot = await storageRef
            .child(`staff/${staffForm.staffid}/medicalrecords`)
            .put(medicalrecordsphoto, { metadata });
          const URL = await medicalrecordphotoSnapshot.ref.getDownloadURL();
          medicalrecordsphotoURL = { URL, metadata };
        }
        let additionalFiles = [];
        if (additionaldocuments) {
          let metadata;
          for (var i = 0; i < additionaldocuments.length; i++) {
            metadata = {
              contentType: additionaldocuments[i].type,
              customMetadata: {
                fileExtension: additionaldocuments[i].name.split(".").pop(),
              },
            };
            const additionaldocumentsSnapshot = await storageRef
              .child(`staff/${staffForm.staffid}/additionaldocuments${i + 1}`)
              .put(additionaldocuments[i], { metadata });
            const URL = await additionaldocumentsSnapshot.ref.getDownloadURL();
            additionalFiles.push({ URL, metadata });
          }
        }

        // Salary Receipt
        const salaryReceipt = {
          photoURL: staffphotoURL,
          id: staffForm.staffid,
          name: staffForm.firstname + " " + staffForm.lastname,
          salary: staffForm.initsalary,
          paid: false,
          date: currentDate,
        };

        // update the document with the file URLs
        await staffRef.doc(doc.id).update({
          staffphoto: staffphotoURL,
          staffcnicphoto: staffcnicphotoURL,
          medicalrecordsphoto: medicalrecordsphotoURL,
          additionaldocuments: additionalFiles,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Adding the receipt in the fees collection
        await salaryref.add(salaryReceipt);
        

        setIsSaving(false);
        setIsSuccessfullyAdded(true);
        // Setting student form to init
        setStaffForm(staffFormInit);
        console.log("SuccessFully Added");
        formRef.current.reset();
        setStaffPhotoURL("");
        setTimeout(() => {
          // Removing the alert from top after 2s
          setIsSuccessfullyAdded(false);
        }, 5000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="add-student-form container mt-2 w-100 ">
<div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div>
        <h2 className="text-center">Staff Add Form</h2>
      </div>
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        ref={formRef}
      >
        {/* Lower Staff Photo */}
        <div className=" d-flex justify-content-center me-auto">
          <div>
            <img
              src={staffPhotoURL === "" ? emptyProfile : staffPhotoURL}
              alt="Staff "
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
              ref={profilePictureRef}
              name="staffphoto"
              onChange={(e) => {
                handleChange(e);
              }}
            ></input>
          </div>
        </div>
        {/* Main Student Information */}
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
              placeholder="Andaleep"
              value={staffForm.firstname}
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
              placeholder="Khan"
              value={staffForm.lastname}
              onChange={(e) => {
                handleChange(e);
              }}
              required
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
              value={staffForm.gender}
              onChange={(e) => {
                handleChange(e);
              }}
              required
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
              value={staffForm.phone}
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
              value={staffForm.cnic}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>

          <div className=" mt-2">
            <div className="d-flex flex-column ">
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
                id="education"
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
          <div className="row ">
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

            <div className="d-flex flex-column col">
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
        <div className="mt-2">
          <h3 className="text-center">Designation</h3>
          <div className="row">
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Designation"
                variant="outlined"
                type="text"
                name="designation"
                placeholder="Helper"
                value={staffForm.designation}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Salary"
                variant="outlined"
                type="number"
                name="initsalary"
                placeholder="12000"
                value={staffForm.initsalary}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
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
                required
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
                required
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
                required
              />
            </div>
          </div>
        </div>

        {/* Other Authorities */}
        <div className="mt-1">
          <h3 className="text-center">Other Information/Rules</h3>
          {/* Table of Authorities */}
          <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">Review</TableCell>
            <TableCell align="right">Add</TableCell>
            <TableCell align="right">Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.authorityname}
              </TableCell>
              <TableCell align="right"><input type="checkbox" name="review" id="review" onChange={(e)=>{handleAuthorityChange(e,row.authorityname)}}/></TableCell>
              <TableCell align="right"><input type="checkbox" name="add" id="add" onChange={(e)=>{handleAuthorityChange(e,row.authorityname)}}/></TableCell>
              <TableCell align="right"><input type="checkbox" name="edit" id="edit" onChange={(e)=>{handleAuthorityChange(e,row.authorityname)}}/></TableCell>
       
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
          
         
        </div>

        {/* Related Documents */}
        <div className="mt-2">
          <h3 className="text-center">Related Documents</h3>
          <div className="row">
            <div className="col">
              <label htmlFor="lstaffcnic">
                CNIC:<span className="required">*</span>
              </label>
              <input
                type="file"
                id="staffcnic"
                name="staffcnicphoto"
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              ></input>
            </div>

            <div className="col">
              <label htmlFor="medical-records">Medical Records:</label>
              <input
                type="file"
                id="medical-records"
                name="medicalrecordsphoto"
                onChange={(e) => {
                  handleChange(e);
                }}
              ></input>
            </div>
          </div>
          <div className="row mt-1 text-center">
            <div className="col">
              <label htmlFor="additional-documents">
                Additional Documents:
              </label>
              <input
                type="file"
                id="additional-documents"
                name="additionaldocuments"
                onChange={(e) => {
                  handleChange(e);
                }}
                multiple
              ></input>
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
    </div>
  );
};

export default AddStaffForm;
