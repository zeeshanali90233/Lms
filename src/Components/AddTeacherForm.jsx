import React, { useEffect } from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
import "../Css/AddStudentForm.css";
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
  coursesname:[],
  degreefile: "",
  medicalrecordsphoto: "",
  cv: "",
  additionaldocuments: [],
  type: "teacher",
  assignedrole: [],
};

const AddTeacherForm = () => {
  const [teacherForm, setTeacherForm] = useState(teacherFormInit);
  const [teacherPhotoURL, setTeacherPhotoURL] = useState("");
  const [courses, setCourses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    db.collection("courses").onSnapshot((snapshot) => {
      let data = [];
      snapshot.forEach((course) => {
        data.push({ ...course.data(), firebaseId: course.id });
      });
      setCourses(data);
    });

    
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
      newForm.courses=(e.target.value==='none')?[]:[e.target.value];
      const selectedCourse = courses.find(
        (course) => course.firebaseId === e.target.value
      );
      newForm.coursesname =
        e.target.value === "none" ? [] : [selectedCourse.courseName];
      setTeacherForm(newForm);
    } else if (e.target.name === "dob") {
      if (validateDob(e.target.value)) {
        setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
      } else {
        alert("Date of birth is not correct!");
        return;
      }
    } else {
      setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
    }
    // console.log(teacherForm);
  };

  // It handles the submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Create a reference to the students collection
    const teachersRef = db.collection("teachers");
    const salaryref = db.collection("salaries");

    // Checks Whether a user is not already exists
     //Add email and password to firebase auth
     
    try {
      const signInMethods = await firebase
      .auth()
      .createUserWithEmailAndPassword(
        `${teacherForm.tid}@alm.edu.pk`,
        "123456789"
      );
    
    } catch (err) {
      alert("Teacher with same ID already exists");
        setIsSaving(false);
        return;
    }
    // Taking the files from from
    const {
      teacherphoto,
      teachercnicphoto,
      medicalrecordsphoto,
      additionaldocuments,
      cv,
      degreefile,
    } = teacherForm;
    const teacherTextForm = teacherForm;
    teacherTextForm.tid = teacherTextForm.tid.toLowerCase();
    teacherTextForm.teacherphoto = "";
    teacherTextForm.teachercnicphoto = "";
    teacherTextForm.medicalrecordsphoto = "";
    teacherTextForm.additionaldocuments = "";
    teacherTextForm.cv = "";
    teacherTextForm.degreefile = "";
    // Create a storage reference
    const storageRef = firebase.storage().ref();

    let teacherphotoURL = "";
    let teachercnicphotoURL = "";
    let medicalrecordsphotoURL = "";
    let cvURL = "";
    let degreeURL = "";

    // get the current date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    const currentDate = `${dd}-${mm}-${yyyy}`;

    // It adds the teacher data in firebase
    
    await teachersRef
    .add(teacherTextForm)
    .then(async (doc) => {
      //Upload the files
      // console.log(teacherTextForm);
        if (teacherphoto) {
          const metadata = {
            contentType: teacherphoto.type,
            customMetadata: {
              fileExtension: teacherphoto.name.split(".").pop(),
            },
          };
          const teacherphotoSnapshot = await storageRef
            .child(`teacher/${teacherTextForm.tid}/teacherphoto`)
            .put(teacherphoto);
          const URL = await teacherphotoSnapshot.ref.getDownloadURL();
          teacherphotoURL = { URL, metadata };
        }
        if (teachercnicphoto) {
          const metadata = {
            contentType: teachercnicphoto.type,
            customMetadata: {
              fileExtension: teachercnicphoto.name.split(".").pop(),
            },
          };
          const teachercnicphotoSnapshot = await storageRef
            .child(`teacher/${teacherTextForm.tid}/teachercnic`)
            .put(teachercnicphoto);
          const URL = await teachercnicphotoSnapshot.ref.getDownloadURL();
          teachercnicphotoURL = { URL, metadata };
        }
        if (medicalrecordsphoto) {
          const metadata = {
            contentType: medicalrecordsphoto.type,
            customMetadata: {
              fileExtension: medicalrecordsphoto.name.split(".").pop(),
            },
          };
          const medicalrecordphotoSnapshot = await storageRef
            .child(`teacher/${teacherTextForm.tid}/medicalrecord`)
            .put(medicalrecordsphoto);
          const URL = await medicalrecordphotoSnapshot.ref.getDownloadURL();
          medicalrecordsphotoURL = { URL, metadata };
        }
        if (cv) {
          const metadata = {
            contentType: cv.type,
            customMetadata: {
              fileExtension: cv.name.split(".").pop(),
            },
          };
          const cvSnapshot = await storageRef
            .child(`teacher/${teacherTextForm.tid}/cv`)
            .put(cv);
          const URL = await cvSnapshot.ref.getDownloadURL();
          cvURL = { URL, metadata };
        }
        if (degreefile) {
          const metadata = {
            contentType: degreefile.type,
            customMetadata: {
              fileExtension: degreefile.name.split(".").pop(),
            },
          };
          const cvSnapshot = await storageRef
            .child(`teacher/${teacherTextForm.tid}/degree`)
            .put(degreefile);
          const URL = await cvSnapshot.ref.getDownloadURL();
          degreeURL = { URL, metadata };
        }
        // Additional Files
        let additionalFiles = [];
        if (additionaldocuments) {
          let metadata;
          for (var i = 0; i < additionaldocuments.length; i++) {
            metadata = {
              contentType: additionaldocuments[i].type,
              customMetadata: {
                fileExtension: additionaldocuments[i].name.split(".").pop(),
              },
            };
            const additionaldocumentsSnapshot = await storageRef
              .child(
                `teacher/${teacherTextForm.tid}/additionaldocument${i + 1}`
              )
              .put(additionaldocuments[i]);
            const URL = await additionaldocumentsSnapshot.ref.getDownloadURL();
            additionalFiles.push({ URL, metadata });
          }
        }

        // Fee Receipt
        const salaryReceipt = {
          photoURL: teacherphotoURL,
          id: teacherForm.tid,
          name: teacherForm.firstname + " " + teacherForm.lastname,
          salary: teacherForm.initsalary,
          paid: false,
          teacherfirebaseid:doc.id,
          date: currentDate,
        };
         // Adding the receipt in the fees collection
        const salaryRef= await salaryref.add(salaryReceipt);
        // update the document with the file URLs
        await teachersRef.doc(doc.id).update({
          teacherphoto: teacherphotoURL,
          teachercnicphoto: teachercnicphotoURL,
          medicalrecordsphoto: medicalrecordsphotoURL,
          additionaldocuments: additionalFiles,
          cv: cvURL,
          degreefile: degreeURL,
          salaryfirebaseid:salaryRef.id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

       
        if (teacherForm.courses.length !== 0) {
          db.collection("courses").doc(teacherForm.courses[0]).update({
            courseInstructorId: doc.id,
          });
        }
       
        setIsSaving(false);
        setIsSuccessfullyAdded(true);
        // Setting student form to init
        setTeacherForm(teacherFormInit);
        console.log("SuccessFully Added");
        formRef.current.reset();
        setTimeout(() => {
          // Removing the alert from top after 2s
          setIsSuccessfullyAdded(false);
          setTeacherPhotoURL("");
        }, 2000);
      })
      .catch((err) => {
        console.log(err);
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
        <h2 className="text-center">Instructor Admission Form</h2>
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
              src={teacherPhotoURL === "" ? emptyProfile : teacherPhotoURL}
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
        {/* Main Teacher Information */}
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
              value={teacherForm.dob}
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
              {/* <MenuItem value={""}>Select Gender</MenuItem> */}
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
                inputProps={{ min: 0}}
                type="number"
                name="obtgpa"
                placeholder="3.8"
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
        <div className="mt-2">
          <h3 className="text-center">Course Instructor Enrollment</h3>
          <div className="row">
            <div className="d-flex flex-column col">
            <InputLabel id="demo-simple-select-helper-label">Select Course</InputLabel>
        <Select
        labelId="demo-simple-select-helper-label"
        name="courses"
        onChange={(e) => {
          handleChange(e);
        }}
        >
          <MenuItem value="none" defaultChecked>
            <em>None</em>
          </MenuItem>

         { courses.map((course) => {
                      return (
                        <MenuItem
                          value={`${course.firebaseId}`}
                          key={course.courseId}
                        >
                          {course.courseName}({course.courseId})
                        </MenuItem>
                      );
                    })}

                  </Select>
              
            </div>
            
          </div>
          <div className="row mt-2">
            <div className="d-flex flex-column col">
            <TextField
                label="Designation"
                type="text"
                id="designation"
                name="designation"
                value={teacherForm.designation}
                placeholder="Professor"
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
                inputProps={{min:0}}
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
              <label htmlFor="teachercnic">
                CNIC:<span className="required">*</span>
              </label>
              <input
                type="file"
                id="teachercnic"
                name="teachercnicphoto"
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              ></input>
            </div>

            <div className="col">
              <label htmlFor="degree-file">
                Degree:<span className="required">*</span>
              </label>
              <input
                type="file"
                id="degree-file"
                name="degreefile"
                onChange={(e) => {
                  handleChange(e);
                }}
                required
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

export default AddTeacherForm;
