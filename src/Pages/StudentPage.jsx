import React, { useEffect, useState,useContext } from 'react'
import { NavLink } from 'react-router-dom'
import StudentPagination from '../Components/StudentPagination'
import { db } from '../Firebase/config';
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router-dom';
import AddStudentICON from "../Assets/Logos/AddStudentICON.png";
import "../Css/StudentPage.css";
import { staffUser } from './StaffDashboard';

const StudentPage = ({isSuperAdmin,isAdmin,isStaff}) => {
  const staff=useContext(staffUser)
    const [studentData,setStudentData]=useState([]);
    const navigate=useNavigate();
    useEffect(()=>{

// Get the currently signed-in user
var user = firebase.auth().currentUser;

if (!user) {
  navigate("/")
} 
     return (
        db.collection("students").onSnapshot((snapshot)=>{
            let data=[];
            snapshot.forEach((doc)=>{
                data.push({...doc.data(),firebaseId:doc.id})
            });
            setStudentData(data);
        })
     )
    },[])
  return (
    <div className='studentSide'>
      {/* Checking if the user is staff then this button will be visible on check */}
        {((isStaff)?(staff && staff.studentauthority &&  staff.studentauthority.add)?true:false:true)?<div className='d-flex justify-content-end w-100 mt-1 '>
      <NavLink to={`/${(isSuperAdmin)?"sadmin":(isAdmin)?"admin":(isStaff)?"staff":""}/dashboard/admission/add-student`}  className="text-decoration-none border d-flex  align-items-center px-3 addstudent mx-1 py-2 rounded justify-content-center">
      <div className="icon">
              <img src={AddStudentICON} alt="" width={30}/>
            </div>
            <h5 className="text-dark text ">
           Add Student
            </h5>
        </NavLink>
      </div>:""}
      <StudentPagination data={studentData} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin}  isStaff={isStaff}/>
    </div>
  )
}

export default StudentPage
