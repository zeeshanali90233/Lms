import React from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { db } from "../Firebase/config";
import { useState, useEffect, useRef } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/system";
import { useLocation, useParams } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
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


var rows = [
  {authorityname:"Students"},
{authorityname:"Courses"},
{authorityname:"Fees"},
];

const StaffEdit = () => {
  const [staffForm, setStaffForm] = useState(staffFormInit);
  const [staffPhotoURL, setStaffhotoURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);
  const { state } = useLocation();
  const [staffData, setStaffData] = useState(staffFormInit);

  useEffect(() => {
    const fetchStaffData = () => {
      db.collection("staff")
        .doc(state.firebaseId)
        .onSnapshot((snapshot) => {
          setStaffData({ ...snapshot.data(), firebaseId: snapshot.id });
          setStaffForm({ ...snapshot.data(), firebaseId: snapshot.id });
          setStaffhotoURL(snapshot.data().staffphoto.URL);
          rows = [
            { authorityname: "Students", ...snapshot.data().studentauthority },
            { authorityname: "Courses", ...snapshot.data().courseauthority },
            { authorityname: "Fees", ...snapshot.data().feesauthority },
          ];
        });
    };
    fetchStaffData();
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

  const handleChange = (e) => {
    if (e.target.name === "staffphoto") {
      setStaffForm({ ...staffForm, [e.target.name]: e.target.files[0] });
      setStaffhotoURL(URL.createObjectURL(e.target.files[0]));
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


  const handleAuthorityChange=(e,authorityname)=>{
    e.preventDefault();
    if(authorityname==="Students"){
      setStaffForm({ ...staffForm, studentauthority: {...staffForm.studentauthority,[e.target.name]:e.target.checked} });
      rows[0][e.target.name]=e.target.checked;
    }
    else if(authorityname==="Courses"){
      setStaffForm({ ...staffForm, courseauthority: {...staffForm.courseauthority,[e.target.name]:e.target.checked} });
      rows[1][e.target.name]=e.target.checked;
    }
    else if(authorityname==="Fees"){
      setStaffForm({ ...staffForm, feesauthority: {...staffForm.feesauthority,[e.target.name]:e.target.checked} });
      rows[2][e.target.name]=e.target.checked;
    }

  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const staffRef = db.collection("staff");
    const salaryref = db.collection("salaries");
    const storageRef = firebase.storage().ref();

    await staffRef.doc(staffForm.firebaseId).update({
      firstname: staffForm.firstname,
      lastname: staffForm.lastname,
      dob: staffForm.dob,
      gender: staffForm.gender,
      address: staffForm.address,
      phone: staffForm.phone,
      email: staffForm.email,
      cnic: staffForm.cnic,
      education: staffForm.education,
      institutename: staffForm.institutename,
      yearofpass: staffForm.yearofpass,
      designation: staffForm.designation,
      initsalary: staffForm.initsalary,
      emergencyname: staffForm.emergencyname,
      emergencyphone: staffForm.emergencyphone,
      emergencyrelationship: staffForm.emergencyrelationship,
      courseauthority:staffForm.courseauthority,
      feesauthority:staffForm.feesauthority,
      studentauthority:staffForm.studentauthority,
    });

    // If salary changes than also updating it in the salary collection
    if (staffData.initsalary !== staffForm.initsalary) {
      await salaryref
        .where("id", "==", staffForm.staffid)
        .get()
        .then((res) => {
          db.collection("salaries").doc(res.docs[0].id).update({
            salary: staffForm.initsalary,
          });
        });
    }

    const {
      staffphoto,
      staffcnicphoto,
      medicalrecordsphoto,
      additionaldocuments,

    } = staffForm;

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

    // Staff Cnic
    if (
      JSON.stringify(staffForm.staffcnicphoto) !==
      JSON.stringify(staffData.staffcnicphoto)
    ) {
      await firebase
        .storage()
        .refFromURL(staffData.staffcnicphoto.URL)
        .delete()
        .then(async () => {
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
          let staffcnicphotoURL = { URL, metadata };
          db.collection("staff").doc(staffForm.firebaseId).update({
            staffcnicphoto: staffcnicphotoURL,
          });
        });
    }

    // Staff medicalrecords
    if (
      JSON.stringify(staffForm.medicalrecordsphoto) !==
      JSON.stringify(staffData.medicalrecordsphoto)
    ) {
      if (staffData.medicalrecordsphoto.length !== 0) {
        await firebase
          .storage()
          .refFromURL(staffData.medicalrecordsphoto.URL)
          .delete()
          .then(async () => {
            const metadata = {
              contentType: medicalrecordsphoto.type,
              customMetadata: {
                fileExtension: medicalrecordsphoto.name.split(".").pop(),
              },
            };
            const medicalrecordsphotoSnapshot = await storageRef
              .child(`staff/${staffForm.staffid}/medicalrecords`)
              .put(medicalrecordsphoto, { metadata });
            const URL = await medicalrecordsphotoSnapshot.ref.getDownloadURL();
            let medicalrecordsphotoURL = { URL, metadata };
            db.collection("staff").doc(staffForm.firebaseId).update({
              medicalrecordsphoto: medicalrecordsphotoURL,
            });
          });
      } else {
        const metadata = {
          contentType: medicalrecordsphoto.type,
          customMetadata: {
            fileExtension: medicalrecordsphoto.name.split(".").pop(),
          },
        };
        const medicalrecordsphotoSnapshot = await storageRef
          .child(`staff/${staffForm.staffid}/medicalrecords`)
          .put(medicalrecordsphoto, { metadata });
        const URL = await medicalrecordsphotoSnapshot.ref.getDownloadURL();
        let medicalrecordsphotoURL = { URL, metadata };
        db.collection("staff").doc(staffForm.firebaseId).update({
          medicalrecordsphoto: medicalrecordsphotoURL,
        });
      }
    }


    //If Additional files is changed
    if (
      JSON.stringify(staffForm.additionaldocuments) !==
      JSON.stringify(staffData.additionaldocuments)
    ) {
      let metadata = {};
      //Deleting the previous additional Files
      // console.log(adminForm.additionaldocuments, adminData.additionaldocuments);
      if (additionaldocuments && additionaldocuments.length !== 0) {
        staffData.additionaldocuments.map(async (additionaldocument) => {
          await firebase.storage().refFromURL(additionaldocument.URL).delete();
          db.collection("staff")
            .doc(staffForm.firebaseId)
            .update({
              additionaldocuments:
                firebase.firestore.FieldValue.arrayRemove(additionaldocument),
            });
        });
      }
      let additionalFilesURL = [];
      for (var i = 0; i < staffForm.additionaldocuments.length; i++) {
        metadata = {
          contentType: additionaldocuments[i].type,
          customMetadata: {
            fileExtension: additionaldocuments[i].name.split(".").pop(),
          },
        };
        const additionaldocumentSnapshot = await storageRef
          .child(`staff/${staffForm.staffid}/additionaldocuments${Number(i) + 1}`)
          .put(additionaldocuments[i], { metadata });
        let URL = await additionaldocumentSnapshot.ref.getDownloadURL();
        additionalFilesURL.push({ URL, metadata });
        await db
          .collection("staff")
          .doc(staffForm.firebaseId)
          .update({
            additionaldocuments: firebase.firestore.FieldValue.arrayUnion({
              URL,
              metadata,
            }),
          });
      }
    }


    setIsSaving(false);
        setIsSuccessfullyAdded(true);
        setTimeout(() => {
          setIsSuccessfullyAdded(false);
        }, 3000);
    
  };
  return (
    <div className="add-student-form container mt-2 w-100 ">
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}

      <div>
        <h2 className="text-center">Staff Edit Form</h2>
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
              src={staffPhotoURL === "" ? staffForm.staffphoto.URL : staffPhotoURL}
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
              value={staffForm.dob.toString().substr(0, 10)}
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
                id="eduacation"
                value={(staffForm.education)?staffForm.education:""}
                onChange={(e) => {
                  handleChange(e);
                }}
              >
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
                focused
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
              <TableCell align="right"><input type="checkbox" name="review" id="review" onChange={(e)=>{handleAuthorityChange(e,row.authorityname)}} checked={row.review}/></TableCell>
              <TableCell align="right"><input type="checkbox" name="add" id="add" onChange={(e)=>{handleAuthorityChange(e,row.authorityname)}}  checked={row.add}/></TableCell>
              <TableCell align="right"><input type="checkbox" name="edit" id="edit" onChange={(e)=>{handleAuthorityChange(e,row.authorityname)}}  checked={row.edit}/></TableCell>
       
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
          
         
        </div>

        {/* Related Documents */}
        <div className="mt-1">
          <h3 className="text-center">Related Documents</h3>
          <div className="row">
            <div className="col">
              <label htmlFor="lstaffcnic">
                CNIC:
              </label>
              <input
                type="file"
                id="staffcnic"
                name="staffcnicphoto"
                onChange={(e) => {
                  handleChange(e);
                }}
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

export default StaffEdit;
