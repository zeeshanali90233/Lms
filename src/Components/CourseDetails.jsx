import React, { createContext, useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../Firebase/config";
import Alert from "@mui/material/Alert";
import "../Css/CoursePage.css";
import MaterialDisplay from "./MaterialDisplay";
import CourseEnrollStudent from "./CourseEnrollStudent";
import CourseEdit from "./CourseEdit";
import CourseRoughMaterial from "./CourseRoughMaterial";

import MaterialsICON from "../Assets/Logos/MaterialsICON.png";
import AttendanceICON from "../Assets/Logos/AttendanceICON.png";
import AssignmentICON from "../Assets/Logos/AssignmentICON.png";
import QuizesICON from "../Assets/Logos/QuizesICON.png";
import EnrollStudentICON from "../Assets/Logos/EnrollStudentICON.png";
import RoughMaterialICON from "../Assets/Logos/RoughMaterialICON.png";
import CourseAttendence from "./CourseAttendence";
import TextField from "@mui/material/TextField";
import { staffUser } from "../Pages/StaffDashboard";




export const showMaterialDeleteButtonContext=createContext(); 

const CourseDetails = ({showEditButton,showMaterialDeleteButton,showCreateLectureButton,showAddMaterialButtons,showAttendencePanel ,showEnrollStudentPanel,showAddRoughMaterialButtons}) => {
  const { state} = useLocation();
  const [course, setCourse] = useState([]);
  const [instructorName, setInstructorName] = useState();
  // To Show complete description or to short it
  const [showCompleteDesc, setShowCompleteDesc] = useState(false);
  const [showMaterialsBox, setShowMaterialsBox] = useState(false);
  const [showAttendence, setShowAttendence] = useState(false);
  const [showAssignmentBox, setShowAssignmentBox] = useState(false);
  const [showQuizes, setShowQuizes] = useState(false);
  const [showEnrollStudentBox, setShowEnrollStudentBox] = useState(false);
  const [showAddRoughMaterialBox, setShowAddRoughMaterialBox] = useState(false);
  const staffData=useContext(staffUser || {});
  
  // Shows the edit form
  const [editCourse, setEditCourse] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);

  


  useEffect(() => {
    return db
      .collection("courses")
      .doc(state.firebaseId)
      .onSnapshot(async (doc) => {
        await setCourse({ ...doc.data(), firebaseId: doc.id });
        await getInstructorName(doc.data().courseInstructorId);
      });
  }, []);

  const getInstructorName = async (id) => {
    const doc = await db
      .collection("teachers")
      .doc(id)
      .get();
    setInstructorName(
      doc.data().firstname +
        " " +
        doc.data().lastname +
        "(" +
        doc.data().tid +
        ")"
    );
  };
  return (
    <div className="d-flex flex-column align-items-center">
      <div className="title bg-dark  text-center text-white w-100">
        <h3 className="text-white">Course Detail</h3>
      </div>
      <div className="w-100">
        {isSuccessfullyAdded ? (
          <Alert severity="success">Successfully Added</Alert>
        ) : (
          ""
        )}
      </div>
      
     {/* Edit Button */}
      {/*!Importane It's CSS is in the studentpage.css , due to global scope it is accessible here */}
      {(showEditButton && (staffData && staffData.courseauthority)?staffData.courseauthority.edit:true)?
      <div
        className="w-100 d-flex mt-2 justify-content-end pe-2"
        onClick={() => {
          setEditCourse(!editCourse);
        }}
      >
        <button type="submit" id="edit-button" className='border rounded'  >Edit</button>
      </div>:""}

        {/* Course Thumbnail Image */}
      <div className="mt-1"> 
          <img src={(course.courseThumbnail)?course.courseThumbnail.URL:""} alt="Course Thumbnail" width={230} className="rounded"/>
      </div>
      <div className="student-fee-details mt-2 w-100  ms-2 d-md-flex justify-content-center">
        <div className="w-100">
        <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Course ID"
                variant="standard"
                value= {course.courseId}
                InputProps={{            
                  readOnly: true,
                }}
                focused
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Course Name"
                variant="standard"
                value= {course.courseName}
                InputProps={{
                  readOnly: true,
                }}
                focused
              />
            </div>
          </div>


        <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Duration"
                variant="standard"
                value={`${course.courseDuration} Months `}
                InputProps={{            
                  readOnly: true,
                }}
                focused
              />
            </div>
           
           {(showAttendencePanel)?
            <div className="col d-flex flex-column">
            <TextField
              id="standard-basic"
              label="No of Students Enrolled"
              variant="standard"
              value=  {course.noOfStudents}
              InputProps={{
                readOnly: true,
              }}
              focused
            />
          </div>
          :""}
           
          </div>


        <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Lecture Delivered"
                variant="standard"
                value={course.noOfLecturesDelivered}
                InputProps={{            
                  readOnly: true,
                }}
                focused
              />
            </div>
           
            <div className="col d-flex flex-column">
            <TextField
              id="standard-basic"
              label="Instructor Name"
              variant="standard"
              value= {instructorName}
              InputProps={{
                readOnly: true,
              }}
              focused
            />
          </div>
           
          </div>


        <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Description"
                variant="standard"
                multiline
                rows={4}
                value= {course.courseDesc}
                InputProps={{            
                  readOnly: true,
                }}
                focused
              />
            </div>
          
           
          </div>
        </div>
       
      </div>

      {(editCourse===false)?<><div className="course-panels panels w-100 mt-3 flex-wrap container">
        {/* Material */}
        <div className="panel border coursematerial d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center user-select-none" onClick={()=>{
            setShowMaterialsBox(!showMaterialsBox);
            setShowAssignmentBox(false);
            setShowAttendence(false);
            setShowQuizes(false);
            setShowAddRoughMaterialBox(false);
            setShowEnrollStudentBox(false);
        }}>
          <div className="icon">
              <img src={MaterialsICON} alt="" width={40}/>
            </div>
              <h4 className='text-dark text text-center'>Material</h4>
        </div>
        {/* Attendence */}
        {(showAttendencePanel)?<div className="panel border attendance d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center user-select-none" onClick={()=>{
            setShowMaterialsBox(false);
            setShowAssignmentBox(false);
            setShowAttendence(!showAttendence);
            setShowQuizes(false);
            setShowAddRoughMaterialBox(false);
            setShowEnrollStudentBox(false);
        }}>
           <div className="icon">
              <img src={AttendanceICON} alt="" width={40}/>

              </div>
             <h4 className="text-dark text">Attendence</h4>
        
        </div>:""}
        <div className="panel border assignment d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center user-select-none" onClick={()=>{
            setShowMaterialsBox(false);
            setShowAssignmentBox(!showAssignmentBox);
            setShowAttendence(false);
            setShowQuizes(false);
            setShowAddRoughMaterialBox(false);
            setShowEnrollStudentBox(false);
        }}>
          <div className="icon">
              <img src={AssignmentICON} alt="" width={40}/>

              </div>
             <h4 className="text-dark text text-center">Assignment</h4>
        </div>
        <div className="panel border quizes d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center user-select-none">
        <div className="icon">
              <img src={QuizesICON} alt="" width={40}/>

              </div>
             <h4 className="text-dark text text-center">Quizes</h4>
        </div>
        {(showEnrollStudentPanel)?<div className="panel border enrollstudent d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center user-select-none" onClick={()=>{
            setShowMaterialsBox(false);
            setShowAssignmentBox(false);
            setShowAttendence(false);
            setShowQuizes(false);
            setShowAddRoughMaterialBox(false);
            setShowEnrollStudentBox(!showEnrollStudentBox);
        }}>
           <div className="icon">
              <img src={EnrollStudentICON} alt="" width={40}/>

              </div>
             <h4 className="text-dark text text-center">Enroll Student</h4>
        </div>:""}
        <div className="panel border roughmaterial d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center user-select-none" onClick={()=>{
            setShowMaterialsBox(false);
            setShowAssignmentBox(false);
            setShowAttendence(false);
            setShowQuizes(false);
            setShowEnrollStudentBox(false);
            setShowAddRoughMaterialBox(!showAddRoughMaterialBox);
        }}>
         <div className="icon">
              <img src={RoughMaterialICON} alt="" width={40}/>

              </div>
             <h4 className="text-dark text text-center">Rough Material</h4>
        </div>
      </div>

      {/* Panel Extension */}
      {/* Material Box */}
      <showMaterialDeleteButtonContext.Provider value={{showMaterialDeleteButton,showAddMaterialButtons,showAddRoughMaterialButtons}}>
      {showMaterialsBox ? <MaterialDisplay firebaseId={course.firebaseId} /> : ""}
      {/* Rough Material Box */}
      {showAddRoughMaterialBox?<CourseRoughMaterial firebaseId={course.firebaseId} />:""}
      </showMaterialDeleteButtonContext.Provider>
      {/* Student Enrollment Box */}
      {showEnrollStudentBox ? <CourseEnrollStudent courseFirebaseId={course.firebaseId} courseName={course.courseName} showEnrollStudentBox={showEnrollStudentBox} setShowEnrollStudentBox={setShowEnrollStudentBox}/>
      : ""}

      {/* Attendence Box */}
      {showAttendence?<CourseAttendence course={course} showCreateLectureButton={showCreateLectureButton}/>:""}
      </>:
      // Course Edit
      <div className="w-100 mt-3 flex-wrap container">
        <CourseEdit course={course}/>
      </div>
      }

    </div>
  );
};

export default CourseDetails;
