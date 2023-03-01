import React from "react";
import "../Css/AddStudentForm.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { db } from "../Firebase/config";
import { useState } from "react";
import { useEffect,useRef } from "react";
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/system';

const SaveButton=styled(LoadingButton)({
  backgroundColor:"#00233a",
  '&:hover':{
    backgroundColor:"#393c41"
  }
})

const courseFormInit = {
  courseId: "",
  courseName: "",
  courseDesc: "",
  courseThumbnail: "",
  courseDuration: "",
  courseInstructorId: "",
  courseOutlineFile: "",
  courseAdditionalDocs: [],
  lectureVideos:[],
  lectureFiles:[],
  enrolledStudents:[],
  attendence:[],
  noOfStudents:0,
  noOfTotalLectures:0,
  noOfLecturesDelivered:0,
  roughMaterial:[]
};

const AddCourseForm = () => {
  const [courseForm, setCourseForm] = useState(courseFormInit);
  const [teachers, setTeachers] = useState([]);
  const [courseThumbnailPic, setCourseThumbnailPic] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef=useRef(null);

  useEffect(() => {
    return db.collection("teachers").onSnapshot((snapshot) => {
      let data = [];
      snapshot.forEach((doc) => {
        data.push({ ...doc.data(), firebaseId: doc.id });
      });
      setTeachers(data);
    });
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
  };


  //It handles the for submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the courses collection
    const coursesRef = db.collection("courses");
    // Checks Whether a user is not already exists
    try {
      const res = await db.collection("courses").where("courseId", "==", courseForm.courseId).get();
      if (res.docs.length !== 0) {
        alert("Course with same ID already exists");
        setIsSaving(false);
        return ;
      }
    } catch (err) {
      console.log(err);
    }

    // Taking the files
    const { courseThumbnail, courseAdditionalDocs, courseOutlineFile } =
      courseForm;
    const courseFormText = courseForm;
    courseFormText.courseId = courseForm.courseId.toLowerCase();
    courseFormText.courseOutlineFile = "";
    courseFormText.courseThumbnail = "";
    courseFormText.courseAdditionalDocs = "";
    // Create a storage reference
    const storageRef = firebase.storage().ref();

    let courseThumbnailURL = "";
    let courseOutlineFileURL = "";

    let metadata={};
    await coursesRef
      .add(courseFormText)
      .then(async (doc) => {
        //Upload the files
        if (courseThumbnail) {
          metadata= {
            contentType: courseThumbnail.type,
            customMetadata: {
              fileExtension: courseThumbnail.name.split(".").pop(),
            }
          };
          const coursethumbnailSnapshot = await storageRef
            .child(`courses/${courseForm.courseId}/coursethumbnail`)
            .put(courseThumbnail);
          let URL =
            await coursethumbnailSnapshot.ref.getDownloadURL();
            courseThumbnailURL={URL,metadata}
        }
        if (courseOutlineFile) {
          metadata= {
            contentType: courseOutlineFile.type,
            customMetadata: {
              fileExtension: courseOutlineFile.name.split(".").pop(),
            }
          };
          const courseoutlinefileSnapshot = await storageRef
            .child(`courses/${courseForm.courseId}/courseoutline`)
            .put(courseOutlineFile,{metadata});
          courseOutlineFileURL =
            await courseoutlinefileSnapshot.ref.getDownloadURL();
            courseOutlineFileURL={courseOutlineFileURL,metadata};
        }

        let additionalFiles = [];
        if (courseAdditionalDocs) {
          for (var i = 0; i < courseAdditionalDocs.length; i++) {
            metadata={
              contentType: courseAdditionalDocs[i].type,
              customMetadata: {
                fileExtension: courseAdditionalDocs[i].name.split(".").pop(),
              }
            };
            const courseadditionaldocsSnapshot = await storageRef
              .child(
                `courses/${courseForm.courseId}/additionaldocuments${i + 1}`
              )
              .put(courseAdditionalDocs[i],{metadata});
              let additionalFileURL=await courseadditionaldocsSnapshot.ref.getDownloadURL();
            additionalFiles.push({additionalFileURL,metadata});
          }
        }

        // update the document with the file URLs
        await coursesRef.doc(doc.id).update({
          courseThumbnail: courseThumbnailURL,
          courseOutlineFile: courseOutlineFileURL,
          courseAdditionalDocs: additionalFiles,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Fetching the selected teacher and then updating the courses attribute
        if(courseFormText.courseInstructorId!==""){

          db.collection("teachers")
            .doc(courseFormText.courseInstructorId).update({
              courses: firebase.firestore.FieldValue.arrayUnion(doc.id)
            })
        }
          
        setIsSaving(false);
        setIsSuccessfullyAdded(true);
        // Setting student form to init
        setCourseForm(courseFormInit);
        console.log("SuccessFully Added");
        formRef.current.reset();
        setCourseThumbnailPic("");
        setTimeout(() => {
          // Removing the alert from top after 2s
          setIsSuccessfullyAdded(false);
        }, 3000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="add-course-form container mt-2 w-100 ">
      {isSuccessfullyAdded ? (
      <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div>
        <h2 className="text-center">Add Course</h2>
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
            {courseThumbnailPic.length !== 0 ? (
              <img
                src={courseThumbnailPic}
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
              required
            ></input>
          </div>
        </div>
        {/* Course Information */}
        <div className="row">
          <div className="d-flex flex-column col">
            <label htmlFor="c-id">
              Course ID:<span className="required">*</span>
            </label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              pattern="[cC][0-9a-zA-Z]{4}"
              placeholder="c1234"
              className="py-1 px-2 rounded "
              value={courseForm.courseId}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            ></input>
          </div>
        </div>
        <div className="row">
          <div className="d-flex flex-column col">
            <label htmlFor="course-name">
              Course Name:<span className="required">*</span>
            </label>
            <input
              type="text"
              id="course-Name"
              name="courseName"
              placeholder="Digical Logic Design(DLD)"
              className="py-1 px-2 rounded "
              value={courseForm.courseName}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            ></input>
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
            <label htmlFor="courseduration">
              Course Instructor:
            </label>

            <select
              name="courseInstructorId"
              id="courseInstructorId"
              className="py-1 px-2 rounded "
              onChange={(e) => {
                handleChange(e);
              }}
              required={teachers.length!==0}
            >
              <option value="" defaultChecked>
                Select Course Instructor
              </option>
              {teachers.map((teacher) => {
                return (
                  <option value={teacher.firebaseId} key={teacher.firebaseId}>
                    {teacher.firstname + " " + teacher.lastname}({teacher.tid})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="d-flex flex-column ">
            <label htmlFor="courseduration">
              Course Duration(Months):<span className="required">*</span>
            </label>
            <input
              type="text"
              id="courseDuration"
              name="courseDuration"
              placeholder="Enter the duration of course"
              className="py-1 px-2 rounded "
              value={courseForm.courseDuration}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            ></input>
          </div>

          <div className="d-flex flex-column ">
            <label htmlFor="courseTotalLectures">
              Course Total Lectures:<span className="required">*</span>
            </label>
            <input
              type="text"
              id="courseTotalLectures"
              name="courseTotalLectures"
              placeholder="Enter the total number of lectures"
              className="py-1 px-2 rounded "
              min="0"
              onChange={(e) => {
                handleChange(e);
              }}
              required
            ></input>
          </div>
        </div>

        {/* Related Documents */}
        <div className="mt-1">
          <h3 className="text-center">Related Documents</h3>
          <div className="row">
            <div className="col">
              <label htmlFor="courseoutline">
                Course Outline:<span className="required">*</span>
              </label>
              <input
                type="file"
                id="courseOutlineFile"
                name="courseOutlineFile"
               
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
  );
};

export default AddCourseForm;
