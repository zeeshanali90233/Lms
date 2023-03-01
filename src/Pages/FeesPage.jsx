import React from "react";
import { useEffect, useState } from "react";
import { db } from "../Firebase/config";
// Fee Display Component also uses this css file
import "../Css/FeesPage.css";
import FeePagination from "../Components/FeePagination";
import firebase from 'firebase/compat/app';
import { useNavigate } from "react-router-dom";


const FeesPage = ({isSuperAdmin,isAdmin,isStaff}) => {
  // It contains the student fees data
  const [studentFees, setStudentFees] = useState([]);
  const navigate=useNavigate();
  // It retreives all the student fees records
  useEffect(() => {
 // Get the currently signed-in user
 var user = firebase.auth().currentUser;

 if (!user) {
   navigate("/");
 }


 return db.collection("fees").onSnapshot((snapshot) => {
  const postData = [];
  snapshot.forEach((doc) =>
    postData.push({ ...doc.data(), firebaseid: doc.id })
  );
  postData.sort((a, b) => {
    return new Date(a.duedate) - new Date(b.duedate);
  });
  setStudentFees(postData);
});
  }, []);

  return (
    <div className="fee-page mt-2 w-100">
      
      <div className="title text-center">
        <h1>Student Fees</h1>
      </div>
     
      {(studentFees && studentFees.length!==0)?<div className="text-black">
        <FeePagination data={studentFees} pageSize={10} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} isStaff={isStaff}/>
      </div>:
      <div className="text-center">No Record </div>
      }
    </div>
  );
};

export default FeesPage;
