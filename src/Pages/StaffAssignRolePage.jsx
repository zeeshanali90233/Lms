import React, { useContext } from "react";
import { useEffect, useState, useRef } from "react";
import { db } from "../Firebase/config";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/system";
import Alert from "@mui/material/Alert";
import firebase from "firebase/compat/app";
import "../Css/AssignRolePage.css";
import { useNavigate } from "react-router-dom";
import { staffUser } from "./StaffDashboard";

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

const StaffAssignRolePage = () => {
  const [student, setStudent] = useState([]);
  const [roleForm, setRoleForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef();
  const navigate=useNavigate();
  const user=useContext(staffUser);

  const handleChange = (e) => {
    e.preventDefault();
    setRoleForm({ ...roleForm, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Current Date
    let today = new Date();
      let currentDate = today.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      });

      // Current Time
     let currentTime= new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })

       
     // Updating the lstaff
     db.collection("students")
     .doc(roleForm.studentId)
     .update({
       assignedrole: firebase.firestore.FieldValue.arrayUnion(
         {role:roleForm.role,date:currentDate,time:currentTime,assignedby:`${user.firstname+" "+user.lastname+"("+user.staffid+")"}`}
       ),
     }).catch((err)=>{
      return;
     })
     

    setIsSaving(false);
    setIsSuccessfullyAdded(true);
    setTimeout(() => {
      setIsSuccessfullyAdded(false);
    }, 1500);
    formRef.current.reset();
  };
  useEffect(() => {
     // Get the currently signed-in user
var user = firebase.auth().currentUser;

if (!user) {
  navigate("/404page")
} 
   
    // Getting the lower Staff record from firebase
    const fetchStudents = async () => {
      await db.collection("students").onSnapshot((snapshot) => {
        let data = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setStudent(data);
      });
    };

    fetchStudents();
  }, []);
  return (
    <div className="assignrole-container mt-2 container">
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div className="title-wrapper text-center">
        <h4 className="title">Message</h4>
      </div>
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        ref={formRef}
      >
        {/* Selecting the staff */}
        <div className="d-flex flex-column role-input">
          <label htmlFor="s-id">
            Student:<span className="required">*</span>
          </label>
          <select
            name="studentId"
            id="studentId"
            onChange={(e) => {
              handleChange(e);
            }}
            className="py-2 rounded"
            required
          >
            <option value="">Select the student</option>

            {/* Student Map */}
            {student.map((eachStaff) => {
              return (
                <option
                  value={`${eachStaff.firebaseId}`}
                  key={eachStaff.firebaseId}
                >
                  {eachStaff.firstname + " " + eachStaff.lastname}(
                  {eachStaff.type},{eachStaff.sid.toUpperCase()})
                </option>
              );
            })}
          </select>
        </div>
        {/* Input the role */}
        <div className="d-flex flex-column role-input">
          <label htmlFor="s-id">
            Assign Role :<span className="required">*</span>
          </label>
          <textarea
            type="text"
            id="role"
            name="role"
            rows="7"
            className="py-1 px-2 rounded "
            placeholder="Make a presentation for our new developement strategies and forward it to me before 5pm"
            onChange={(e) => {
              handleChange(e);
            }}
            required
          ></textarea>
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
              <span>Assign</span>
            </SaveButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StaffAssignRolePage;
