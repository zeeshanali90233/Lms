import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../Css/Admission.css";
import firebase from "firebase/compat/app";
import AddStudentICON from "../Assets/Logos/AddStudentICON.png";
import AddTeacherICON from "../Assets/Logos/AddTeacherICON.png";
import AddStaffICON from "../Assets/Logos/AddStaffICON.png";

const AdmissionPage = ({ canAddStudent, canAddTeacher, canAddStaff }) => {
  const navigate = useNavigate();
  useEffect(() => {
    // Get the currently signed-in user
    var user = firebase.auth().currentUser;

    if (!user) {
      navigate("/");
    }
  }, []);
  return (
    <div className="admissionPage w-100 d-flex justify-content-center align-items-center ">
      <div className="d-flex justify-content-around w-100 flex-wrap ">
        {/* Add Student  */}
        {canAddStudent ? (
          <NavLink
            to="add-student"
            className="text-decoration-none panel border d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
          >
            <div className="icon">
              <img src={AddStudentICON} alt="" width={50}/>
            </div>
            <h3 className="text-dark text ">
           Add Student 
            </h3>
            
          </NavLink>
        ) : (
          ""
        )}

        {/* Add Teacher/Instructor/lecturer */}
        {canAddTeacher ? (
          <NavLink
            to="add-teacher"
            className="text-decoration-none panel border d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
          >
            <div className="icon">

            <img src={AddTeacherICON} alt="" width={50}/>
            </div>
            <h3 className="text-dark text">Add Teacher/Instructor/Lecturer</h3>
           
          </NavLink>
        ) : (
          ""
        )}

        {/* Add LowerStaff */}
        {canAddStaff ? (
          <NavLink
            to="add-staff"
            className="text-decoration-none panel border d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
          >
            <div className="icon">
            <img src={AddStaffICON} alt="" width={50}/>

            </div>
            <h3 className="text-dark text">
            Add Staff
            </h3>
          
          </NavLink>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default AdmissionPage;
