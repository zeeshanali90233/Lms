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
import { sAdminUser } from "../Pages/SAdminDashboard";
import { useEffect } from "react";
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
  institutename:"",
  yearofpass:"",
  cgpa:"",
  designation: "",
  superadminphoto: "",
  superadmincnicphoto: "",
  medicalrecordsphoto: "",
  additionaldocuments: [],
  cv:"",
  degreefile:"",
  cgpa: 0.0,
};




const SuperAdminEditProfile = () => {
  const [superAdminForm, setSuperAdminForm] = useState(addSuperAdminFormInit);
  const [superAdminPhotoURL, setSuperAdminPhotoURL] = useState((superAdminForm && superAdminForm.superadminphoto!==undefined)?superAdminForm.superadminphoto.URL:"");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);
  const [superAdminData, setSuperAdminData] = useState(useContext(sAdminUser));
  const {firebaseId}=useContext(sAdminUser);
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

    db.collection("superadmin").doc(firebaseId).onSnapshot((snapshot)=>{
      setSuperAdminForm(snapshot.data());
      setSuperAdminData(snapshot.data());
      setSuperAdminPhotoURL(snapshot.data().superadminphoto.URL);

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
        navigate("/sadmin/login");
      },1500)
    })

    .catch((err)=>{
      setPasswordBoxErrorMessage("Incorrect Current Password");
    })
    return ;


  }

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
    // console.log(superAdminForm)
  };
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const superadminRef = db.collection("superadmin");
    // Create a storage reference
    const storageRef = firebase.storage().ref();

    // Taking the files
    const {
      superadminphoto,
      superadmincnicphoto,
      medicalrecordsphoto,
      additionaldocuments,
      degreefile,
      cv,
    } = superAdminForm;

    

    await superadminRef.doc(firebaseId).update({
      firstname:superAdminForm.firstname,
      lastname:superAdminForm.lastname,
      dob:superAdminForm.dob,     
      gender:superAdminForm.gender,
      address:superAdminForm.address,
      email:superAdminForm.email,
      phone:superAdminForm.phone,
      email:superAdminForm.email,
      institutename:superAdminForm.institutename,
      yearofpass:superAdminForm.yearofpass,
      education:superAdminForm.education,
      designation:superAdminForm.designation,
    })


     // Profile Photo
    if (  
      superAdminForm.superadminphoto.URL===undefined
     ) {
       const metadata = {
         contentType: superadminphoto.type,
         customMetadata: {
           fileExtension: superadminphoto.name.split(".").pop(),
         },
       };
       if (superAdminData.superadminphoto.length !== 0) {
         await firebase
           .storage()
           .refFromURL(superAdminData.superadminphoto.URL)
           .delete()
           .then(async () => {
             const superadminphotoSnapshot = await storageRef
               .child(`superadmin/${superAdminForm.said}/adminphoto`)
               .put(superadminphoto);
             let URL = await superadminphotoSnapshot.ref.getDownloadURL();
             let superadminphotoURL = { URL, metadata };
             await superadminRef.doc(firebaseId).update({
               superadminphoto: superadminphotoURL,
             });
           });
       }
       else {
         const superadminphotoSnapshot = await storageRef
               .child(`superadmin/${superAdminForm.said}/adminphoto`)
               .put(superadminphoto);
             let URL = await superadminphotoSnapshot.ref.getDownloadURL();
             let superadminphotoURL = { URL, metadata };
             await superadminRef.doc(firebaseId).update({
               superadminphoto: superadminphotoURL,
             });
       }
     }
 
     //CNIC Photo
     if (
      superAdminForm.superadmincnicphoto.URL===undefined
     
    ) {
      const metadata = {
        contentType: superadmincnicphoto.type,
        customMetadata: {
          fileExtension: superadmincnicphoto.name.split(".").pop(),
        },
      };

      if (superAdminData.superadmincnicphoto.length !== 0) {
        await firebase
          .storage()
          .refFromURL(superAdminData.superadmincnicphoto.URL)
          .delete()
          .then(async () => {
            const superadmincnicphotoSnapshot = await storageRef
              .child(`superadmin/${superAdminForm.said}/cnicphoto`)
              .put(superadmincnicphoto);
            let URL = await superadmincnicphotoSnapshot.ref.getDownloadURL();
            let superadmincnicphotoURL = { URL, metadata };
            await superadminRef.doc(firebaseId).update({
              superadmincnicphoto: superadmincnicphotoURL,
            });
          });
      }
      else {
        const superadmincnicphotoSnapshot = await storageRef
        .child(`superadmin/${superAdminForm.said}/cnicphoto`)
        .put(superadmincnicphoto);
      let URL = await superadmincnicphotoSnapshot.ref.getDownloadURL();
      let superadmincnicphotoURL = { URL, metadata };
      await superadminRef.doc(firebaseId).update({
        superadmincnicphoto: superadmincnicphotoURL,
      });
      }
    }
     //Medical Records Photo
     if (
      superAdminForm.medicalrecordsphoto.URL===undefined
     
    ) {
      const metadata = {
        contentType: medicalrecordsphoto.type,
        customMetadata: {
          fileExtension: medicalrecordsphoto.name.split(".").pop(),
        },
      };
      if (superAdminData.medicalrecordsphoto.length !== 0) {
        await firebase
          .storage()
          .refFromURL(superAdminData.medicalrecordsphoto.URL)
          .delete()
          .then(async () => {
            const medicalrecordsphotoSnapshot = await storageRef
              .child(`superadmin/${superAdminForm.said}/medicalrecords`)
              .put(medicalrecordsphoto);
            let URL = await medicalrecordsphotoSnapshot.ref.getDownloadURL();
            let medicalrecordsphotoURL = { URL, metadata };
            await superadminRef.doc(firebaseId).update({
              medicalrecordsphoto: medicalrecordsphotoURL,
            });
          });
      }
      else {
        const medicalrecordsphotoSnapshot = await storageRef
        .child(`superadmin/${superAdminForm.said}/medicalrecords`)
        .put(medicalrecordsphoto);
      let URL = await medicalrecordsphotoSnapshot.ref.getDownloadURL();
      let medicalrecordsphotoURL = { URL, metadata };
      await superadminRef.doc(firebaseId).update({
        medicalrecordsphoto: medicalrecordsphotoURL,
      });
      }
    }
     //Degree File
     if (
      superAdminForm.degreefile.URL==undefined
    
    ) {
      const metadata = {
        contentType: degreefile.type,
        customMetadata: {
          fileExtension: degreefile.name.split(".").pop(),
        },
      };
      if (superAdminData.degreefile.length !== 0) {
        await firebase
          .storage()
          .refFromURL(superAdminData.degreefile.URL)
          .delete()
          .then(async () => {
            const degreefileSnapshot = await storageRef
              .child(`superadmin/${superAdminForm.said}/degree`)
              .put(degreefile);
            let URL = await degreefileSnapshot.ref.getDownloadURL();
            let degreefileURL = { URL, metadata };
            await superadminRef.doc(firebaseId).update({
              degreefile: degreefileURL,
            });
          });
      }
      else {
        const degreefileSnapshot = await storageRef
        .child(`superadmin/${superAdminForm.said}/degree`)
        .put(degreefile);
      let URL = await degreefileSnapshot.ref.getDownloadURL();
      let degreefileURL = { URL, metadata };
      await superadminRef.doc(firebaseId).update({
        degreefile: degreefileURL,
      });
      }
    }
     //CV
     if (
      superAdminForm.cv.URL===undefined
 
    ) {
      const metadata = {
        contentType: cv.type,
        customMetadata: {
          fileExtension: cv.name.split(".").pop(),
        },
      };
      if (superAdminData.cv.length !== 0) {
        await firebase
          .storage()
          .refFromURL(superAdminData.cv.URL)
          .delete()
          .then(async () => {
            const cvSnapshot = await storageRef
              .child(`superadmin/${superAdminForm.said}/cv`)
              .put(cv);
            let URL = await cvSnapshot.ref.getDownloadURL();
            let cvURL = { URL, metadata };
            await superadminRef.doc(firebaseId).update({
              cv: cvURL,
            });
          });
      }
      else {
        const cvSnapshot = await storageRef
        .child(`superadmin/${superAdminForm.said}/cv`)
        .put(cv);
      let URL = await cvSnapshot.ref.getDownloadURL();
      let cvURL = { URL, metadata };
      await superadminRef.doc(firebaseId).update({
        cv: cvURL,
      });
      }
    }
     //If Additional files is changed
     if (
      superAdminForm.additionaldocuments.length!==0&&superAdminForm.additionaldocuments[0].URL===undefined
     
    ) {
      let metadata = {};
      //Deleting the previous additional Files
      if (additionaldocuments && additionaldocuments.length !== 0) {
        superAdminData.additionaldocuments.map(async (additionaldocument) => {
          await firebase.storage().refFromURL(additionaldocument.URL).delete();
          db.collection("superadmin")
            .doc(firebaseId)
            .update({
              additionaldocuments:
                firebase.firestore.FieldValue.arrayRemove(additionaldocument),
            });
        });
      }
      let additionalFilesURL = [];
      for (var i = 0; i < superAdminForm.additionaldocuments.length; i++) {
        metadata = {
          contentType: additionaldocuments[i].type,
          customMetadata: {
            fileExtension: additionaldocuments[i].name.split(".").pop(),
          },
        };
        const additionaldocumentSnapshot = await storageRef
          .child(
            `superadmin/${superAdminForm.said}/additionaldocuments${i + 1}`
          )
          .put(additionaldocuments[i], { metadata });
        let URL = await additionaldocumentSnapshot.ref.getDownloadURL();
        additionalFilesURL.push({ URL, metadata });
        await superadminRef.doc(firebaseId).update({
          additionaldocuments: firebase.firestore.FieldValue.arrayUnion({
            URL,
            metadata,
          }),
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
       {(!isObjectEmpty(superAdminForm)  )? <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">

            {/* Profile Photo */}
            {(superAdminForm&&superAdminForm.superadminphoto !=="")?<button className='panel border profilephoto d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(superAdminData.superadminphoto,`${superAdminData.firstname.toUpperCase()+" "+superAdminData.lastname.toUpperCase()+"("+superAdminData.said+")"}`)}}>
            <div className="icon">
              <img src={ProfilePhotoICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>Profile Photo</h5></button>:""}
            
            {/* Super Admin CNIC */}
            {(superAdminForm&&superAdminForm.superadmincnicphoto !=="")?<button className='panel border cnic d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(superAdminData.superadmincnicphoto,`${superAdminData.firstname.toUpperCase()+" "+superAdminData.lastname.toUpperCase()+"CNIC"+"("+superAdminData.said+")"}`)}}>
            <div className="icon">
              <img src={CnicICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>CNIC</h5>
              
              </button>:""}  

            {/* Degree*/}
           {(superAdminForm&&superAdminForm.degreefile !=="")? <button className='panel border parentcnic d-flex px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(superAdminData.degreefile,`${superAdminData.firstname.toUpperCase()+" "+superAdminData.lastname.toUpperCase()+"DegreeFile"+"("+superAdminData.said+")"}`)}}>
           <div className="icon">
              <img src={DegreeFileICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>Degree</h5>
            </button>:""}

            {/* CV*/}
           {(superAdminForm&&superAdminForm.cv.length!==0)? <button className='panel border parentcnic d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(superAdminData.cv,`${superAdminData.firstname.toUpperCase()+" "+superAdminData.lastname.toUpperCase()+"DegreeFile"+"("+superAdminData.said+")"}`)}}>
           <div className="icon">
              <img src={DegreeFileICON} alt="" width={30}/>
            </div>
              <h5 className='text-dark text'>CV</h5>
            </button>:""}

            {/* Medical Records */}
            {(superAdminForm&&superAdminForm.medicalrecordsphoto.length!==0)?<button className='panel border medicalrecords d-flex  px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{handleDownload(superAdminData.medicalrecordsphoto,`${superAdminData.firstname.toUpperCase()+" "+superAdminData.lastname.toUpperCase()+"MedicalRecord"+"("+superAdminData.said+")"}`)}}>
              <div className="icon">
              <img src={MedicalRecordICON} alt="" width={30}/>

              </div>   
             <h5 className="text-dark text"> Medical Records</h5></button>:""}

            {/* Additional Records */}
            {(superAdminForm&&superAdminForm.additionaldocuments.length!==0)?<button className='panel border additionalfiles d-flex px-4 py-3 align-items-center rounded justify-content-center' onClick={()=>{
                superAdminData.additionaldocuments.forEach((eachFile, index) => {
                    handleDownload(eachFile,`${superAdminData.firstname.toUpperCase()+" "+superAdminData.lastname.toUpperCase()+"AdditionalFile "+index+1+"("+superAdminData.said+")"}`);
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
    
      {/* Further Edit Box */}
     {(showFurtherEditBox)? <>  {isSuccessfullyAdded ?(
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div>
        <h2 className="text-center">Super Admin Edit Form</h2>
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
                superAdminPhotoURL!==''? superAdminPhotoURL: emptyProfile
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
              value={superAdminForm.dob}
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
                value={superAdminForm.education}
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
                id="superadmincnic"
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
      </form></>:""}
    </div>
  );

}

export default SuperAdminEditProfile;