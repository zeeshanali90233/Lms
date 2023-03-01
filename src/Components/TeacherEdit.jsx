import React from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
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

// Teacher Form Init
const teacherFormInit = {
  tid: "",
  firstname: "",
  lastname: "",
  cnic: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  doj: "",
  initsalary: "",
  designation: "",
  courses: [],
  emergencyname: "",
  emergencyrelationship: "",
  emergencyphone: "",
  teacherphoto: "",
  teachercnicphoto: "",
  degreefile: "",
  medicalrecordsphoto: "",
  cv: "",
  additionaldocuments: [],
  type: "teacher",
  assignedrole: [],
};

const TeacherEdit = () => {
  const [teacherForm, setTeacherForm] = useState(teacherFormInit);
  const [teacherPhotoURL, setTeacherPhotoURL] = useState("");
  const [courses, setCourses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const [teacherData, setTeacherData] = useState(teacherFormInit);
  const [coursesInstructor, setCoursesInstructor] = useState([]);
  const formRef = useRef(null);
  const { state } = useLocation();

  useEffect(() => {
    const fetchTeacherData = () => {
      db.collection("teachers")
        .doc(state.firebaseId)
        .onSnapshot((snapshot) => {
          setTeacherData({ ...snapshot.data(), firebaseId: snapshot.id });
          setTeacherForm({ ...snapshot.data(), firebaseId: snapshot.id });
          setTeacherPhotoURL(snapshot.data().studentphoto.URL);
        });
    };
    const fetchCourses = () => {
      db.collection("courses").onSnapshot((snapshot) => {
        let data = [];

        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setCoursesInstructor(data);
      });
    };
    fetchTeacherData();
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

  // It handles the changes
  const handleChange = (e) => {
    if (e.target.name === "teacherphoto") {
      setTeacherForm({ ...teacherForm, [e.target.name]: e.target.files[0] });
      setTeacherPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else if (
      e.target.name === "teachercnicphoto" ||
      e.target.name === "medicalrecordsphoto" ||
      e.target.name === "cv" ||
      e.target.name === "degreefile"
    ) {
      setTeacherForm({ ...teacherForm, [e.target.name]: e.target.files[0] });
    } else if (e.target.name === "additionaldocuments") {
      setTeacherForm({ ...teacherForm, [e.target.name]: e.target.files });
    } else if (e.target.name === "courses") {
      const newForm = teacherForm;
      newForm.courses.push(e.target.value);
      setTeacherForm(newForm);
    } else if (e.target.name === "dob") {
      if (validateDob(e.target.value)) {
        setTeacherForm({ ...teacherForm, [e.target.name]: e.target.files });
      } else {
        alert("Date of birth is not correct!");
        return;
      }
    } else {
      setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
    }
  };

  // It handles the submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const teachersRef = db.collection("teachers");
    const salaryref = db.collection("salaries");
    const storageRef = firebase.storage().ref();

    const {
      teacherphoto,
      teachercnicphoto,
      medicalrecordsphoto,
      additionaldocuments,
      cv,
      degreefile,
    } = teacherForm;

    //Updating the salary if updated
    if (teacherData.initsalary !== teacherForm.initsalary) {
      salaryref
        .where("id", "==", teacherData.tid)
        .get()
        .then((res) => {
          salaryref.doc(res.docs[0].id).update({
            salary: teacherForm.initsalary,
          });
        });
    }

    //Updating the text record of teacher record except courses array
    db.collection("teachers").doc(teacherData.firebaseId).update({
      tid: teacherForm.tid,
      firstname: teacherForm.firstname,
      lastname: teacherForm.lastname,
      dob: teacherForm.dob,
      gender: teacherForm.gender,
      address: teacherForm.address,
      phone: teacherForm.phone,
      email: teacherForm.email,
      cnic: teacherForm.cnic,
      degree: teacherForm.degree,
      institutename: teacherForm.institutename,
      passingyear: teacherForm.passingyear,
      obtgpa: teacherForm.obtgpa,
      designation: teacherForm.designation,
      doj: teacherForm.doj,
      initsalary: teacherForm.initsalary,
      emergencyname: teacherForm.emergencyname,
      emergencyphone: teacherForm.emergencyphone,
      emergencyrelationship: teacherForm.emergencyrelationship,
    });

    //If profile picture is changed
    if (
      JSON.stringify(teacherForm.teacherphoto) !==
      JSON.stringify(teacherData.teacherphoto)
    ) {
      // console.log(studentphoto);
      const metadata = {
        contentType: teacherphoto.type,
        customMetadata: {
          fileExtension: teacherphoto.name.split(".").pop(),
        },
      };
      await firebase
        .storage()
        .refFromURL(teacherData.teacherphoto.URL)
        .delete()
        .then(async () => {
          const teacherphotoSnapshot = await storageRef
            .child(`teacher/${teacherForm.tid}/teacherphoto`)
            .put(teacherphoto);
          let URL = await teacherphotoSnapshot.ref.getDownloadURL();
          let teacherphotoURL = { URL, metadata };
          await teachersRef.doc(teacherData.firebaseId).update({
            teacherphoto: teacherphotoURL,
          });
        });
    }

    //If CNIC FILE is changed
    if (
      JSON.stringify(teacherForm.studentcnicphoto) !==
      JSON.stringify(teacherData.studentcnicphoto)
    ) {
      const metadata = {
        contentType: teachercnicphoto.type,
        customMetadata: {
          fileExtension: teachercnicphoto.name.split(".").pop(),
        },
      };
      await firebase
        .storage()
        .refFromURL(teacherData.teachercnicphoto.URL)
        .delete()
        .then(async () => {
          const teachercnicphotoSnapshot = await storageRef
            .child(`teacher/${teacherForm.tid}/teachercnic`)
            .put(teachercnicphoto);
          let URL = await teachercnicphotoSnapshot.ref.getDownloadURL();
          let teachercnicphotoURL = { URL, metadata };
          await teachersRef.doc(teacherData.firebaseId).update({
            teachercnicphoto: teachercnicphotoURL,
          });
        });
    }
    //If Degree FILE is changed
    if (
      JSON.stringify(teacherForm.degreefile) !==
      JSON.stringify(teacherData.degreefile)
    ) {
      const metadata = {
        contentType: degreefile.type,
        customMetadata: {
          fileExtension: degreefile.name.split(".").pop(),
        },
      };
      await firebase
        .storage()
        .refFromURL(teacherData.degreefile.URL)
        .delete()
        .then(async () => {
          const degreefileSnapshot = await storageRef
            .child(`teacher/${teacherForm.tid}/degree`)
            .put(degreefile);
          let URL = await degreefileSnapshot.ref.getDownloadURL();
          let degreefileURL = { URL, metadata };
          await teachersRef.doc(teacherData.firebaseId).update({
            degreefile: degreefileURL,
          });
        });
    }
    //If CV FILE is changed
    if (JSON.stringify(teacherForm.cv) !== JSON.stringify(teacherData.cv)) {
      const metadata = {
        contentType: cv.type,
        customMetadata: {
          fileExtension: cv.name.split(".").pop(),
        },
      };
      await firebase
        .storage()
        .refFromURL(teacherData.cv.URL)
        .delete()
        .then(async () => {
          const cvSnapshot = await storageRef
            .child(`teacher/${teacherForm.tid}/cv`)
            .put(cv);
          let URL = await cvSnapshot.ref.getDownloadURL();
          let cvURL = { URL, metadata };
          await teachersRef.doc(teacherData.firebaseId).update({
            cv: cvURL,
          });
        });
    }

    //If Medical Record file is changed
    if (
      JSON.stringify(teacherForm.medicalrecordsphoto) !==
      JSON.stringify(teacherData.medicalrecordsphoto)
    ) {
      const metadata = {
        contentType: medicalrecordsphoto.type,
        customMetadata: {
          fileExtension: medicalrecordsphoto.name.split(".").pop(),
        },
      };
      if (teacherData.medicalrecordsphoto.length !== 0) {
        await firebase
          .storage()
          .refFromURL(teacherData.medicalrecordsphoto.URL)
          .delete()
          .then(async () => {
            const medicalrecordphotoSnapshot = await storageRef
              .child(`teacher/${teacherForm.tid}/medicalrecord`)
              .put(medicalrecordsphoto);
            let URL = await medicalrecordphotoSnapshot.ref.getDownloadURL();
            let medicalrecordphotoURL = { URL, metadata };
            await teachersRef.doc(teacherData.firebaseId).update({
              medicalrecordsphoto: medicalrecordphotoURL,
            });
          });
      } else {
        const medicalrecordphotoSnapshot = await storageRef
          .child(`teacher/${teacherForm.tid}/medicalrecord`)
          .put(medicalrecordsphoto);
        let URL = await medicalrecordphotoSnapshot.ref.getDownloadURL();
        let medicalrecordphotoURL = { URL, metadata };
        await teachersRef.doc(teacherData.firebaseId).update({
          medicalrecordsphoto: medicalrecordphotoURL,
        });
      }
    }

    //If Additional files is changed
    if (
      JSON.stringify(teacherForm.additionaldocuments) !==
      JSON.stringify(teacherData.additionaldocuments)
    ) {
      let metadata = {};
      //Deleting the previous additional Files
      if (additionaldocuments && additionaldocuments.length !== 0) {
        teacherData.additionaldocuments.map(async (additionaldocument) => {
          await firebase.storage().refFromURL(additionaldocument.URL).delete();
          db.collection("teachers")
            .doc(teacherForm.firebaseId)
            .update({
              additionaldocuments:
                firebase.firestore.FieldValue.arrayRemove(additionaldocument),
            });
        });
      }
      let additionalFilesURL = [];
      for (var i = 0; i < teacherForm.additionaldocuments.length; i++) {
        metadata = {
          contentType: additionaldocuments[i].type,
          customMetadata: {
            fileExtension: additionaldocuments[i].name.split(".").pop(),
          },
        };
        const additionaldocumentSnapshot = await storageRef
          .child(`teacher/${teacherForm.tid}/additionaldocument${i + 1}`)
          .put(additionaldocuments[i], { metadata });
        let URL = await additionaldocumentSnapshot.ref.getDownloadURL();
        additionalFilesURL.push({ URL, metadata });
        await teachersRef.doc(teacherForm.firebaseId).update({
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
    setTimeout(() => {
      setIsSuccessfullyAdded(false);
    }, []);
  };

  const handleCourseRemove = (courseFirebaseId,coursename) => {
    let updatedForm = teacherForm;
    let atIndex = updatedForm.courses.indexOf(courseFirebaseId);
    updatedForm.courses.splice(atIndex, 1);
    setTeacherForm(updatedForm);

    // Updaing the course record in database
    db.collection("teachers").doc(state.firebaseId).update({
      courses: updatedForm.courses,
      coursesname:firebase.firestore.FieldValue.arrayRemove(coursename)
    });
    // Updaing the course record in database
    db.collection("courses").doc(courseFirebaseId).update({
      courseInstructorId: "",
    });
  };

  return (
    <div className="add-student-form container mt-2 w-100 ">
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div>
        <h2 className="text-center">Instructor Edit Form</h2>
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
              src={
                teacherPhotoURL === ""
                  ? teacherForm.teacherphoto.URL
                  : teacherPhotoURL
              }
              alt="teacherPicture "
              width={130}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="input-group mb-3">
            <input
              type="file"
              className="form-control"
              id="teacherphoto"
              name="teacherphoto"
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
              label="Teacher ID"
              variant="outlined"
              type="text"
              name="tid"
              title="The input should start with 't' or 'T' followed by 4 characters that can be either letters or numbers."
              inputProps={{
                pattern: "[tT][a-zA-Z0-9]{4}",
              }}
              placeholder="t1234"
              value={teacherForm.tid}
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
              placeholder="Mukesh"
              value={teacherForm.firstname}
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
              value={teacherForm.lastname}
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
              value={teacherForm.dob.toString().substr(0, 10)}
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
              name="gender"
              value={teacherForm.gender}
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
            placeholder="street#2 washington, America "
            className="py-1 px-2 rounded "
            value={teacherForm.address}
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
              label="Phone Number"
              variant="outlined"
              type="tel"
              name="phone"
              placeholder="03xxxxxxxxx"
              value={teacherForm.phone}
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
              inputProps={{ pattern: "[0-9]{5}-[0-9]{7}-[0-9]" }}
              placeholder="xxxxx-xxxxxxx-x"
              value={teacherForm.cnic}
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
              id="outlined-basic"
              label="Email"
              variant="outlined"
              type="email"
              name="email"
              value={teacherForm.email}
              onChange={(e) => {
                handleChange(e);
              }}
            />
          </div>
        </div>

        {/* Qualification */}
        <div className="mt-2">
          <h3 className="text-center">Qualification</h3>

          <div className="row">
            <div className="d-flex flex-column col">
              <TextField
                id="outlined-basic"
                label="Degree"
                variant="outlined"
                type="text"
                name="degree"
                placeholder="BS(CS)"
                focused
                value={teacherForm.degree}
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
                id="outlined-basic"
                label="Institute Name"
                variant="outlined"
                type="text"
                name="institutename"
                placeholder="IIT,India"
                focused
                value={teacherForm.institutename}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="d-flex flex-column col">
              <label htmlFor="passingyear">
                Pasing Year:<span className="required">*</span>
              </label>
              <TextField
                id="outlined-basic"
                variant="outlined"
                type="date"
                name="passingyear"
                value={teacherForm.passingyear}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
            <div className="d-flex flex-column col mt-4">
              <TextField
                id="outlined-basic"
                label="Obtained CGPA"
                variant="outlined"
                inputProps={{ min: 0 }}
                type="number"
                name="obtgpa"
                placeholder="3.8"
                focused
                value={teacherForm.obtgpa}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
        </div>
        {/* Course Allotment */}
        <div className="mt-2 ">
          <h3 className="text-center">Course Instructor Enrollment</h3>
          <div className="row d-flex flex-wrap">
            {typeof coursesInstructor !== "undefined" && coursesInstructor
              ? coursesInstructor.map((course) => {
                  return (
                    <>
                      {teacherForm.courses.includes(course.firebaseId) ? (
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
                                  handleCourseRemove(course.firebaseId,course.courseName);
                                }}
                              >
                                Remove
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
          <div className="row mt-2">
            <div className="d-flex flex-column col">
              <TextField
                label="Designation"
                type="text"
                id="designation"
                placeholder="Professor"
                name="designation"
                value={teacherForm.designation}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="d-flex flex-column col">
            <label htmlFor="doj">
              Date of joining:<span className="required">*</span>
            </label>
            <TextField
              type="date"
              name="doj"
              id="doj"
              value={teacherForm.doj}
              onChange={(e) => {
                handleChange(e);
              }}
            />
          </div>
          <div className="d-flex flex-column col mt-4">
            <TextField
              type="number"
              label="Salary"
              id="init_salary"
              name="initsalary"
              placeholder="50000"
              value={teacherForm.initsalary}
              inputProps={{ min: 0 }}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
        </div>
        {/* Emergency Contact Section */}
        <div className="mt-2">
          <h3 className="text-center">Emergency Contact Form</h3>
          <div className="row">
            <div className="d-flex flex-column col">
              <TextField
                label="Name"
                type="text"
                id="emergency-name"
                name="emergencyname"
                placeholder="Ansoo"
                value={teacherForm.emergencyname}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="d-flex flex-column col">
            <TextField
              label="Relationship"
              type="text"
              id="emergency-relationship"
              name="emergencyrelationship"
              placeholder="sister"
              value={teacherForm.emergencyrelationship}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
          <div className="d-flex flex-column col">
            <TextField
              label="Phone Number"
              type="tel"
              id="emergency-phone"
              name="emergencyphone"
              placeholder="03xxxxxxxxx"
              value={teacherForm.emergencyphone}
              onChange={(e) => {
                handleChange(e);
              }}
              required
            />
          </div>
        </div>

        {/* Related Documents */}
        <div className="mt-1">
          <h3 className="text-center">Related Documents</h3>
          <div className="row">
            <div className="col">
              <label htmlFor="teachercnic">CNIC:</label>
              <input
                type="file"
                id="teachercnic"
                name="teachercnicphoto"
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

            <div className="col d-flex">
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
              ></input>
            </div>
            <div className="col d-flex">
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

export default TeacherEdit;
