import React, { useState } from "react";
import { useEffect } from "react";
import {  useLocation, useNavigate } from "react-router-dom";
import { db } from "../Firebase/config";


import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import ProfilePhotoICON from "../Assets/Logos/ProfilePhotoICON.png";
import CnicICON from "../Assets/Logos/CnicICON.png";
import MedicalRecordICON from "../Assets/Logos/MedicalRecordICON.png";
import AdditionalFilesICON from "../Assets/Logos/AdditionalFilesICON.png";
import { useContext } from "react";
import TextField from "@mui/material/TextField";
import { staffUser } from "../Pages/StaffDashboard";


const isObjectEmpty = (objectName) => {
  return JSON.stringify(objectName) === "{}";
};

const StudentDetail = ({isStaff}) => {
  const { state } = useLocation();
  const [student, setStudent] = useState({});
  const user=useContext(staffUser);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    return db
      .collection("students")
      .doc(state.firebaseId)
      .onSnapshot(async (snapshot) => {
        setStudent({ ...snapshot.data(), firebaseId: snapshot.id });
        let coursesData = [];
        if (snapshot.data().courses.length !== 0) {
          // console.log(snapshot.data().courses.length);
          for (const courseFirebaseId of snapshot.data().courses) {
            const courseDetail = await getCourse(courseFirebaseId);
            coursesData.push(courseDetail);
          }
          setEnrolledCourses(coursesData);
        }
      });
  }, []);

  const getCourse = async (courseFirebaseId) => {
    const snapshot = await db.collection("courses").doc(courseFirebaseId).get();
    return { ...snapshot.data(), firebaseId: snapshot.id };
  };
  // It downloads the files
  const handleDownload = (file, fileTitle = "") => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", file.URL, true);
    xhr.responseType = "blob";
    xhr.onload = function (event) {
      const blob = xhr.response;
      // Set the content-disposition header to specify the original file type and extension
      const contentDispositionHeader = `attachment; filename=${fileTitle}.${file.metadata.customMetadata.fileExtension};`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileTitle}.${file.metadata.customMetadata.fileExtension}`;
      link.setAttribute("style", "display: none;");
      link.setAttribute(
        "download",
        `${fileTitle}.${file.metadata.customMetadata.fileExtension}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    xhr.send();
  };

  const handleNavigation = () => {
    navigate("edit", { state: { firebaseId: student.firebaseId } });
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="title bg-dark  text-center text-white w-100">
        <h3 className="text-white">Student Detail</h3>
      </div>

      {/* Edit Button */}
      {((isStaff)?(user && user.studentauthority && user.studentauthority.edit )?true:false:true)?<div className="w-100 d-flex mt-2 justify-content-end pe-2">
        <button
          type="submit"
          id="edit-button"
          className="border rounded"
          onClick={() => {
            handleNavigation();
          }}
        >
          Edit
        </button>
      </div>:""}
      <div className="studentphoto w-100 d-flex justify-content-center mt-2 mb-1">
        <img
          src={!isObjectEmpty(student) ? student.studentphoto.URL : ""}
          alt="studentPicture "
          width={150}
          className="rounded"
        />
      </div>
      {!isObjectEmpty(student) ? (
        <div className="student-details  w-100 ms-1 d-md-flex justify-content-center">
          <div className="w-100">
          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="ID"
                variant="standard"
                value= {student.sid}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Student Name"
                variant="standard"
                value= {student.firstname + " " + student.lastname}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </div>



          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Date Of Birth"
                type="date"
                variant="standard"
                value= {student.dob}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Gender"
                variant="standard"
                value={ student.gender[0].toUpperCase() +
                student.gender.slice(1)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </div>


          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Address"
                multiline
                rows={4}
                variant="standard"
                value= {student.address}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Phone Number"
                variant="standard"
                value={student.phone}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </div>


          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Email"
               
                variant="standard"
                value= {student.email}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="CNIC/ B-Form"
                variant="standard"
                value={student.cnic}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </div>


          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Parent/Guardian Name"
               
                variant="standard"
                value=  {student.parentname}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Parent Phone Number"
                variant="standard"
                value={student.parentphone}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </div>


          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Parent/Guardian Email"
               
                variant="standard"
                value= {student.parentemail}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Parent CNIC"
                variant="standard"
                value={student.parentcnic}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

          </div>


          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Enrolled In"
               
                variant="standard"
                value= {student.courses
                  ? student.courses.length
                  : ""}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Total Fees"
                variant="standard"
                value= {student.totalfees}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

          </div>

          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Emergency Contact. Name"
               
                variant="standard"
                value= {student.emergencyname}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Emergency Contact No."
                variant="standard"
                value= {student.emergencyphone}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

          </div>



          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Relationship"
               
                variant="standard"
                value={student.emergencyrelationship}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            {(student.previousschoolname!=="")?<div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Previous Inst. Name"
                variant="standard"
                multiline
                rows={4}
                value= {student.previousschoolname}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>:""}

          </div>

          <div className="row">
            {(student.previousschooladdress!=="")?<div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Previous Inst. Address"
                multiline
                rows={4}
                variant="standard"
                value={student.previousschooladdress}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>:""}
          </div>
</div>
        </div>
      ) : (
        ""
      )}

      {enrolledCourses.length !== 0 ? (
        <div className="title bg-dark  text-center text-white w-100">
          <h5 className="text-white">Courses</h5>
        </div>
      ) : (
        ""
      )}

      {/* Courses In Which Student is Enrolled */}
      <div className="mt-3 mb-2 d-flex justify-content-center flex-wrap">
        {/* Displaying the courses */}
        {enrolledCourses.length !== 0
          ? enrolledCourses.map((course) => {
              return (
                <Card sx={{ maxWidth: 200 }} className="pb-2 ms-2">
                  <CardMedia
                    sx={{ height: 100 }}
                    image={
                      course.courseThumbnail ? course.courseThumbnail.URL : ""
                    }
                    title="green iguana"
                  />
                  <CardContent sx={{ height: 120 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {course.courseName}({course.courseId})
                    </Typography>
                  </CardContent>
                </Card>
              );
            })
          : ""}
      </div>

      <div className="title bg-dark  text-center text-white w-100">
        <h5 className="text-white">Files</h5>
      </div>
      {/* File Download Buttons */}
      {!isObjectEmpty(student) ? (
        <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">
          {/* Profile Photo */}
          {student.studentphoto.length !== 0 ? (
            <button
              className="panel border profilephoto d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  student.studentphoto,
                  `${
                    student.firstname.toUpperCase() +
                    " " +
                    student.lastname.toUpperCase() +
                    "(" +
                    student.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={ProfilePhotoICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text">Profile Photo</h3>
            </button>
          ) : (
            ""
          )}

          {/* Student CNIC */}
          {student.studentcnicphoto.length !== 0 ? (
            <button
              className="panel border cnic d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  student.studentcnicphoto,
                  `${
                    student.firstname.toUpperCase() +
                    " " +
                    student.lastname.toUpperCase() +
                    "CNIC" +
                    "(" +
                    student.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CnicICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text">CNIC/BForm</h3>
            </button>
          ) : (
            ""
          )}

          {/* Parent/Guardian CNIC */}
          {student.parentcnicphoto.length !== 0 ? (
            <button
              className="panel border parentcnic d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  student.parentcnicphoto,
                  `${
                    student.firstname.toUpperCase() +
                    " " +
                    student.lastname.toUpperCase() +
                    "Guardian CNIC" +
                    "(" +
                    student.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CnicICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text">Parent CNIC</h3>
            </button>
          ) : (
            ""
          )}
          {/* Medical Records */}
          {student.medicalrecordsphoto.length !== 0 ? (
            <button
              className="panel border medicalrecords d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  student.medicalrecordsphoto,
                  `${
                    student.firstname.toUpperCase() +
                    " " +
                    student.lastname.toUpperCase() +
                    "MedicalRecord" +
                    "(" +
                    student.sid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={MedicalRecordICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text"> Medical Records</h3>
            </button>
          ) : (
            ""
          )}

          {/* Additional Records */}
          {student.additionaldocuments.length !== 0 ? (
            <button
              className="panel border additionalfiles d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                student.additionaldocuments.forEach((eachFile, index) => {
                  handleDownload(
                    eachFile,
                    `${
                      student.firstname.toUpperCase() +
                      " " +
                      student.lastname.toUpperCase() +
                      "AdditionalFile " +
                      index +
                      1 +
                      "(" +
                      student.sid +
                      ")"
                    }`
                  );
                });
              }}
            >
              <div className="icon">
                <img src={AdditionalFilesICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text">Additional Files</h3>
            </button>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default StudentDetail;
