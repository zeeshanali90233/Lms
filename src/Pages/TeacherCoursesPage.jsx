import React from "react";
import { useState ,useContext} from "react";
import { db } from "../Firebase/config";
import "../Css/CoursePage.css";
import { useEffect } from "react";
import { teacherUser } from "./TeacherDashboard";
import CoursePagination from "../Components/CoursePagination";
import NoDataICON from "../Assets/Logos/NoDataICON.png";

const TeacherCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [teacher,setTeacher]=useState(useContext(teacherUser) || null);
    useEffect(() => {
        const firebaseId = localStorage.getItem("teacherUser");
        db.collection("teachers").doc(firebaseId).onSnapshot((snapshot) => {
          setTeacher(snapshot.data());
          const fetchCourses = async () => {
            let courses = [];
            for (const course of snapshot.data().courses) {
              const snapshot = await db.collection("courses").doc(course).get();
              courses.push({...snapshot.data(), firebaseId: snapshot.id});
            }
            setCourses(courses);
          };
          fetchCourses();
        });
      }, []);
    return (
      <div className="courses-page w-100">
        
        {/* Course Pagination */}
         {(courses && courses.length!==0)? <CoursePagination data={courses} isSuperAdmin={false} isStaff={false} isAdmin={false} isStudent={false} isTeacher={true}/>:
         
         <div className="w-100 d-flex flex-column justify-content-center align-items-center">
          <img src={NoDataICON} alt="" width={50}/>
          No Course Registered
          </div>}
        </div>
  )
}

export default TeacherCoursesPage
