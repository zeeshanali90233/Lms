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
import { adminUser } from "../Pages/AdminDashboard";
import ProfilePhotoICON from "../Assets/Logos/ProfilePhotoICON.png"
import DegreeFileICON from "../Assets/Logos/DegreeFileICON.png"
import MedicalRecordICON from "../Assets/Logos/MedicalRecordICON.png"
import AdditionalFilesICON from "../Assets/Logos/AdditionalFilesICON.png"
import CnicICON from "../Assets/Logos/CnicICON.png"
import EditFormICON from "../Assets/Logos/EditFormICON.png"
import ChangePasswordICON from "../Assets/Logos/ChangePasswordICON.png"
// MUI Modal Component
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate } from "react-router-dom";


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

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});


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
  canaddremovestudents:"",
  canhirestaff:"",
  canmakedeletecourse:"",
  canmanagesalary:"",
};

const AdminEditProfile = () => {
  const [adminForm, setAdminForm] = useState(addAdminFormInit);
  const [adminPhotoURL, setAdminPhotoURL] = useState((adminForm && adminForm.adminphoto!==undefined)?adminForm.adminphoto.URL:"");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);
  const [adminData, setAdminData] = useState(useContext(adminUser));
  const {firebaseId}=useContext(adminUser);
  // Panels
  const [showFurtherEditBox,setShowFurtherEditBox]=useState(false);
  const [showChangePasswordBox,setShowChangePasswordBox]=useState(false);
  // Password Change States
  const [passwordBoxErrorMessage,setPasswordBoxErrorMessage]=useState("");
  const [passwordChangeForm,setPasswordChangeForm]=useState({currpassword:'',newpassword:"",confirmpassword:""});
  
  const [passwordChangedSuccessMessage, setPasswordChangedSuccessMessage] = useState("");

  // Navigation
  const navigate=useNavigate();
  const handleChangePasswordBoxClose=()=>{setShowChangePasswordBox(false);setPasswordBoxErrorMessage("");
  setPasswordChangeForm({currpassword:'',newpassword:"",confirmpassword:""});
}


useEffect(()=>{
  // Getting the superadmin
  // Only Importing this so that user can see the live changes otherwise the superadmin data is coming from context

  db.collection("admin").doc(firebaseId).onSnapshot((snapshot)=>{
    setAdminForm(snapshot.data());
    setAdminData(snapshot.data());
    setAdminPhotoURL(snapshot.data().adminphoto.URL);
    
  })
},[])
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
  var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!regex.test(password)) {
    return false;
  }

  // Password meets all requirements
  return true;
}

const handlePasswordChange=(e)=>{
  e.preventDefault();
  setPasswordChangeForm({...passwordChangeForm,[e.target.name]:e.target.value});
  if(e.target.name=="confirmpassword" && passwordChangeForm.newpassword!==e.target.value){
    setPasswordBoxErrorMessage("New and Confirm Password Should Be Same");
  }
  else if(e.target.name=="confirmpassword" && passwordChangeForm.newpassword===e.target.value){
    setPasswordBoxErrorMessage("");
  }
}


const changePassword=(e)=>{
  e.preventDefault();
  setIsSaving(false);
  if(passwordChangeForm.newpassword!==passwordChangeForm.confirmpassword || !validatePassword(passwordChangeForm.newpassword)){
    setPasswordBoxErrorMessage("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
    );
    return;
  }

  setPasswordBoxErrorMessage("");
  const user=firebase.auth().currentUser;
  const credentials=firebase.auth.EmailAuthProvider.credential(user.email,passwordChangeForm.currpassword);
  user.reauthenticateWithCredential(credentials)
  .then(()=>{
    user.updatePassword(passwordChangeForm.newpassword);
  })
  .then(()=>{
    setPasswordChangedSuccessMessage("Password Changed Successfully");
    setTimeout(()=>{
      setIsSaving(false);
      setPasswordChangedSuccessMessage("");
      handleChangePasswordBoxClose();
      firebase.auth().signOut();
      navigate("/admin/login");
    },1500)
  })

  .catch((err)=>{
    setPasswordBoxErrorMessage("Incorrect Current Password");
  })
  return ;
}

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


    // It downloads the files
    const handleDownload = (file, fileTitle = "") => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        file.URL,
        true
      );
      xhr.responseType = "blob";
      xhr.onload = function (event) {
        const blob = xhr.response;
        // Set the content-disposition header to specify the original file type and extension
        const contentDispositionHeader = `attachment; filename=${
          fileTitle
        }.${file.metadata.customMetadata.fileExtension};`;
  
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${fileTitle}.${
          file.metadata.customMetadata.fileExtension
        }`;
        link.setAttribute("style", "display: none;");
        link.setAttribute(
          "download",
          `${fileTitle}.${
            file.metadata.customMetadata.fileExtension
          }`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      xhr.send();
    };


    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      // Create a reference to the students collection
      const adminRef = db.collection("admin");
  
  
  
      // Taking the files
      const {
        adminphoto,
        admincnicphoto,
        medicalrecordsphoto,
        additionaldocuments,
        cv,degreefile,
      } = adminForm;
      const adminTextForm = adminForm;
      const storageRef = firebase.storage().ref();
  

  
  
      await adminRef.doc(firebaseId).update({
        firstname:adminForm.firstname,
        lastname:adminForm.lastname,
        dob:adminForm.dob,
        gender:adminForm.gender,
        address:adminForm.address,
        email:adminForm.email,
        phone:adminForm.phone,
        institutename:adminForm.institutename,
        yearofpass:adminForm.yearofpass,
        education:adminForm.education,
        emergencyname:adminForm.emergencyname,
        emergencyphone:adminForm.emergencyphone,
        emergencyrelationship:adminForm.emergencyrelationship
      })
  
  
      
    // Profile Photo
    if (  
      adminForm.adminphoto.URL===undefined && adminForm.adminphoto!==adminData.adminphoto 
     ) {
       const metadata = {
         contentType: adminphoto.type,
         customMetadata: {
           fileExtension: adminphoto.name.split(".").pop(),
         },
       };
       if (adminData.adminphoto.length !== 0) {
         await firebase
           .storage()
           .refFromURL(adminData.adminphoto.URL)
           .delete()
           .then(async () => {
             const adminphotoSnapshot = await storageRef
               .child(`admin/${adminForm.aid}/adminphoto`)
               .put(adminphoto);
             let URL = await adminphotoSnapshot.ref.getDownloadURL();
             let adminphotoURL = { URL, metadata };
             await adminRef.doc(firebaseId).update({
               adminphoto: adminphotoURL,
             });
           });
       }
       else {
        const adminphotoSnapshot = await storageRef
        .child(`admin/${adminForm.aid}/adminphoto`)
        .put(adminphoto);
      let URL = await adminphotoSnapshot.ref.getDownloadURL();
      let adminphotoURL = { URL, metadata };
      await adminRef.doc(firebaseId).update({
        adminphoto: adminphotoURL,
      });
       }
     }
 
    // CNIC Photo
    if (  
      adminForm.admincnicphoto.URL===undefined
     ) {
       const metadata = {
         contentType: admincnicphoto.type,
         customMetadata: {
           fileExtension: admincnicphoto.name.split(".").pop(),
         },
       };
       if (adminData.admincnicphoto.length !== 0) {
         await firebase
           .storage()
           .refFromURL(adminData.admincnicphoto.URL)
           .delete()
           .then(async () => {
             const admincnicphotoSnapshot = await storageRef
               .child(`admin/${adminForm.aid}/cnicphoto`)
               .put(admincnicphoto);
             let URL = await admincnicphotoSnapshot.ref.getDownloadURL();
             let admincnicphotoURL = { URL, metadata };
             await adminRef.doc(firebaseId).update({
              admincnicphoto: admincnicphotoURL,
             });
           });
       }
       else {
        const admincnicphotoSnapshot = await storageRef
        .child(`admin/${adminForm.aid}/cnicphoto`)
        .put(admincnicphoto);
      let URL = await admincnicphotoSnapshot.ref.getDownloadURL();
      let admincnicphotoURL = { URL, metadata };
      await adminRef.doc(firebaseId).update({
       admincnicphoto: admincnicphotoURL,
      });
       }
     }
    // Medical Records
    if (  
      adminForm.medicalrecordsphoto.URL===undefined
     ) {
       const metadata = {
         contentType: medicalrecordsphoto.type,
         customMetadata: {
           fileExtension: medicalrecordsphoto.name.split(".").pop(),
         },
       };
       if (adminData.medicalrecordsphoto.length !== 0) {
         await firebase
           .storage()
           .refFromURL(adminData.medicalrecordsphoto.URL)
           .delete()
           .then(async () => {
             const medicalrecordsphotoSnapshot = await storageRef
               .child(`admin/${adminForm.aid}/medicalrecords`)
               .put(medicalrecordsphoto);
             let URL = await medicalrecordsphotoSnapshot.ref.getDownloadURL();
             let medicalrecordsphotoURL = { URL, metadata };
             await adminRef.doc(firebaseId).update({
              medicalrecordsphoto: medicalrecordsphotoURL,
             });
           });
       }
       else {
        const medicalrecordsphotoSnapshot = await storageRef
               .child(`admin/${adminForm.aid}/medicalrecords`)
               .put(medicalrecordsphoto);
             let URL = await medicalrecordsphotoSnapshot.ref.getDownloadURL();
             let medicalrecordsphotoURL = { URL, metadata };
             await adminRef.doc(firebaseId).update({
              medicalrecordsphoto: medicalrecordsphotoURL,
             });
       }
     }
    // Degree
    if (  
      adminForm.degreefile.URL===undefined
     ) {
       const metadata = {
         contentType: degreefile.type,
         customMetadata: {
           fileExtension: degreefile.name.split(".").pop(),
         },
       };
       if (adminData.degreefile.length !== 0) {
         await firebase
           .storage()
           .refFromURL(adminData.degreefile.URL)
           .delete()
           .then(async () => {
             const degreefileSnapshot = await storageRef
               .child(`admin/${adminForm.aid}/degreefile`)
               .put(degreefile);
             let URL = await degreefileSnapshot.ref.getDownloadURL();
             let degreefileURL = { URL, metadata };
             await adminRef.doc(firebaseId).update({
              degreefile: degreefileURL,
             });
           });
       }
       else {
        const degreefileSnapshot = await storageRef
               .child(`admin/${adminForm.aid}/degreefile`)
               .put(degreefile);
             let URL = await degreefileSnapshot.ref.getDownloadURL();
             let degreefileURL = { URL, metadata };
             await adminRef.doc(firebaseId).update({
              degreefile: degreefileURL,
             });
       }
     }
    // cv
    if (  
      adminForm.cv.URL===undefined
     ) {
       const metadata = {
         contentType: cv.type,
         customMetadata: {
           fileExtension: cv.name.split(".").pop(),
         },
       };
       if (adminData.cv.length !== 0) {
         await firebase
           .storage()
           .refFromURL(adminData.cv.URL)
           .delete()
           .then(async () => {
             const cvSnapshot = await storageRef
               .child(`admin/${adminForm.aid}/cv`)
               .put(cv);
             let URL = await cvSnapshot.ref.getDownloadURL();
             let cvURL = { URL, metadata };
             await adminRef.doc(firebaseId).update({
              cv: cvURL,
             });
           });
       }
       else {
        const cvSnapshot = await storageRef
        .child(`admin/${adminForm.aid}/cv`)
        .put(cv);
      let URL = await cvSnapshot.ref.getDownloadURL();
      let cvURL = { URL, metadata };
      await adminRef.doc(firebaseId).update({
       cv: cvURL,
      });
       }
     }


      //If Additional files is changed
      if (
        adminForm.additionaldocuments.length!==0&&adminForm.additionaldocuments[0].URL===undefined
       
      ) {
        let metadata = {};
        //Deleting the previous additional Files
        if (adminData.additionaldocuments && adminData.additionaldocuments.length !== 0) {
          adminData.additionaldocuments.map(async (additionaldocument) => {
            await firebase.storage().refFromURL(additionaldocument.URL).delete();
            db.collection("admin")
              .doc(firebaseId)
              .update({
                additionaldocuments:
                  firebase.firestore.FieldValue.arrayRemove(additionaldocument),
              });
          });
        }
        let additionalFilesURL = [];
        for (var i = 0; i < adminForm.additionaldocuments.length; i++) {
          metadata = {
            contentType: additionaldocuments[i].type,
            customMetadata: {
              fileExtension: additionaldocuments[i].name.split(".").pop(),
            },
          };
          const additionaldocumentSnapshot = await storageRef
            .child(
              `admin/${adminForm.aid}/additionaldocuments${i + 1}`
            )
            .put(additionaldocuments[i], { metadata });
          let URL = await additionaldocumentSnapshot.ref.getDownloadURL();
          additionalFilesURL.push({ URL, metadata });
          await adminRef.doc(firebaseId).update({
            additionaldocuments: firebase.firestore.FieldValue.arrayUnion({
              URL,
              metadata,
            }),
          });
        }
      }
  
      setIsSaving(false);
      setIsSuccessfullyAdded(true);
      formRef.current.reset();
      // Setting student form to init
      console.log("SuccessFully Added");
      setTimeout(() => {
        // Removing the alert from top after 2s
        setIsSuccessfullyAdded(false);
      }, 5000);


 
     
    };


  return (
    <div className="add-admin-form container mt-2 w-100 ">
      <div className="title bg-dark  text-center text-white w-100">
        <h5 className="text-white">Files</h5>
      </div>
         {/* Panels */}
         <div>
                {/* Change Password  */}
          <div className="panel border edit d-flex flex-column px-1 py-1 align-items-center rounded justify-content-center" onClick={()=>{
            setShowChangePasswordBox(!showChangePasswordBox);
            setShowFurtherEditBox(false);
          }}>
            <div className="icon">
              <img src={ChangePasswordICON} alt="" width={30}/>
            </div>
            <div className="text-dark text">Change Password</div>
          </div>

          {/* Further Edit Form  */}
          <div className="panel border edit d-flex flex-column px-1 py-1 align-items-center rounded justify-content-center" onClick={()=>{
            setShowChangePasswordBox(false);
            setShowFurtherEditBox(!showFurtherEditBox);
          }}> 
            <div className="icon">
              <img src={EditFormICON} alt="" width={30}/>
            </div>
            <div className="text-dark text">Edit Further</div>
          </div>

          </div>
        {/* File Download Buttons */}
       {(!isObjectEmpty(adminForm)  )? <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">

            {/* Profile Photo */}
            {(adminForm&&adminForm.adminphoto !=="")?<button className='panel border profilephoto d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(adminData.adminphoto,`${adminData.firstname.toUpperCase()+" "+adminData.lastname.toUpperCase()+"("+adminData.aid+")"}`)}}>
            <div className="icon">
              <img src={ProfilePhotoICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>Profile Photo</h5></button>:""}
            
            {/*  Admin CNIC */}
            {(adminForm&&adminForm.admincnicphoto !=="")?<button className='panel border cnic d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(adminData.admincnicphoto,`${adminData.firstname.toUpperCase()+" "+adminData.lastname.toUpperCase()+"CNIC"+"("+adminData.aid+")"}`)}}>
            <div className="icon">
              <img src={CnicICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>CNIC</h5>
              
              </button>:""}  

            {/* Degree*/}
           {(adminForm&&adminForm.degreefile !=="")? <button className='panel border parentcnic d-flex px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(adminData.degreefile,`${adminData.firstname.toUpperCase()+" "+adminData.lastname.toUpperCase()+"DegreeFile"+"("+adminData.aid+")"}`)}}>
           <div className="icon">
              <img src={DegreeFileICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>Degree</h5>
            </button>:""}

            {/* CV*/}
           {(adminForm&&adminForm.cv!=="")? <button className='panel border parentcnic d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(adminData.cv,`${adminData.firstname.toUpperCase()+" "+adminData.lastname.toUpperCase()+"DegreeFile"+"("+adminData.aid+")"}`)}}>
           <div className="icon">
              <img src={DegreeFileICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>CV</h5>
            </button>:""}

            {/* Medical Records */}
            {(adminForm&&adminForm.medicalrecordsphoto!=="")?<button className='panel border medicalrecords d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(adminData.medicalrecordsphoto,`${adminData.firstname.toUpperCase()+" "+adminData.lastname.toUpperCase()+"MedicalRecord"+"("+adminData.aid+")"}`)}}>
              <div className="icon">
              <img src={MedicalRecordICON} alt="" width={30}/>

              </div>   
             <h5 className="text-dark text"> Medical Records</h5></button>:""}

            {/* Additional Records */}
            {(adminForm&&adminForm.additionaldocuments.length!==0)?<button className='panel border additionalfiles d-flex px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{
                adminData.additionaldocuments.forEach((eachFile, index) => {
                    handleDownload(eachFile,`${adminData.firstname.toUpperCase()+" "+adminData.lastname.toUpperCase()+"AdditionalFile "+index+1+"("+adminData.aid+")"}`);
                  });
                }}>
                  <div className="icon">
              <img src={AdditionalFilesICON} alt="" width={30}/>

                  </div>
                  <h5 className="text-dark text">Additional Files</h5></button>:""}

          

        </div>:""}

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
      <form onSubmit={(e)=>{
        changePassword(e)
    }} ref={formRef}>
        {passwordChangedSuccessMessage!=="" ?(
        <Alert severity="success">{passwordChangedSuccessMessage}</Alert>
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
            {(passwordBoxErrorMessage!=="")?<span className="required">{passwordBoxErrorMessage}</span>:""}

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

  {/* Further Edit */}
              {(showFurtherEditBox)?
               <>
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
                adminPhotoURL!==''? adminPhotoURL: emptyProfile
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
              disabled
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
        value={adminForm.education}  
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
             disabled
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
           disabled
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
            <div className="row">
                {/* Can Add Student  */}
            <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Add/Remove Students *</InputLabel>
        <Select
        labelId="demo-simple-select-helper-label"
        name="canaddremovestudents"
        id="canaddremovestudents"
        value={adminForm.canaddremovestudents}
        onChange={(e) => {
          handleChange(e);
        }}
        disabled
        required
        >
          <MenuItem value={""}></MenuItem>
          <MenuItem value={true}>Yes</MenuItem>
          <MenuItem value={false}>No</MenuItem>
        </Select>
                
            </div>
            {/* Can Hire Staff */}
            <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Can Add Staff *</InputLabel>
        <Select
       name="canaddstaff"
       id="canaddstaff"
       value={adminForm.canaddstaff}
       onChange={(e) => {
         handleChange(e);
       }}
       disabled
       required
        >
          <MenuItem value={""}></MenuItem>
          <MenuItem value={true}>Yes</MenuItem>
          <MenuItem value={false}>No</MenuItem>
        </Select>
            
            </div>
           
            </div>
        </div>
        <div className="row">
           {/* Can Make and Delete Courses */}
           <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Make/Delete Courses *</InputLabel>
        <Select
      name="canmakedeletecourse"
      id="canmakedeletecourse"
      value={adminForm.canmakedeletecourse}
      onChange={(e) => {
        handleChange(e);
      }}
      disabled
      required
        >
          <MenuItem value={""}></MenuItem>
          <MenuItem value={true}>Yes</MenuItem>
          <MenuItem value={false}>No</MenuItem>
        </Select>
            
            </div>
            {/* Can Give Salary to lower designation Employees*/}
            <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Manage Salary Records *</InputLabel>
        <Select
      name="canmanagesalary"
      id="canmanagesalary"
      value={adminForm.canmanagesalary}
      onChange={(e) => {
        handleChange(e);
      }}
      disabled
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
                CNIC:
              </label>
              <input
                type="file"
                id="admincnic"
                name="admincnicphoto"
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
                CV:
              </label>
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
             </>
              :""}
       
    </div>
  )
}

export default AdminEditProfile
