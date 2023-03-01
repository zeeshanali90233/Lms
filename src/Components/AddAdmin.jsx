import React from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
import "../Css/AddStudentForm.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { db } from "../Firebase/config";
import { useState,useRef } from "react";
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/system';
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";


const SaveButton=styled(LoadingButton)({
  backgroundColor:"#00233a",
  '&:hover':{
    backgroundColor:"#393c41"
  }
})

const addAdminFormInit = {
  aid: "",
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
  adminphoto: "",
  admincnicphoto: "",
  medicalrecordsphoto: "",
  additionaldocuments: [],
  assignedrole:[],
  cgpa:0.0,
  canmanagesalary:false,
  canaddremovestudents:false,
  canhirestaff:false,
  canmakedeletecourse:false,
  type:"Admin",
  canmanagesalary:"",
};

const AddAdmin = () => {
  const [adminForm, setAdminForm] = useState(addAdminFormInit);
  const [adminPhotoURL, setAdminPhotoURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef=useRef(null);

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
    if (e.target.name === "adminphoto") {
        setAdminForm({ ...adminForm, [e.target.name]: e.target.files[0] });
        setAdminPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else if (
      e.target.name === "admincnicphoto" ||
      e.target.name === "medicalrecordsphoto"|| e.target.name === "cv" ||e.target.name === "degreefile" 
    ) {
        setAdminForm({ ...adminForm, [e.target.name]: e.target.files[0] });
    } else if (e.target.name === "additionaldocuments") {
        setAdminForm({ ...adminForm, [e.target.name]: e.target.files });

    } else if(e.target.name==='dob'){
        if(validateDob(e.target.value)){

            setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
        }
        else{
            alert("Date of birth is not correct!");
            return;
        }
    }
    else {
        setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const adminRef = db.collection("admin");
    const salaryref = db.collection("salaries");

    // Checks Whether a user is not already exists
     //Add email and password to firebase auth
    
    try{
      const signInMethods=await  firebase.auth().createUserWithEmailAndPassword(`${adminForm.aid}@alm.edu.pk`,"123456789");
     
    }
    catch(err){
      alert("Admin with same ID already exists");
        setIsSaving(false);
        return;
    }



    // Taking the files
    const {
      adminphoto,
      admincnicphoto,
      medicalrecordsphoto,
      additionaldocuments,
      cv,degreefile,
    } = adminForm;
    const adminTextForm = adminForm;
    adminTextForm.aid = adminTextForm.aid.toLowerCase();
    adminTextForm.adminphoto = "";
    adminTextForm.admincnicphoto = "";
    adminTextForm.medicalrecordsphoto = "";
    adminTextForm.cv = "";
    adminTextForm.degreefile = "";
    adminTextForm.additionaldocuments = "";
    // Create a storage reference
    const storageRef = firebase.storage().ref();

    let adminphotoURL = "";
    let admincnicphotoURL = "";
    let medicalrecordsphotoURL = "";
    let cvURL="";
    let degreefileURL="";


    // Creating due date for the salary receipt in salary collection
    // get the current date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    const currentDate = `${dd}-${mm}-${yyyy}`;


    

    await adminRef
      .add(adminTextForm)
      .then(async (doc) => {
        //Upload the files
        if (adminphoto) {
          const metadata= {
            contentType: adminphoto.type,
            customMetadata: {
              fileExtension: adminphoto.name.split(".").pop(),
            }
          }
          const adminphotoSnapshot = await storageRef
            .child(`admin/${adminForm.aid}/adminphoto`)
            .put(adminphoto,{metadata});
          const URL = await adminphotoSnapshot.ref.getDownloadURL();
          adminphotoURL={URL,metadata}
        }
        if (admincnicphoto) {
          const metadata= {
            contentType: admincnicphoto.type,
            customMetadata: {
              fileExtension: admincnicphoto.name.split(".").pop(),
            }
          }
          const admincnicphotoSnapshot = await storageRef
            .child(`admin/${adminForm.aid}/cnicphoto`)
            .put(admincnicphoto,{metadata});
          const URL =
            await admincnicphotoSnapshot.ref.getDownloadURL();
            admincnicphotoURL={URL,metadata}
        }
        if (medicalrecordsphoto) {
          const metadata= {
            contentType: medicalrecordsphoto.type,
            customMetadata: {
              fileExtension: medicalrecordsphoto.name.split(".").pop(),
            }
          }
          const medicalrecordphotoSnapshot = await storageRef
            .child(`admin/${adminForm.aid}/medicalrecords`)
            .put(medicalrecordsphoto,{metadata});
          const URL =
            await medicalrecordphotoSnapshot.ref.getDownloadURL();
            medicalrecordsphotoURL={URL,metadata}
        }
        if (cv) {
          const metadata= {
            contentType: cv.type,
            customMetadata: {
              fileExtension: cv.name.split(".").pop(),
            }
          }
          const cvSnapshot = await storageRef
            .child(`admin/${adminForm.aid}/cv`)
            .put(cv,{metadata});
          const URL =
            await cvSnapshot.ref.getDownloadURL();
            cvURL={URL,metadata}
        }
        if (degreefile) {
          const metadata= {
            contentType: degreefile.type,
            customMetadata: {
              fileExtension: degreefile.name.split(".").pop(),
            }
          }
          const degreefileSnapshot = await storageRef
            .child(`admin/${adminForm.aid}/degreefile`)
            .put(degreefile,{metadata});
          const URL =
            await degreefileSnapshot.ref.getDownloadURL();
            degreefileURL={URL,metadata}
        }
        let additionalFiles = [];
        if (additionaldocuments) {
          let metadata;
          for (var i = 0; i < additionaldocuments.length; i++) {
            metadata= {
              contentType: additionaldocuments[i].type,
              customMetadata: {
                fileExtension: additionaldocuments[i].name.split(".").pop(),
              }
            }
            const additionaldocumentsSnapshot = await storageRef
              .child(`admin/${adminForm.aid}/additionaldocuments${i + 1}`)
              .put(additionaldocuments[i],{metadata});
              const URL=await additionaldocumentsSnapshot.ref.getDownloadURL();
            additionalFiles.push(
              {URL,metadata}
            );
          }
        }

        // Salary Receipt
    const salaryReceipt = {
      photoURL:adminphotoURL,
      id: adminForm.aid,
      name:adminForm.firstname+" "+adminForm.lastname,
      salary: adminForm.initsalary,
      paid:false,
      date: currentDate,
    };

        // update the document with the file URLs
        await adminRef.doc(doc.id).update({
          adminphoto: adminphotoURL,
          admincnicphoto: admincnicphotoURL,
          medicalrecordsphoto: medicalrecordsphotoURL,
          additionaldocuments: additionalFiles,
          cv:cvURL,
          degreefile:degreefileURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Adding the receipt in the fees collection
        await salaryref.add(salaryReceipt);
       
        
        setIsSaving(false);
        setIsSuccessfullyAdded(true);
        // Setting student form to init
        setAdminForm(addAdminFormInit);
        console.log("SuccessFully Added");
        formRef.current.reset();
        setTimeout(() => {
          // Removing the alert from top after 2s
          setIsSuccessfullyAdded(false);
          setAdminPhotoURL("");
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
        <h2 className="text-center">Admin Entry Form</h2>
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
                adminPhotoURL === "" ? emptyProfile : adminPhotoURL
              }
              alt="AdminPhoto "
              width={130}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="input-group mb-3">
            <input
              type="file"
              className="form-control"
              id="adminphoto"
              name="adminphoto"
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
              label="Admin ID"
              type="text"
              name="aid"
              placeholder="a1234"
              title="The input should start with 'a' or 'A' followed by 4 characters that can be either letters or numbers."
              inputProps={{pattern:"[aA][a-zA-Z0-9]{4}"}}
              value={adminForm.aid}
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
              label="First Name"
              id="outlined-basic"
              type="text"
              name="firstname"
              placeholder="Andaleep"
              value={adminForm.firstname}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />

          </div>

          <div className="d-flex flex-column col">
          <TextField
              label="Last Name"
              id="outlined-basic"
              type="text"
              name="lastname"
              placeholder="Khan"
              value={adminForm.lastname}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
    
          </div>
        </div>
        <div className="row">
          <div className="d-flex flex-column col">
          <label htmlFor="dob">
              Date of Birth:<span className="required">*</span>
            </label>
          <TextField
              id="outlined-basic"
              type="date"
              name="dob"
              value={adminForm.dob}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
          <div className="d-flex flex-column col">
          <InputLabel id="demo-simple-select-helper-label">Gender</InputLabel>
        <Select
      id="gender"
      name="gender"
      value={adminForm.gender}
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
            value={adminForm.address}
            onChange={(e) => {
              handleChange(e);
            }}
            required
          ></textarea>
        </div>
        <div className="row mt-2">
          <div className="d-flex flex-column col">
          <TextField id="outlined-basic" label="Phone Number" variant="outlined"
              type="tel"
              name="phone"
              placeholder="03xxxxxxxxx"
              value={adminForm.phone}
              onChange={(e) => {
                handleChange(e);
              }}
              required />
          
          </div>
          
          <div className="d-flex flex-column col">
          <TextField id="outlined-basic" label="CNIC" variant="outlined"
              type="text"
              name="cnic"
              inputProps={{pattern:"[0-9]{5}-[0-9]{7}-[0-9]"}}
              placeholder="xxxxx-xxxxxxx-x"
              value={adminForm.cnic}
              onChange={(e) => {
                handleChange(e);
              }}
              required/>
            
          </div>
        </div>
        <div className="row mt-2">
        <div className="d-flex flex-column col">
          <TextField id="outlined-basic" label="Email" variant="outlined"
              type="email"
              name="email"
              value={adminForm.email}
              onChange={(e) => {
                handleChange(e);
              }}/>
      
          </div>
        </div>

        {/*Qualification */}
        <div className="mt-2">
          <h3 className="text-center">Qualification</h3>
          <div className="row">
          
            <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Education *</InputLabel>
        <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        name="education"
        onChange={(e) => {
          handleChange(e);
        }}
        required
        >
          <MenuItem value={""}>Select Education Level</MenuItem>
          <MenuItem value={"matric"}>Matric</MenuItem>
          <MenuItem value={"intermediate"}>Intermediate</MenuItem>
          <MenuItem value={"graduated"}>Graduated</MenuItem>
        </Select>
            </div>
          </div>
          <div className="row mt-2">
            <div className="d-flex flex-column col">
            <TextField id="outlined-basic" label="Institute Name" variant="outlined"
              type="text"
              name="institutename"
              placeholder="IIT India"
              value={adminForm.institutename}
              onChange={(e) => {
                handleChange(e);
              }}/>
             
            </div>

            
          </div>
        </div>
        <div className="row">
        <div className="d-flex flex-column col">
              <label htmlFor="yearofpass">Passing Year</label>
            <TextField id="outlined-basic"  variant="outlined"
              type="date"
              name="yearofpass"
              value={adminForm.yearofpass}
              onChange={(e) => {
                handleChange(e);
              }}/>
              
            </div>
            <div className="d-flex flex-column col mt-4">
            <TextField id="outlined-basic" label="CGPA" variant="outlined"
             type="number"
             name="cgpa"
             value={adminForm.cgpa}
             onChange={(e) => {
               handleChange(e);
             }}/>
             
            </div>
        </div>
        {/* Designation */}
        <div className="mt-2">
          <h3 className="text-center">Designation</h3>
          <div className="row">
            <div className="d-flex flex-column col">
            <TextField id="outlined-basic" label="Designation" variant="outlined"
             type="text"
             name="designation"
             placeholder="Operational Manager"
             value={adminForm.designation}
             onChange={(e) => {
               handleChange(e);
             }}
             required/>
             
            </div>
            <div className="d-flex flex-column col">
            <TextField id="outlined-basic" label="Salary" variant="outlined"
           type="number"
           name="initsalary"
           placeholder="120000"
           inputProps={{min:0}}
           value={adminForm.initsalary}
           onChange={(e) => {
             handleChange(e);
           }}
           required/>
           
            </div>
          </div>
        </div>


        {/* Emergency Contact Section */}
        <div className="mt-2">
          <h3 className="text-center">Emergency Contact Form</h3>
          <div className="row">
            <div className="d-flex flex-column col">
            <TextField id="outlined-basic" label="Name" variant="outlined"
           type="text"
           name="emergencyname"
           placeholder="Ali"
           value={adminForm.emergencyname}
           onChange={(e) => {
             handleChange(e);
           }}
           required/>
             
            </div>
            <div className="d-flex flex-column col">
            <TextField id="outlined-basic" label="Relationship" variant="outlined"
           type="text"
           name="emergencyrelationship"
           placeholder="brother"
           value={adminForm.emergencyrelationship}
           onChange={(e) => {
             handleChange(e);
           }}
           required/>
            </div>
            <div className="d-flex flex-column col">
            <TextField id="outlined-basic" label="Phone Number" variant="outlined"
          type="tel"
          name="emergencyphone"
          placeholder="03xxxxxxxxx"
          value={adminForm.emergencyphone}
          onChange={(e) => {
            handleChange(e);
          }}
          required/>
         
            </div>
          </div>
        </div>

        {/* Other Authorities */}
        <div className="mt-1">
        <h3 className="text-center">Other Information/Rules</h3>
            
        </div>
        <div className="row">
          
            {/* Can Give Salary to lower designation Employees*/}
            <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Manage Salary Records *</InputLabel>
        <Select
      name="canmanagesalary"
      id="canmanagesalary"
      onChange={(e) => {
        handleChange(e);
      }}
      required
        >
          <MenuItem value={""}></MenuItem>
          <MenuItem value={true}>Yes</MenuItem>
          <MenuItem value={false}>No</MenuItem>
        </Select>
            
            </div>
        </div>
        {/* Related Documents */}
        <div className="mt-1">
          <h3 className="text-center">Related Documents</h3>
          <div className="row">
            <div className="col">
              <label htmlFor="lstaffcnic">
                CNIC:<span className="required">*</span>
              </label>
              <input
                type="file"
                id="admincnic"
                name="admincnicphoto"
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
            <div className="col">
              <label htmlFor="degree-file">
                Degree:
              </label>
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
              <label htmlFor="cv">
                CV:<span className="required">*</span>
              </label>
              <input
                type="file"
                id="cv"
                name="cv"
                onChange={(e) => {
                  handleChange(e);
                }}
                required
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

export default AddAdmin;
