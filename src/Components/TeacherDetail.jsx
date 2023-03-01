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
import DegreeFileICON from "../Assets/Logos/DegreeFileICON.png";
import CvICON from "../Assets/Logos/CvICON.png";
import EditICON from "../Assets/Logos/EditICON.png";
import TextField from "@mui/material/TextField";


const isObjectEmpty = (objectName) => {
  return JSON.stringify(objectName) === "{}";
};

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

const TeacherDetail = () => {
  const { state } = useLocation();
  const [teacher, setTeacher] = useState({});
  const [coursesInstructor, setCoursesInstructor] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    return db
      .collection("teachers")
      .doc(state.firebaseId)
      .onSnapshot(async (snapshot) => {
        setTeacher({ ...snapshot.data(), firebaseId: snapshot.id });
        let coursesData = [];
        if (snapshot.data().courses.length !== 0) {
          for (const courseFirebaseId of snapshot.data().courses) {
            const courseDetail = await getCourse(courseFirebaseId);
            coursesData.push(courseDetail);
          }
          setCoursesInstructor(coursesData);
        }
      });
  }, []);

  const handleNavigation = () => {
    navigate("edit", { state: { firebaseId: teacher.firebaseId } });
  };
  return (
    <div className="d-flex flex-column align-items-center">
      <div className="title bg-dark  text-center text-white w-100">
        <h3 className="text-white">Teacher Detail</h3>
      </div>

      {/* Edit Button */}
      {/*!Importane It's CSS is in the studentpage.css , due to global scope it is accessible here */}
      
      <div
        className="w-100 d-flex mt-2 justify-content-end pe-2"
      >
        <button type="submit" id="edit-button" className='border rounded'  onClick={() => {
          handleNavigation();
        }}>Edit</button>
      </div>

      <div className="studentphoto w-100 d-flex justify-content-center mt-2 mb-1">
        <img
          src={!isObjectEmpty(teacher) ? teacher.teacherphoto.URL : ""}
          alt="#"
          width={150}
          className="rounded"
        />
      </div>

      {!isObjectEmpty(teacher) ? (
        <div className="teacher-details w-100 ms-3 d-flex justify-content-center mx-auto">
          <div className="w-100">
            <div className="row">
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="ID"
                  variant="standard"
                  value={teacher.tid}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Teacher Name"
                  variant="standard"
                  value={teacher.firstname + " " + teacher.lastname}
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
                  label="Date Of Birth(MM/DD/YYYY)"
                  type="date"
                  variant="standard"
                  value={teacher.dob}
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
                  value={
                    teacher.gender[0].toUpperCase() + teacher.gender.slice(1)
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-multiline-static"
                  label="Address"
                  multiline
                  rows={4}
                  value={teacher.address}
                  variant="standard"
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
                  value={teacher.phone}
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
                  value={
                    teacher.email && teacher.email.length !== 0
                      ? teacher.email
                      : "-"
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="CNIC"
                  variant="standard"
                  value={teacher.cnic}
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
                  label="Designation"
                  variant="standard"
                  value={teacher.designation}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Salary(PKR)"
                  variant="standard"
                  value={teacher.initsalary}
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
                  label="Degree"
                  variant="standard"
                  value={teacher.degree}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-multiline-static"
                  label="Institute Name"
                  multiline
                  rows={4}
                  value={teacher.institutename}
                  variant="standard"
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
                  label="Passing Year(MM/DD/YYYY)"
                  variant="standard"
                  type="date"
                  value={teacher.passingyear}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="CGPA"
                  variant="standard"
                  value={teacher.obtgpa}
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
                  label="Emergency Contact Name"
                  variant="standard"
                  value={teacher.emergencyname}
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
                  value={teacher.emergencyphone}
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
                  value={teacher.emergencyrelationship}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Instructor of Courses"
                  variant="standard"
                  value={teacher.courses ? teacher.courses.length : ""}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {coursesInstructor.length !== 0 ? (
        <div className="title bg-dark  text-center text-white w-100">
          <h5 className="text-white">Instructor Of Following Courses</h5>
        </div>
      ) : (
        ""
      )}

      {/* Courses In Which Teacher is Instructor */}
      <div className="mt-3 mb-2 d-flex justify-content-center flex-wrap">
        {/* Displaying the courses */}
        {coursesInstructor.length !== 0
          ? coursesInstructor.map((course) => {
              return (
                <Card sx={{ maxWidth: 200 }} className="pb-2 ">
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
      {!isObjectEmpty(teacher) ? (
        <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">
          {/* Profile Photo */}
          {teacher.teacherphoto.length !== 0 ? (
            <button
              className="panel border profilephoto d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacher.teacherphoto,
                  `${
                    teacher.firstname.toUpperCase() +
                    " " +
                    teacher.lastname.toUpperCase() +
                    "(" +
                    teacher.tid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={ProfilePhotoICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">Profile Photo</h4>
            </button>
          ) : (
            ""
          )}

          {/* Teacher CNIC */}
          {teacher.teachercnicphoto.length !== 0 ? (
            <button
              className="panel border cnic d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacher.teachercnicphoto,
                  `${
                    teacher.firstname.toUpperCase() +
                    " " +
                    teacher.lastname.toUpperCase() +
                    "CNIC" +
                    "(" +
                    teacher.tid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CnicICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">CNIC</h4>
            </button>
          ) : (
            ""
          )}

          {/* CV*/}
          {teacher.cv.length !== 0 ? (
            <button
              className="panel border cv d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacher.cv,
                  `${
                    teacher.firstname.toUpperCase() +
                    " " +
                    teacher.lastname.toUpperCase() +
                    "CV" +
                    "(" +
                    teacher.tid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CvICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">CV</h4>
            </button>
          ) : (
            ""
          )}

          {/* Degree  */}
          {teacher.degreefile.length !== 0 ? (
            <button
              className="panel border cnic d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacher.degreefile,
                  `${
                    teacher.firstname.toUpperCase() +
                    " " +
                    teacher.lastname.toUpperCase() +
                    "Degree File" +
                    "(" +
                    teacher.tid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={DegreeFileICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text"> Degree File</h4>
            </button>
          ) : (
            ""
          )}

          {/* Medical Records  */}
          {teacher.medicalrecordsphoto.length !== 0 ? (
            <button
              className="panel border medicalrecords d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  teacher.medicalrecordsphoto,
                  `${
                    teacher.firstname.toUpperCase() +
                    " " +
                    teacher.lastname.toUpperCase() +
                    "MedicalRecord" +
                    "(" +
                    teacher.tid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={MedicalRecordICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text"> Medical Records</h4>
            </button>
          ) : (
            ""
          )}

          {/* Additional Records */}
          {teacher.additionaldocuments.length !== 0 ? (
            <button
              className="panel border additionalfiles d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                teacher.additionaldocuments.forEach((eachFile, index) => {
                  handleDownload(
                    eachFile,
                    `${
                      teacher.firstname.toUpperCase() +
                      " " +
                      teacher.lastname.toUpperCase() +
                      "AdditionalFile " +
                      index +
                      1 +
                      "(" +
                      teacher.tid +
                      ")"
                    }`
                  );
                });
              }}
            >
              <div className="icon">
                <img src={AdditionalFilesICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">Additional Files</h4>
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

export default TeacherDetail;
