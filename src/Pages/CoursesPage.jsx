import React from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { db } from "../Firebase/config";
import "../Css/CoursePage.css";
import { useEffect ,useContext} from "react";

import AddCourseICON from "../Assets/Logos/AddCourseICON.png";
import CoursePagination from "../Components/CoursePagination";
import { staffUser } from "./StaffDashboard";

const CoursesPage = ({showCourseDeleteBtn,isSuperAdmin,isStaff,isAdmin}) => {
  const [courses, setCourses] = useState([]);
const staffData=useContext(staffUser||{})
  useEffect(() => {
    return db.collection("courses").onSnapshot((snapshot) => {
      let data = [];
      snapshot.forEach((doc) => {
        data.push({ ...doc.data(), firebaseId: doc.id });
      });
      setCourses(data);
    });
  }, []);
  return (
    <div className="courses-page w-100">
      <div className="w-100 d-flex mt-2 justify-content-end ">
        {((staffData && staffData.courseauthority)?staffData.courseauthority.add:true)?<NavLink to="/sadmin/dashboard/add-course" className="text-decoration-none">
          <button className="btn-addCourse border d-flex  px-3 py-2 align-items-center rounded justify-content-center">
            <div className="icon">
              <img src={AddCourseICON} alt="" width={40}/>
            </div>
            <div className="text text-dark">Add Course</div>
          </button>
        </NavLink>:""}
      </div>
      {/* Course Pagination */}
        <CoursePagination data={courses} showCourseDeleteBtn={showCourseDeleteBtn} isSuperAdmin={isSuperAdmin} isStaff={isStaff} isAdmin={isAdmin} isStudent={false} isTeacher={false}/>
      </div>

  );
};

export default CoursesPage;
