import React, { useState, useContext, useEffect } from "react";
import { studentUser } from "./StudentDashboard";
import { db } from "../Firebase/config";
import StudentAttendanceRowPagination from "../Components/StudentAttendanceRowPagination";
import NoDataICON from "../Assets/Logos/NoDataICON.png";

const StudentAttendancePage = () => {
  const [enrolledCourseData, setEnrolledCourseData] = useState([]);
  const student = useContext(studentUser);

  useEffect(() => {
    const fetchEnrolledCourseData = async () => {
      const enrolledCoursesDataArray = [];

      for (const courseFirebaseId of student.courses) {
        try {
          const snapshot = await db
            .collection("courses")
            .doc(courseFirebaseId)
            .get();
          enrolledCoursesDataArray.push({
            ...snapshot.data(),
            firebaseId: snapshot.id,
          });
        } catch (error) {
          console.error(error);
        }
      }

      setEnrolledCourseData(enrolledCoursesDataArray);
    };

    if (student) {
      fetchEnrolledCourseData();
    }
  }, []);

  return (
    <div>
      {enrolledCourseData && student &&
      enrolledCourseData.length !== 0 ? (
        enrolledCourseData.map((course) => {
          return (
           (course.attendance && course.attendance.length!==0)? <StudentAttendanceRowPagination
            student={student}
            attendanceData={course.attendance}
            courseId={course.courseId}
          />:""
          );
        })
      ) : (
        <div className="w-100 d-flex flex-column justify-content-center align-items-center">
          <img src={NoDataICON} alt="" width={50} />
          No Attendance Record
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;
