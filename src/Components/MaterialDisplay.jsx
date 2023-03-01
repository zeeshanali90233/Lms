import React, { useState,useEffect ,useRef,useContext} from "react";
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/system';
import firebase from 'firebase/compat/app';
import { db } from "../Firebase/config";
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import FilePagination from "./FilePagination";
import VideoPagination from "./VideoPagination";

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import AddVideoLectureICON from "../Assets/Logos/AddVideoLectureICON.png";
import AddFileICON from "../Assets/Logos/AddFileICON.png";
import { showMaterialDeleteButtonContext } from "./CourseDetails";

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


const SaveButton=styled(LoadingButton)({
    backgroundColor:"#00233a",
    '&:hover':{
      backgroundColor:"#393c41"
    }
  })

  

const MaterialDisplay = ({ firebaseId }) => {
  const [showAddVideoLectureBox, setShowAddVideoLectureBox] = useState(false);
  const [showAddFileBox, setShowAddFileBox] = useState(false);
  const [addMaterialForm,setAddMaterialForm]=useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isInvalidLink, setisInvalidLink] = useState(false);
  const [isInvalidFile, setisInvalidFile] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const [course, setCourse] = useState(false);
  const {showAddMaterialButtons}=useContext(showMaterialDeleteButtonContext);

  // Form Reference
  const formRef=useRef(null);
  
  const handleShowAddFileBoxClose = () => {setShowAddFileBox(false);setIsSuccessfullyAdded(false)};
  const handleShowVideoLectureBoxClose = () =>{ setShowAddVideoLectureBox(false);setIsSuccessfullyAdded(false)};

  useEffect(()=>{
    return(db.collection("courses").doc(firebaseId).onSnapshot((snapshot)=>{
        setCourse({...snapshot.data(),firebaseId:snapshot.id});
    }))
  },[])
  // It  returns the embeded link
const EmbedLink = (link) => {
    const videoKey = link.split("=")[1];
    const embedLink = `https://www.youtube.com/embed/${videoKey}`;
    return embedLink;
  };

  const handleChange=(e)=>{
    e.preventDefault();
    if(e.target.name==="lecturefile"){
      const fileExtension = e.target.files[0].name.substr(e.target.files[0].name.lastIndexOf('.'));
      setAddMaterialForm({...addMaterialForm,[e.target.name]:e.target.files[0],fileExtension:fileExtension});
      return ;
    }
    setAddMaterialForm({...addMaterialForm,[e.target.name]:e.target.value});
    setisInvalidLink(false);
    setisInvalidFile(false);
  }


  const saveLectureVideo=async(e)=>{
    e.preventDefault();
    // It Validates the entered link
    if (!addMaterialForm.videolink.startsWith("https://www.youtube.com/watch?v=")) {
        setisInvalidLink(true);
      return ;
    }
    setIsSaving(true);
    const embedLink=EmbedLink(addMaterialForm.videolink)
    await db.collection("courses").doc(firebaseId).update({
        lectureVideos:firebase.firestore.FieldValue.arrayUnion({
            title:addMaterialForm.videotitle,
            videoLink:embedLink,
        })
    })
    
    setIsSaving(false);
    setAddMaterialForm({});
    setIsSuccessfullyAdded(true);
    setShowAddVideoLectureBox(false);
    formRef.current.reset();
    setTimeout(()=>{
        setIsSuccessfullyAdded(false);
    },2000)


  }
  const saveLectureFile=async(e)=>{
    e.preventDefault();
    setIsSaving(true);
    // Create a storage reference
    const storageRef = firebase.storage().ref();
    let lecturefileURL

    const metadata = {
      contentType: addMaterialForm.lecturefile.type,
      customMetadata: {
        fileExtension: addMaterialForm.lecturefile.name.split(".").pop(),
      }
    };
  
    if (addMaterialForm.lecturefile) {
        const lecturefileSnapshot = await storageRef
          .child(`courses/${course.courseId}/${addMaterialForm.filetitle}`)
          .put(addMaterialForm.lecturefile,{metadata});
          lecturefileURL =
          await lecturefileSnapshot.ref.getDownloadURL();
      }
    await db.collection("courses").doc(firebaseId).update({
        lectureFiles:firebase.firestore.FieldValue.arrayUnion({fileTitle:addMaterialForm.filetitle,fileURL:lecturefileURL,metadata:metadata})
    })
    
    setIsSaving(false);
    setAddMaterialForm({});
    setIsSuccessfullyAdded(true);
    setShowAddFileBox(false);
    formRef.current.reset();
    setTimeout(()=>{
        setIsSuccessfullyAdded(false);
    },2000)


  }


  return (
    <div className="w-100 container mt-1">
      <div className="title bg-dark  text-center text-white w-100 rounded py-1 ">
        <h4 className="text-white">Material</h4>
      </div>
      {isSuccessfullyAdded ? (
         <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}

        {/* Buttons */}
      {(showAddMaterialButtons)?<div className="btns d-flex w-100 justify-content-evenly flex-wrap mt-1" >
        <div className="panel border addlecturevideo d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center user-select-none" onClick={()=>{
        setShowAddVideoLectureBox(!showAddVideoLectureBox);
        setShowAddFileBox(false);
      }}>
        <div className="icon">
          <img src={AddVideoLectureICON} alt="" width={30}/>
        </div>
          <h5 className="text-dark text user-select-none">Add Lecture Video</h5>
        </div>
        <div className="panel border addlecturefile d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center" onClick={()=>{
            setShowAddFileBox(!showAddFileBox);
            setShowAddVideoLectureBox(false);
      }}>
       <div className="icon">
          <img src={AddFileICON} alt="" width={30}/>
        </div>
          <h5 className="text-dark text user-select-none">Add Lecture Files</h5>
        </div>
      </div>:""}

      {/* Course Lecture Files Pagination */} 
      {(course && !showAddFileBox && !showAddVideoLectureBox)?<FilePagination data={course.lectureFiles} outlineFile={course.courseOutlineFile} additionalDocs={course.courseAdditionalDocs} courseFirebaseId={course.firebaseId}/>:""}
      {/* Course Lecture Videos Pagination */}
      {(course && !showAddFileBox && !showAddVideoLectureBox)?<VideoPagination data={course.lectureVideos}  courseFirebaseId={course.firebaseId}/>:""}


    {/* Adding Lecture Videos */}
    {(showAddVideoLectureBox)?
    <Modal
    aria-labelledby="transition-modal-title"
    aria-describedby="transition-modal-description"
    open={showAddVideoLectureBox}
    onClose={handleShowVideoLectureBoxClose}
    closeAfterTransition
    BackdropComponent={Backdrop}
    BackdropProps={{
      timeout: 500,
    }}
  >
    <Fade in={showAddVideoLectureBox}>
      <Box sx={style}>
      <form onSubmit={(e)=>{
        saveLectureVideo(e)
    }} ref={formRef}>
        {/* Title Input*/}
        <div className="d-flex flex-column col">
            <label htmlFor="video-title">
              Video Title:<span className="required">*</span>
            </label>
            <input
              type="text"
              id="video-title"
              name="videotitle"
              placeholder="Enter the title of video"
              className="py-1 px-2 rounded "
              value={addMaterialForm.videotitle}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            ></input>
          </div>
          {/* Video Youtube Link */}
        <div className="d-flex flex-column col">
            <label htmlFor="video-link">
              Video Youtube Link:<span className="required">*</span>
            </label>
            <input
              type="text"
              id="videolink"
              name="videolink"
              placeholder="Enter the title of video"
              className="py-2 px-2 rounded "
              value={addMaterialForm.videolink}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            ></input>
            {(isInvalidLink)?<span className="required">Invalid Link</span>:""}
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
          <span>Save</span>
        </SaveButton>
          </div>
        
    </form>
      </Box>
    </Fade>
  </Modal>
    
          
    :""}


    {/* Adding File Section */}
    {(showAddFileBox)?
        <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showAddFileBox}
        onClose={handleShowAddFileBoxClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showAddFileBox}>
        <Box sx={style}>
        <form onSubmit={(e)=>{
        saveLectureFile(e)
    }} ref={formRef}>
        {/* Title Input*/}
        <div className="d-flex flex-column col">
            <label htmlFor="file-title">
              File Title:<span className="required">*</span>
            </label>
            <input
              type="text"
              id="file-title"
              name="filetitle"
              placeholder="Enter the title of file"
              className="py-1 px-2 rounded "
              value={addMaterialForm.videotitle}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            ></input>
          </div>
          {/*LecturE FILE */}
        <div className="d-flex flex-column col">
            <label htmlFor="video-link">
              Lecture File:<span className="required">*</span>
            </label>
            <div className="input-group mb-3">
            <input
              type="file"
              className="form-control"
              id="lecturefile"
              name="lecturefile"
              onChange={(e) => {
                handleChange(e);
              }}
            ></input>
          </div>
            {(isInvalidFile)?<span className="required">This file format is not supported</span>:""}
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
          <span>Save</span>
        </SaveButton>
          </div>
          </form>
        </Box>
        </Fade>
      </Modal>
        
          
        
    :""}
    </div>
  );
};

export default MaterialDisplay;
