import React, { useState, useEffect } from "react";
import StaffPagination from "../Components/StaffPagination";
import { db } from "../Firebase/config";
import firebase from "firebase/compat/app";
import { useNavigate } from "react-router-dom";

const StaffPage = ({ consistsStaff, consistsTeachers, consistsAdmins }) => {
  const [staffData, setStaffData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    // Get the currently signed-in user
    var user = firebase.auth().currentUser;

    if (!user) {
      navigate("/404page");
    }

    let data = [];

    // Admin Data
    if (consistsAdmins) {
      db.collection("admin").onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setStaffData(data);
      });
    }

    // Teacher Data
    if (consistsTeachers) {
      db.collection("teachers").onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          doc.data().type.toUpperCase();
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setStaffData(data);
      });
    }

    // Staff Data
    if (consistsStaff) {
      db.collection("staff").onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          doc.data().designation.toUpperCase();
          data.push({ ...doc.data(), firebaseId: doc.id });
        });
        setStaffData(data);
      });
    }
  }, []);
  return (
    <div className="staffSide">
      <StaffPagination data={staffData} isSuperAdmin={consistsAdmins}/>
    </div>
  );
};

export default StaffPage;
