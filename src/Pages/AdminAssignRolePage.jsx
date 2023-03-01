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
import { adminUser } from "./AdminDashboard";

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

const AdminAssignRolePage = () => {
  const [teachers, setTeachers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [admin, setAdmin] = useState([]);
  const [roleForm, setRoleForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const formRef = useRef();
  const navigate=useNavigate();
  const user=useContext(adminUser);

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

    //  Updating the teachers
    db.collection("teachers")
      .doc(roleForm.staffId)
      .update({
        assignedrole: firebase.firestore.FieldValue.arrayUnion({role:roleForm.role,date:currentDate,time:currentTime,assignedby:`${user.firstname+" "+user.lastname+"("+user.aid+")"}`}),
      })
      .catch((err)=>{
        return;
       })
       
     // Updating the lstaff
     db.collection("staff")
     .doc(roleForm.staffId)
     .update({
       assignedrole: firebase.firestore.FieldValue.arrayUnion(
         {role:roleForm.role,date:currentDate,time:currentTime,assignedby:`${user.firstname+" "+user.lastname+"("+user.aid+")"}`}
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
    // Getting the teachers record from firebase
    const fetchTeacher = async () => {
      await db.collection("teachers").onSnapshot((snapshot) => {
        let data = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setTeachers(data);
      });
    };
    // Getting the lower Staff record from firebase
    const fetchLStaff = async () => {
      await db.collection("staff").onSnapshot((snapshot) => {
        let data = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setStaff(data);
      });
    };

    fetchTeacher();
    fetchLStaff();
  }, []);
  return (
    <div className="assignrole-container mt-2 container">
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}
      <div className="title-wrapper text-center">
        <h4 className="title">Assign Role</h4>
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
            Staff:<span className="required">*</span>
          </label>
          <select
            name="staffId"
            id="staffId"
            onChange={(e) => {
              handleChange(e);
            }}
            className="py-2 rounded"
            required
          >
            <option value="">Select the staff</option>
            {/* Teacher Map */}
            {teachers.map((eachStaff) => {
              return (
                <option
                  value={`${eachStaff.firebaseId}`}
                  key={eachStaff.firebaseId}
                >
                  {eachStaff.firstname + " " + eachStaff.lastname}(
                  {eachStaff.designation},{eachStaff.tid.toUpperCase()})
                </option>
              );
            })}

            {/* Staff Map */}
            {staff.map((eachStaff) => {
              return (
                <option
                  value={`${eachStaff.firebaseId}`}
                  key={eachStaff.firebaseId}
                >
                  {eachStaff.firstname + " " + eachStaff.lastname}(
                  {eachStaff.designation},{eachStaff.staffid.toUpperCase()})
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

export default AdminAssignRolePage;
