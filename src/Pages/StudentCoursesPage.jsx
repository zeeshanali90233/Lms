import React from "react";
import { useState ,useContext} from "react";
import { db } from "../Firebase/config";
import "../Css/CoursePage.css";
import { useEffect } from "react";
import CoursePagination from "../Components/CoursePagination";
import { studentUser } from "./StudentDashboard";

const StudentCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [student,setStudent]=useState(useContext(studentUser) || null);
    useEffect(() => {
        const firebaseId = localStorage.getItem("studentUser");
        db.collection("students").doc(firebaseId).onSnapshot((snapshot) => {
            setStudent(snapshot.data());
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
         {(courses)? <CoursePagination data={courses}  isSuperAdmin={false} isStaff={false} isAdmin={false} isStudent={true} isTeacher={false}/>:""}
        </div>
  )
}

export default StudentCoursesPage
