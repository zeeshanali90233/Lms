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
import { CiVirus } from "react-icons/ci";

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

const addSuperAdminFormInit = {
  said: "",
  firstname: "",
  lastname: "",
  cnic: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  education:"",
  designation: "",
  superadminphoto: "",
  superadmincnicphoto: "",
  medicalrecordsphoto: "",
  degreefile:"",
  cv:"",
  additionaldocuments: [],
  cgpa: 0.0,
};

const AddSuperAdmin = () => {
  const [superAdminForm, setSuperAdminForm] = useState(addSuperAdminFormInit);
  const [superAdminPhotoURL, setSuperAdminPhotoURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);

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
    if (e.target.name === "superadminphoto") {
      setSuperAdminForm({
        ...superAdminForm,
        [e.target.name]: e.target.files[0],
      });
      setSuperAdminPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else if (
      e.target.name === "superadmincnicphoto" ||
      e.target.name === "medicalrecordsphoto" || e.target.name === "degreefile" || e.target.name === "cv" 
    ) {
      setSuperAdminForm({
        ...superAdminForm,
        [e.target.name]: e.target.files[0],
      });
    } else if (e.target.name === "additionaldocuments") {
      setSuperAdminForm({ ...superAdminForm, [e.target.name]: e.target.files });
    } else if (e.target.name === "dob") {
      if (validateDob(e.target.value)) {
        setSuperAdminForm({
          ...superAdminForm,
          [e.target.name]: e.target.value,
        });
      } else {
        alert("Date of birth is not correct!");
        return;
      }
    } else {
      setSuperAdminForm({ ...superAdminForm, [e.target.name]: e.target.value });
    }
    // console.log(superAdminForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const superadminRef = db.collection("superadmin");

    // Checks Whether a user is not already exists
    //Add email and password to firebase auth
    
    try {
      const signInMethods = await firebase
      .auth()
      .createUserWithEmailAndPassword(
        `${superAdminForm.said}@alm.edu.pk`,
        "123456789"
      );
     
    } catch (err) {
      alert("Super Admin with same ID already exists");
      setIsSaving(false);
      return;
    }

    // Taking the files
    const {
      superadminphoto,
      superadmincnicphoto,
      medicalrecordsphoto,
      additionaldocuments,
      degreefile,
      cv,
    } = superAdminForm;
    const superadminTextForm = superAdminForm;
    superadminTextForm.said = superadminTextForm.said.toLowerCase();
    superadminTextForm.superadminphoto = "";
    superadminTextForm.superadmincnicphoto = "";
    superadminTextForm.medicalrecordsphoto = "";
    superadminTextForm.additionaldocuments = "";
    superadminTextForm.degreefile = "";
    superadminTextForm.cv = "";
    // Create a storage reference
    const storageRef = firebase.storage().ref();

    let superadminphotoURL = "";
    let superadmincnicphotoURL = "";
    let medicalrecordsphotoURL = "";
    let degreefileURL = "";
    let cvURL = "";

    await superadminRef
      .add(superAdminForm)
      .then(async (doc) => {
        //Upload the files
        if (superadminphoto) {
          const metadata = {
            contentType: superadminphoto.type,
            customMetadata: {
              fileExtension: superadminphoto.name.split(".").pop(),
            },
          };
          const superadminphotoSnapshot = await storageRef
            .child(`superadmin/${superAdminForm.said}/adminphoto`)
            .put(superadminphoto, { metadata });
          const URL = await superadminphotoSnapshot.ref.getDownloadURL();
          superadminphotoURL = { URL, metadata };
        }
        if (superadmincnicphoto) {
          const metadata = {
            contentType: superadmincnicphoto.type,
            customMetadata: {
              fileExtension: superadmincnicphoto.name.split(".").pop(),
            },
          };
          const superadmincnicphotoSnapshot = await storageRef
            .child(`superadmin/${superAdminForm.said}/cnicphoto`)
            .put(superadmincnicphoto, { metadata });
          const URL = await superadmincnicphotoSnapshot.ref.getDownloadURL();
          superadmincnicphotoURL = { URL, metadata };
        }
        if (degreefile) {
          const metadata = {
            contentType: degreefile.type,
            customMetadata: {
              fileExtension: degreefile.name.split(".").pop(),
            },
          };
          const superadmindegreefilephotoSnapshot = await storageRef
            .child(`superadmin/${superAdminForm.said}/degree`)
            .put(degreefile, { metadata });
          const URL = await superadmindegreefilephotoSnapshot.ref.getDownloadURL();
          degreefileURL = { URL, metadata };
        }
        if (cv) {
          const metadata = {
            contentType: cv.type,
            customMetadata: {
              fileExtension: cv.name.split(".").pop(),
            },
          };
          const superadmincvphotoSnapshot = await storageRef
            .child(`superadmin/${superAdminForm.said}/cv`)
            .put(CiVirus, { metadata });
          const URL = await superadmincvphotoSnapshot.ref.getDownloadURL();
          cvURL = { URL, metadata };
        }
        if (medicalrecordsphoto) {
          const metadata = {
            contentType: medicalrecordsphoto.type,
            customMetadata: {
              fileExtension: medicalrecordsphoto.name.split(".").pop(),
            },
          };
          const medicalrecordphotoSnapshot = await storageRef
            .child(`superadmin/${superAdminForm.said}/medicalrecords`)
            .put(medicalrecordsphoto);
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
              .child(
                `superadmin/${superAdminForm.said}/additionaldocuments${i + 1}`
              )
              .put(additionaldocuments[i], { metadata });
            const URL = await additionaldocumentsSnapshot.ref.getDownloadURL();
            additionalFiles.push({ URL, metadata });
          }
        }

        // update the document with the file URLs
        await superadminRef.doc(doc.id).update({
          superadminphoto: superadminphotoURL,
          superadmincnicphoto: superadmincnicphotoURL,
          medicalrecordsphoto: medicalrecordsphotoURL,
          degreefile:degreefileURL,
          cv:cvURL,
          additionaldocuments: additionalFiles,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        

        setIsSaving(false);
        setIsSuccessfullyAdded(true);
        setSuperAdminForm(addSuperAdminFormInit);
        // Setting student form to init
        console.log("SuccessFully Added");
        formRef.current.reset();
        setTimeout(() => {
          // Removing the alert from top after 2s
          setIsSuccessfullyAdded(false);
          setSuperAdminPhotoURL("");
        }, 5000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="add-admin-form container mt-2 w-100 ">
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div>
        <h2 className="text-center">Super Admin Entry Form</h2>
      </div>
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        ref={formRef}
      >
        {/*Admin Photo */}
        <div className=" d-flex justify-content-center me-auto">
          <div>
            <img
              className="rounded"
              src={
                superAdminPhotoURL === "" ? emptyProfile : superAdminPhotoURL
              }
              alt="SuperAdminPhoto "
              width={130}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="input-group mb-3">
            <input
              type="file"
              className="form-control"
              id="superadminphoto"
              name="superadminphoto"
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
              label="Super Admin ID"
              variant="outlined"
              type="text"
              name="said"
              placeholder="sa1234"
              inputProps={{
                pattern: "[sS][aA][a-zA-Z0-9]{4}",
              }}
              title="The input should start with 'a' or 'A' or 's' or 'S' or a combination of both followed by 4 characters that can be either letters or numbers."
              pattern="[sS][aA][a-zA-Z0-9]{4}"
              value={superAdminForm.said}
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
              value={superAdminForm.firstname}
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
              value={superAdminForm.lastname}
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
              id="gender"
              name="gender"
              value={superAdminForm.gender}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            >
              <MenuItem value={"Male"}>Male</MenuItem>
              <MenuItem value={"Female"}>Female</MenuItem>
              <MenuItem value={"Other"}>Other</MenuItem>
            </Select>
          </div>
        </div>
        <div className="d-flex flex-column ">
          <label htmlFor="address">Address *</label>
          <textarea
            type="text"
            id="address"
            name="address"
            placeholder="street#2 Bhopal, India"
            className="py-1 px-2 rounded "
            value={superAdminForm.address}
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
              label="Email"
              variant="outlined"
              type="email"
              name="email"
              value={superAdminForm.email}
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
              label="Phone Number"
              variant="outlined"
              type="tel"
              name="phone"
              inputProps={{
                pattern:"[0-9]{11}"
              }}
              placeholder="03xxxxxxxxx"
              value={superAdminForm.phone}
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
              inputProps={{
                pattern: "[0-9]{5}-[0-9]{7}-[0-9]",
              }}
              placeholder="xxxxx-xxxxxxx-x"
              value={superAdminForm.cnic}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
        </div>

        {/*Qualification */}
        <div className="mt-2">
          <h3 className="text-center">Qualification</h3>
          <div className="row">
            <div className="d-flex flex-column col">
              <InputLabel id="demo-simple-select-helper-label">
                Education
              </InputLabel>
              <Select
                name="education"
                id="eduacation"
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
          <div className="row mt-1">
            <div className="d-flex flex-column col mt-4">
              <TextField
                id="outlined-basic"
                label="Institute Name"
                variant="outlined"
                type="text"
                name="institutename"
                placeholder="IIT India"
                value={superAdminForm.institutename}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>

            <div className="d-flex flex-column col ">
              <label htmlFor="yearofpass">Year of Passing</label>
              <TextField
                id="outlined-basic"
                variant="outlined"
                type="date"
                name="yearofpass"
                value={superAdminForm.yearofpass}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>
            <div className="d-flex flex-column col mt-4">
              <TextField
                id="outlined-basic"
                label="CGPA"
                variant="outlined"
                type="number"
                name="cgpa"
                value={superAdminForm.cgpa}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>
          </div>
        </div>
        {/* Designation */}
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
                placeholder="CEO"
                value={superAdminForm.designation}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
        </div>

        {/* Related Documents */}
        <div className="mt-1">
          <h3 className="text-center">Related Documents</h3>
          <div className="row">
            <div className="col">
              <label htmlFor="lstaffcnic">CNIC:</label>
              <input
                type="file"
                id="superadmincnicphoto"
                name="superadmincnicphoto"
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
            <div className="col">
              <label htmlFor="degree-file">Degree:</label>
              <input
                type="file"
                id="degree-file"
                name="degreefile"
                onChange={(e) => {
                  handleChange(e);
                }}
              ></input>
            </div>
            <div className="col">
              <label htmlFor="cv">CV:</label>
              <input
                type="file"
                id="cv"
                name="cv"
                onChange={(e) => {
                  handleChange(e);
                }}
              ></input>
            </div>
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

          <div className="row mt-1 text-center">
            
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

export default AddSuperAdmin;
