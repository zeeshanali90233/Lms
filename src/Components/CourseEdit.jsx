import React from 'react'
import { useState,useRef ,useEffect} from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/system';
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { db } from "../Firebase/config";

import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});
  
const CourseEdit = ({course}) => {
    const [courseForm, setCourseForm] = useState(course);
    const [courseData, setCourseData] = useState(course);
    const [courseThumbnailPic, setCourseThumbnailPic] = useState(course.courseThumbnail);
    const [teachers, setTeachers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
    const formRef=useRef(null);

    useEffect(() => {

        const fetchTeachers=()=>{
          db.collection("teachers").onSnapshot((snapshot) => {
            let data = [];
            snapshot.forEach((doc) => {
              data.push({ ...doc.data(), firebaseId: doc.id });
            });
            setTeachers(data);
          });
        }

        const fetchCourseDetail=()=>{
          db.collection("courses").doc(course.firebaseId).onSnapshot((snapshot) => {
            
            setCourseData({...snapshot.data(),firebaseId:snapshot.id});
            setCourseForm({...snapshot.data(),firebaseId:snapshot.id});
            setCourseThumbnailPic(snapshot.data().courseThumbnail);
          });
        }

        fetchTeachers();
        fetchCourseDetail();
      }, []);

   //It handles the form changes
   const handleChange = (e) => {
    if (e.target.name === "courseThumbnail") {
      setCourseForm({ ...courseForm, [e.target.name]: e.target.files[0] });
      setCourseThumbnailPic(URL.createObjectURL(e.target.files[0]));
    } else if (e.target.name === "courseAdditionalDocs") {
      setCourseForm({ ...courseForm, [e.target.name]: e.target.files });
    } else if(e.target.name === "courseOutlineFile"){

      setCourseForm({ ...courseForm, [e.target.name]: e.target.files[0] });
    }

    else {
      setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
    }
    // console.log(courseForm);
  };


  //It handles the for submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the courses collection
    const coursesRef = db.collection("courses");
    const storageRef = firebase.storage().ref();
    //Updating the text fields
    if(courseForm.courseId!==courseData.courseId || courseForm.courseName!==courseData.courseName || courseForm.courseDuration!==courseData.courseDuration || courseForm.courseInstructorId!==courseData.courseInstructorId ||  courseForm.noOfStudents!==courseData.noOfStudents || courseForm.courseDesc!==courseData.courseDesc){
        await coursesRef.doc(courseData.firebaseId).update({
            courseId:courseForm.courseId,
            courseName:courseForm.courseName,
            courseDesc:courseForm.courseDesc,
            courseDuration:courseForm.courseDuration,
            courseInstructorId:courseForm.courseInstructorId,
            noOfStudents:courseForm.noOfStudents
        })
    }
// If Instrcutor changed
    if(courseForm.courseInstructorId!==courseData.courseInstructorId &&courseForm.courseInstructorId!=="" ){
// Adding this course to new instructor
      db.collection("teachers").doc(courseForm.courseInstructorId).update({
        courses:firebase.firestore.FieldValue.arrayUnion(courseForm.firebaseId),
        coursesname:firebase.firestore.FieldValue.arrayUnion(courseForm.courseName),
      })
// Removing this course from previous Instructor
      if(courseData.courseInstructorId!==""){
        db.collection("teachers").doc(courseData.courseInstructorId).update({
          courses:firebase.firestore.FieldValue.arrayRemove(courseData.firebaseId),
          coursesname:firebase.firestore.FieldValue.arrayRemove(courseData.courseName),
        })
      }
    }

    // CourseName Change
    if(courseForm.courseName!==courseData.courseName){
      // Instructor Side Updation
      if (courseForm.courseInstructorId !== "") {
        const teacherRef = db.collection("teachers").doc(courseForm.courseInstructorId);
        teacherRef.get().then((doc) => {
          if (doc.exists) {
            const teacherData = doc.data();
            const coursesname = teacherData.coursesname;
            const oldCourseName = courseData.courseName;
            const newCourseName = courseForm.courseName;
            const courseNameIndex = coursesname.indexOf(oldCourseName);
            coursesname[courseNameIndex]=newCourseName;
            if (courseNameIndex > -1) {
              teacherRef.update({ coursesname: coursesname });
            }
          }
        });
      }
      if(courseForm.noOfStudents!==0){
        // Student side update
        courseForm.enrolledStudents.forEach((studentId)=>{
          const studentRef = db.collection("students").doc(studentId);
          studentRef.get().then((doc) => {
            if (doc.exists) {
              const studentData = doc.data();
              const batch = studentData.batch;
              const oldCourseName = courseData.courseName;
              const newCourseName = courseForm.courseName;
              const courseNameIndex = batch.indexOf(oldCourseName);
              batch[courseNameIndex]=newCourseName;
              if (courseNameIndex > -1) {
                studentRef.update({ batch: batch });
              }
            }
          });
        })
// Fees side update
        courseForm.studentfees.forEach((feeId)=>{
          const feeRef = db.collection("fees").doc(feeId);
          feeRef.get().then((doc) => {
            if (doc.exists) {
              feeRef.update({ coursename: courseForm.courseName });
            }
          });
        })
      }
    }
    // Taking the files
    const { courseThumbnail, courseAdditionalDocs, courseOutlineFile } =
      courseForm;
      if(JSON.stringify(courseForm.courseThumbnail) !==
      JSON.stringify(courseData.courseThumbnail)){
        await firebase.storage().refFromURL(courseData.courseThumbnail.URL).delete()
        .then(async()=>{
          const metadata= {
            contentType: courseThumbnail.type,
            customMetadata: {
              fileExtension: courseThumbnail.name.split(".").pop(),
            }
          };
            const coursethumbnailSnapshot = await storageRef
            .child(`courses/${courseData.courseId}/coursethumbnail`)
            .put(courseThumbnail);
         let URL =
            await coursethumbnailSnapshot.ref.getDownloadURL();
          let  courseThumbnailURL={URL,metadata}
            await coursesRef.doc(courseData.firebaseId).update({
                courseThumbnail: courseThumbnailURL,
              });
        })
      }
      if(JSON.stringify(courseForm.courseOutlineFile) !==
      JSON.stringify(courseData.courseOutlineFile)){
        const metadata={
          contentType: courseOutlineFile.type,
          customMetadata: {
            fileExtension: courseOutlineFile.name.split(".").pop(),
          }
        };
        await firebase.storage().refFromURL(courseData.courseOutlineFile.courseOutlineFileURL).delete()
        .then(async()=>{
            const courseoutlineurlSnapshot = await storageRef
            .child(`courses/${courseData.courseId}/courseoutline`)
            .put(courseOutlineFile,{metadata});
         let courseOutlineFileURL =
            await courseoutlineurlSnapshot.ref.getDownloadURL();
            await coursesRef.doc(courseData.firebaseId).update({
              courseOutlineFile: {courseOutlineFileURL,metadata},
              });
        })
      }
      if(courseForm.courseAdditionalDocs.length!==0 && courseForm.courseAdditionalDocs[0].URL===undefined &&
        (JSON.stringify(courseForm.courseAdditionalDocs) !==
      JSON.stringify(courseData.courseAdditionalDocs) )){
        let metadata={};
        //Deleting the previous additional Files
      if (courseData.courseAdditionalDocs && courseData.courseAdditionalDocs.length !== 0) {
        courseData.courseAdditionalDocs.map(async (courseAdditionalDoc) => {
          await firebase.storage().refFromURL(courseAdditionalDoc.additionalFileURL).delete();
          db.collection("courses")
            .doc(courseData.firebaseId)
            .update({
              courseAdditionalDocs:
                firebase.firestore.FieldValue.arrayRemove(courseAdditionalDoc),
            });
        });
      }

      for (var i = 0; i < courseForm.courseAdditionalDocs.length; i++) {
        metadata = {
          contentType: courseAdditionalDocs[i].type,
          customMetadata: {
            fileExtension: courseAdditionalDocs[i].name.split(".").pop(),
          },
        };
        const courseAdditionalDocsSnapshot = await storageRef
        .child(`courses/${courseForm.courseId}/additionaldocuments${i+1}`)
        .put(courseAdditionalDocs[i], { metadata });

        let additionalFileURL = await courseAdditionalDocsSnapshot.ref.getDownloadURL();
        await coursesRef.doc(courseData.firebaseId).update({
          courseAdditionalDocs: firebase.firestore.FieldValue.arrayUnion({ additionalFileURL, metadata }),
          });
        }
      }
       
      
      setIsSaving(false);
      setIsSuccessfullyAdded(true);
      setTimeout(()=>{setIsSuccessfullyAdded(false)},1500)
  };
  return (
    <div className="add-course-form container mt-2 w-100 ">
    {isSuccessfullyAdded ? (
    <Alert severity="success">Successfully Added</Alert>
    ) : (
      ""
    )}
    <div>
      <h2 className="text-center">Edit Course</h2>
    </div>
    <form
      onSubmit={(e) => {
        handleSubmit(e);
      }}
      ref={formRef}
    >
      {/* Course Thumbnail */}
      <div className=" d-flex justify-content-center me-auto">
        <div>
          {courseThumbnailPic ? (
            <img
              src={(courseThumbnailPic.URL!==undefined)?courseThumbnailPic.URL:courseThumbnailPic}
              className="rounded"
              alt="Course Thumbnail"
              width={130}
            />
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="row mt-2">
        <div className="input-group mb-3">
          <input
            type="file"
            className="form-control"
            id="coursethumbnail"
            name="courseThumbnail"
            onChange={(e) => {
              handleChange(e);
            }}
          ></input>
        </div>
      </div>
      {/* Course Information */}
      <div className="row">
        <div className="d-flex flex-column col">
        <TextField
              id="outlined-basic"
              label="Course ID"
              variant="outlined"
              type="text"
            name="courseId"
            placeholder="c123"
            value={courseForm.courseId}
            onChange={(e) => {
              handleChange(e);
            }}
            focused
            required
            disabled
            />
     
        </div>
      </div>
      <div className="row mt-2">
        <div className="d-flex flex-column col">
        <TextField
              id="outlined-basic"
              label="Course Name"
              variant="outlined"
              type="text"
              name="courseName"
              placeholder="Digical Logic Design(DLD)"
              value={courseForm.courseName}
              onChange={(e) => {
                handleChange(e);
              }}
              required
              focused
            />
       
        </div>
      </div>
      <div className="row">
        <div className="d-flex flex-column ">
       
          <label htmlFor="coursedesc">
            Description:<span className="required">*</span>
          </label>
          <textarea
            type="text"
            id="courseDesc"
            name="courseDesc"
            placeholder="Enter the description of course"
            className="py-1 px-2 rounded "
            value={courseForm.courseDesc}
            onChange={(e) => {
              handleChange(e);
            }}
            required
          ></textarea>
        </div>

        <div className="d-flex flex-column ">
        <InputLabel id="demo-simple-select-helper-label">
        Course Instructor *
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              name="courseInstructorId"
              id="courseInstructorId"
              onChange={(e) => {
                handleChange(e);
              }}
              value={courseForm.courseInstructorId
              }
              required={teachers.length!==0}
            >
            
               {teachers.map((teacher) => {
              return (
                <MenuItem value={teacher.firebaseId} key={teacher.firebaseId}>
                  {teacher.firstname + " " + teacher.lastname}({teacher.type},{teacher.tid})
                </MenuItem>
              );
            })}
             
            </Select>
         
        </div>

        <div className="d-flex flex-column mt-2">
        <TextField
              id="outlined-basic"
              label="Course Duration(with unit)"
              variant="outlined"
              type="text"
            name="courseDuration"
            placeholder="Enter the duration of course"
            value={courseForm.courseDuration}
            onChange={(e) => {
              handleChange(e);
            }}
            required
            focused
            />
        </div>
      </div>

      {/* Related Documents */}
      <div className="mt-1">
        <h3 className="text-center">Related Documents</h3>
        <div className="row">
          <div className="col">
            <label htmlFor="courseoutline">
              Course Outline:
            </label>
            <input
              type="file"
              id="courseOutlineFile"
              name="courseOutlineFile"
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
              name="courseAdditionalDocs"
              onChange={(e) => {
                handleChange(e);
              }}
              multiple
            ></input>
          </div>
            
        </div>
        <div className="row mt-1 text-center"></div>
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
  )
}

export default CourseEdit
