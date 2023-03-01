import React from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
import "../Css/AddStudentForm.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { db } from "../Firebase/config";
import { useState, useEffect, useRef } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/system";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { useLocation, useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

// Student Form Attributes
const studentFormInit = {
  sid: "",
  firstname: "",
  lastname: "",
  cnic: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  parentname: "",
  parentphone: "",
  parentemail: "",
  parentcnic: "",
  totalfees: "",
  noofintallments: 1,
  courses: [],
  emergencyname: "",
  emergencyrelationship: "",
  emergencyphone: "",
  previousschoolname: "",
  previousschooladdress: "",
  studentphoto: "",
  studentcnicphoto: "",
  parentcnicphoto: "",
  medicalrecordsphoto: "",
  additionaldocuments: [],
  type: "student",
  enrolleddate: "",
};

const StudentEdit = () => {
  const [studentForm, setStudentForm] = useState(studentFormInit);
  const [studentPhotoURL, setStudentPhotoURL] = useState(""); //Student Photo URL
  const [isSaving, setIsSaving] = useState(false); //Is Form saving
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);
  const [enrolledCourses, setEnrolledCourse] = useState();
  const [studentData, setStudentData] = useState({});
  const { state } = useLocation();
  const [isDeleting,setIsDeleting]=useState(false);
  useEffect(() => {
    const fetchStudentData = () => {
      db.collection("students")
        .doc(state.firebaseId)
        .onSnapshot((snapshot) => {
          setStudentData({ ...snapshot.data(), firebaseId: snapshot.id });
          setStudentForm({ ...snapshot.data(), firebaseId: snapshot.id });
          setStudentPhotoURL(snapshot.data().studentphoto.URL);
        });
    };
    const fetchCourses = () => {
      db.collection("courses").onSnapshot((snapshot) => {
        let data = [];

        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setEnrolledCourse(data);
      });
    };
    fetchStudentData();
    fetchCourses();
  }, []);

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
    if (e.target.name === "studentphoto") {
      setStudentForm({ ...studentForm, [e.target.name]: e.target.files[0] });
      setStudentPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else if (
      e.target.name === "studentcnicphoto" ||
      e.target.name === "parentcnicphoto" ||
      e.target.name === "medicalrecordsphoto"
    ) {
      setStudentForm({ ...studentForm, [e.target.name]: e.target.files[0] });
    } else if (e.target.name === "additionaldocuments") {
      setStudentForm({ ...studentForm, [e.target.name]: e.target.files });
    } else if (e.target.name === "courses") {
      const newForm = studentForm;
      newForm.courses = [e.target.value];
      setStudentForm(newForm);
    } else if (e.target.name === "dob") {
      if (validateDob(e.target.value)) {
        setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
      } else {
        alert("Date of birth is not correct!");
        return;
      }
    } else {
      setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
    }
    // console.log(studentForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const studentsRef = db.collection("students");
    const feesRef = db.collection("fees");
    // Taking the files from from
    const {
      studentphoto,
      studentcnicphoto,
      parentcnicphoto,
      medicalrecordsphoto,
      additionaldocuments,
    } = studentForm;

    if (studentData.noofintallments !== studentForm.noofintallments) {
      feesRef
        .where("sid", "==", studentData.sid)
        .get()
        .then((res) => {
          const updateFeePerInstallment = Math.round(
            res.docs[0].data().totalfees / studentForm.noofintallments
          );
          feesRef.doc(res.docs[0].id).update({
            noofintallments: studentForm.noofintallments,
            feeperinstallment: updateFeePerInstallment,
          });
        });
    }

    //Updating the text record of student record except courses array
    db.collection("students").doc(studentData.firebaseId).update({
      sid: studentForm.sid,
      firstname: studentForm.firstname,
      lastname: studentForm.lastname,
      dob: studentForm.dob,
      gender: studentForm.gender,
      address: studentForm.address,
      phone: studentForm.phone,
      email: studentForm.email,
      cnic: studentForm.cnic,
      parentname: studentForm.parentname,
      parentphone: studentForm.parentphone,
      parentemail: studentForm.parentemail,
      parentcnic: studentForm.parentcnic,
      totalfees: studentForm.totalfees,
      noofintallments: studentForm.noofintallments,
      emergencyname: studentForm.emergencyname,
      emergencyrelationship: studentForm.emergencyrelationship,
      emergencyphone: studentForm.emergencyphone,
      previousschoolname: studentForm.previousschoolname,
      previousschooladdress: studentForm.previousschooladdress,
    });

    const storageRef = firebase.storage().ref();

    //If profile picture is changed
    if (
      JSON.stringify(studentForm.studentphoto) !==
      JSON.stringify(studentData.studentphoto)
    ) {
      // console.log(studentphoto);
      const metadata = {
        contentType: studentphoto.type,
        customMetadata: {
          fileExtension: studentphoto.name.split(".").pop(),
        },
      };
      await firebase
        .storage()
        .refFromURL(studentData.studentphoto.URL)
        .delete()
        .then(async () => {
          const studentphotoSnapshot = await storageRef
            .child(`students/${studentForm.sid}/studentphoto`)
            .put(studentphoto);
          let URL = await studentphotoSnapshot.ref.getDownloadURL();
          let studentphotoURL = { URL, metadata };
          await studentsRef.doc(studentData.firebaseId).update({
            studentphoto: studentphotoURL,
          });
        });
    }
    //If CNIC/BFORM FILE is changed
    if (
      JSON.stringify(studentForm.studentcnicphoto) !==
      JSON.stringify(studentData.studentcnicphoto)
    ) {
      const metadata = {
        contentType: studentcnicphoto.type,
        customMetadata: {
          fileExtension: studentcnicphoto.name.split(".").pop(),
        },
      };
      await firebase
        .storage()
        .refFromURL(studentData.studentcnicphoto.URL)
        .delete()
        .then(async () => {
          const studentcnicphotoSnapshot = await storageRef
            .child(`students/${studentForm.sid}/studentcnic`)
            .put(studentcnicphoto);
          let URL = await studentcnicphotoSnapshot.ref.getDownloadURL();
          let studentcnicphotoURL = { URL, metadata };
          await studentsRef.doc(studentData.firebaseId).update({
            studentcnicphoto: studentcnicphotoURL,
          });
        });
    }

    //If Parent cnic file is changed
    if (
      JSON.stringify(studentForm.parentcnicphoto) !==
      JSON.stringify(studentData.parentcnicphoto)
    ) {
      const metadata = {
        contentType: parentcnicphoto.type,
        customMetadata: {
          fileExtension: parentcnicphoto.name.split(".").pop(),
        },
      };
      await firebase
        .storage()
        .refFromURL(studentData.parentcnicphoto.URL)
        .delete()
        .then(async () => {
          const parentcnicphotoSnapshot = await storageRef
            .child(`students/${studentForm.sid}/parentcnic`)
            .put(parentcnicphoto);
          let URL = await parentcnicphotoSnapshot.ref.getDownloadURL();
          let parentcnicphotoURL = { URL, metadata };
          await studentsRef.doc(studentData.firebaseId).update({
            parentcnicphoto: parentcnicphotoURL,
          });
        });
    }

    //If Medical Record file is changed
    if (
      JSON.stringify(studentForm.medicalrecordsphoto) !==
      JSON.stringify(studentData.medicalrecordsphoto)
    ) {
      const metadata = {
        contentType: medicalrecordsphoto.type,
        customMetadata: {
          fileExtension: medicalrecordsphoto.name.split(".").pop(),
        },
      };
      if (studentData.medicalrecordsphoto.length !== 0) {
        await firebase
          .storage()
          .refFromURL(studentData.medicalrecordsphoto.URL)
          .delete()
          .then(async () => {
            const medicalrecordphotoSnapshot = await storageRef
              .child(`students/${studentForm.sid}/medicalrecord`)
              .put(medicalrecordsphoto);
            let URL = await medicalrecordphotoSnapshot.ref.getDownloadURL();
            let medicalrecordphotoURL = { URL, metadata };
            await studentsRef.doc(studentData.firebaseId).update({
              medicalrecordsphoto: medicalrecordphotoURL,
            });
          });
      } else {
        const medicalrecordphotoSnapshot = await storageRef
          .child(`students/${studentForm.sid}/medicalrecord`)
          .put(medicalrecordsphoto);
        let URL = await medicalrecordphotoSnapshot.ref.getDownloadURL();
        let medicalrecordphotoURL = { URL, metadata };
        await studentsRef.doc(studentData.firebaseId).update({
          medicalrecordsphoto: medicalrecordphotoURL,
        });
      }
    }

    //If Additional files is changed
    if (
      JSON.stringify(studentForm.additionaldocuments) !==
      JSON.stringify(studentData.additionaldocuments)
    ) {
      let metadata = {};
      //Deleting the previous additional Files
      if (additionaldocuments && additionaldocuments.length !== 0) {
        studentData.additionaldocuments.map(async (additionaldocument) => {
          await firebase.storage().refFromURL(additionaldocument.URL).delete();
          db.collection("students")
            .doc(studentForm.firebaseId)
            .update({
              additionaldocuments:
                firebase.firestore.FieldValue.arrayRemove(additionaldocument),
            });
        });
      }
      let additionalFilesURL = [];
      for (var i = 0; i < studentForm.additionaldocuments.length; i++) {
        metadata = {
          contentType: additionaldocuments[i].type,
          customMetadata: {
            fileExtension: additionaldocuments[i].name.split(".").pop(),
          },
        };
        const additionaldocumentSnapshot = await storageRef
          .child(
            `students/${studentForm.sid}/additionaldocuments${Number(i) + 1}`
          )
          .put(additionaldocuments[i], { metadata });
        let URL = await additionaldocumentSnapshot.ref.getDownloadURL();
        additionalFilesURL.push({ URL, metadata });
        await studentsRef.doc(studentData.firebaseId).update({
          additionaldocuments: firebase.firestore.FieldValue.arrayUnion({
            URL,
            metadata,
          }),
        });
      }
    }

    setIsSaving(false);
    setIsSuccessfullyAdded(true);
    setTimeout(() => {
      setIsSuccessfullyAdded(false);
    }, 2000);
  };

  const handleCourseRemove = (courseFirebaseId, courseName) => {
    setIsDeleting(true);
    let updatedForm = studentForm;
    let atIndex = updatedForm.courses.indexOf(courseFirebaseId);
    updatedForm.courses.splice(atIndex, 1);
    setStudentForm(updatedForm);

    // Replace `state.firebaseId` and `courseName` with your actual values
    const studentDocRef = db.collection("students").doc(state.firebaseId);

    // Step 1: Fetch the `coursefees` array from the `student` document
    studentDocRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const studentData = doc.data();
          const courseFees = studentData.coursesfee;

          // Step 2: Find the fee with matching `coursename`
          const feeQuery = db
            .collection("fees")
            .where("coursename", "==", courseName)
            .where("sid", "==", studentData.sid)
            .limit(1);

          feeQuery
            .get()
            .then((querySnapshot) => {
              if (querySnapshot.docs.length === 0) {
                // No fee found with matching `coursename`
                return;
              }

              const feeDoc = querySnapshot.docs[0];
              const feeIdToRemove = feeDoc.id;

              // Step 3: Remove the fee ID from the `coursefees` array
              const updatedCourseFees = courseFees.filter((feeId) => {
                return feeId !== feeIdToRemove;
              });

              
              // Step 4: Update the `student` document with the new `coursefees` array
              studentDocRef
                .update({
                  courses:
                    firebase.firestore.FieldValue.arrayRemove(courseFirebaseId),
                  batch:firebase.firestore.FieldValue.arrayRemove(courseName),
                  coursesfee: updatedCourseFees,
                })
                .then(() => {
                  // Step 5: Delete the fee document from the `fees` collection
                  db.collection("fees")
                    .doc(feeIdToRemove)
                    .delete()
                    .then(() => {
                      // console.log("Fee document deleted successfully!");
                    })
                    .catch((error) => {
                      console.error("Error deleting fee document:", error);
                    });
                })
                .catch((error) => {
                  console.error("Error updating student document:", error);
                });

                db.collection("courses")
                .doc(courseFirebaseId)
                .update({
                  noOfStudents: firebase.firestore.FieldValue.increment(-1),
                  enrolledStudents: firebase.firestore.FieldValue.arrayRemove(
                    state.firebaseId
                  ),
                  studentfees:
                    firebase.firestore.FieldValue.arrayRemove(feeIdToRemove),
                });
            })
            .catch((error) => {
              console.error("Error fetching fee document:", error);
            });
        } else {
          console.error("Student document not found!");
        }
      })
      .catch((error) => {
        console.error("Error fetching student document:", error);
      });
      setIsDeleting(false);
  };
  return (
    <div className="add-student-form container mt-2 w-100 ">
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div>
        <h2 className="text-center">Student Edit Form</h2>
      </div>
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        ref={formRef}
      >
        {/* Student Photo */}
        <div className=" d-flex justify-content-center me-auto">
          <div>
            <img
              src={studentPhotoURL === "" ? emptyProfile : studentPhotoURL}
              alt="studentPicture "
              width={130}
              className="rounded"
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="input-group mb-3">
            <input
              type="file"
              className="form-control"
              id="studentphoto"
              name="studentphoto"
              onChange={(e) => {
                handleChange(e);
              }}
            ></input>
          </div>
        </div>
        {/* Main Student Information */}
        <div className="row">
          <div className="d-flex flex-column col">
            <TextField
              id="outlined-basic"
              label="Student ID"
              variant="outlined"
              name="sid"
              pattern="[sS][a-zA-Z0-9]{4}"
              title="The input should start with 's' or 'S' followed by 4 characters that can be either letters or numbers."
              placeholder="s1123"
              value={studentForm.sid}
              onChange={(e) => {
                handleChange(e);
              }}
              disabled
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
              placeholder="Mukesh"
              className="rounded "
              value={studentForm.firstname}
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
              placeholder="khan"
              className="rounded "
              value={studentForm.lastname}
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
              value={studentForm.dob.toString().substr(0, 10)}
              name="dob"
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
          <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Gender</InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              name="gender"
              className="py-1 px-2 rounded "
              value={studentForm.gender}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
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
            placeholder="street#2 washington, America "
            className="py-1 px-2 rounded "
            value={studentForm.address}
            onChange={(e) => {
              handleChange(e);
            }}
            required
          ></textarea>
        </div>
        <div className="row mt-3 d-flex">
          <div className="d-flex flex-column col">
            <TextField
              id="outlined-basic"
              label="Phone Number"
              variant="outlined"
              type="tel"
              name="phone"
              placeholder="03xxxxxxxxx"
              value={studentForm.phone}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
          <div className="d-flex flex-column col">
            <TextField
              id="outlined-basic"
              label="Email"
              variant="outlined"
              type="email"
              name="email"
              value={studentForm.email}
              onChange={(e) => {
                handleChange(e);
              }}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="d-flex flex-column col">
            <TextField
              id="outlined-basic"
              label="CNIC/B-Form"
              variant="outlined"
              type="text"
              name="cnic"
              placeholder="xxxxx-xxxxxxx-x"
              pattern="[0-9]{5}-[0-9]{7}-[0-9]"
              value={studentForm.cnic}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
        </div>
        {/* Parent/gaurdian information */}
        <div className="mt-2">
          <h3 className="text-center">Parent/Guardian Contact Form</h3>
          <div className="row">
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                type="text"
                name="parentname"
                placeholder="Ali"
                value={studentForm.parentname}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Phone Number"
                variant="outlined"
                type="tel"
                name="parentphone"
                placeholder="03xxxxxxxxx"
                value={studentForm.parentphone}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Email"
                variant="outlined"
                type="email"
                name="parentemail"
                value={studentForm.parentemail}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Parent CNIC"
                variant="outlined"
                type="text"
                name="parentcnic"
                placeholder="xxxxx-xxxxxxx-x"
                pattern="[0-9]{5}-[0-9]{7}-[0-9]"
                value={studentForm.parentcnic}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
        </div>
        {/* Enrollment Form */}
        <div className="mt-2">
          <h3 className="text-center">Enrollment Form</h3>
          <div className="row">
            {typeof enrolledCourses !== "undefined" && enrolledCourses
              ? enrolledCourses.map((course) => {
                  return (
                    <>
                      {studentForm.courses.includes(course.firebaseId) ? (
                        <div className="col">
                          <Card sx={{ maxWidth: 200 }}>
                            <CardMedia
                              sx={{ height: 100 }}
                              image={course.courseThumbnail.URL}
                              title="green iguana"
                            />
                            <CardContent sx={{ height: 110 }}>
                              <Typography
                                gutterBottom
                                variant="h6"
                                component="div"
                              >
                                {course.courseName}({course.courseId})
                              </Typography>
                            </CardContent>
                            <CardActions className="w-100 d-flex justify-content-center">
                              <Button
                                size="small"
                                className="btn btn-danger text-white bg-danger"
                                onClick={() => {
                                  handleCourseRemove(
                                    course.firebaseId,
                                    course.courseName
                                  );
                                }}
                              >
                                {(isDeleting)?"Please Wait...":"Remove"}
                              </Button>
                            </CardActions>
                          </Card>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  );
                })
              : ""}
          </div>
          <div className="row mt-3">
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Total Fees"
                variant="outlined"
                type="number"
                name="totalfees"
                placeholder="2900"
                inputProps={{ min: 0 }}
                value={studentForm.totalfees}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="No of Installments"
                variant="outlined"
                type="number"
                name="noofintallments"
                placeholder="1"
                inputProps={{ min: 1 }}
                value={studentForm.noofintallments}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
        </div>
        {/* Emergency Contact Section */}
        <div className="mt-2">
          <h3 className="text-center">Emergency Contact Form</h3>
          <div className="row">
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                type="text"
                name="emergencyname"
                placeholder="Andaleep"
                value={studentForm.emergencyname}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Relationship"
                variant="outlined"
                type="text"
                name="emergencyrelationship"
                placeholder="brother"
                value={studentForm.emergencyrelationship}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="d-flex flex-column col">
            <TextField
              id="outlined-basic"
              label="Phone Number"
              variant="outlined"
              type="tel"
              name="emergencyphone"
              placeholder="03xxxxxxxxx"
              value={studentForm.emergencyphone}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
        </div>

        {/* Previous School Form */}
        <div className="mt-2">
          <h3 className="text-center">Previous School Form</h3>
          <div className="row">
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                type="text"
                name="previousschoolname"
                placeholder="Christian Military School, Bhopal"
                value={studentForm.previousschoolname}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Address"
                variant="outlined"
                type="text"
                name="previousschooladdress"
                placeholder="Street#2 Bhopal,India"
                value={studentForm.previousschooladdress}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </div>
          </div>
        </div>
        {/* Related Documents */}
        <div className="mt-1">
          <h3 className="text-center">Related Documents</h3>
          <div className="row">
            <div className="col">
              <label htmlFor="studentcnic">CNIC/B-Form:</label>
              <input
                type="file"
                id="studentcnic"
                name="studentcnicphoto"
                onChange={(e) => {
                  handleChange(e);
                }}
              ></input>
            </div>
            <div className="col">
              <label htmlFor="parentcnic">Parent CNIC:</label>
              <input
                type="file"
                id="parentcnic"
                name="parentcnicphoto"
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
          </div>
          <div className="row mt-1 text-center">
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

export default StudentEdit;
