import React from "react";
import { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import moment from "moment";
import LoadingButton from "@mui/lab/LoadingButton";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { styled } from "@mui/system";
import Chart from "chart.js/auto";
import TextField from "@mui/material/TextField";
import { Pie } from "react-chartjs-2";
import FeePagination from "../Components/FeePagination";

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
    color: "white",
  },
});

const CourseFinancePage = () => {
  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseFinanceDetail, setCourseFinanceDetail] = useState({
    completed: false,
  });

  useEffect(() => {
    const getCourses = () => {
      db.collection("courses").onSnapshot((snapshot) => {
        const coursesArr = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            firebaseId: doc.id,
          };
        });
        setCourses(coursesArr);
      });
    };

    getCourses();
  }, []);

  const studentFeeLabel = ["Fee Paid", "Fee Not Paid"];
  const studentFeePieChart = {
    labels: studentFeeLabel,
    datasets: [
      {
        label: "Students Fee",
        backgroundColor: ["#00c3ff", "#f7bf41"],
        borderColor: "#393c41",
        data: [
          courseFinanceDetail.totalFeesPaid,
          courseFinanceDetail.totalFeesRemaining,
        ],
      },
    ],
  };

  const getFeesData = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    // Make sure that a course is selected
    if (!selectedCourse) {
      return;
    }

    const courseDetail = await db
      .collection("courses")
      .doc(selectedCourse)
      .get();

    let feeArr = [];
    let totalFeesPaid = 0;
    let totalFeesRemaining = 0;
    let numDefaulters = 0;
    let defaultersArr = [];

    // Retrieve all student fees records in the selected course
    await Promise.all(
      courseDetail.data().studentfees.map(async (feeId) => {
        const feeDoc = await db.collection("fees").doc(feeId).get();
        const feeData = feeDoc.data();

        const totalFees = feeData.totalfees;
        const totalPaid = feeData.feepaid;
        const isDefaulter =
          moment().isAfter(feeData.duedate) && totalPaid < totalFees;

        // Add to the total fees paid/remaining
        totalFeesPaid += totalPaid;
        totalFeesRemaining += totalFees - totalPaid;

        // Increment the defaulters count
        if (isDefaulter) {
          numDefaulters++;
          defaultersArr.push({...feeData,firebaseid:feeDoc.id});
        }
      })
    );
    let totalFees = totalFeesPaid + totalFeesRemaining;
    let feePaidPercentage = parseFloat(
      ((totalFeesPaid / totalFees) * 100).toFixed(2)
    );
    let feeRemainingPercentage = parseFloat(
      ((totalFeesRemaining / totalFees) * 100).toFixed(2)
    );

    // Calculating the time left for the course to be completed
    const createdDate = courseDetail.data().createdAt;
    const currentDate = moment(); // current date and time
    const courseStartDate = moment(createdDate.toDate());
    const totalDuration = moment.duration(
      courseDetail.data().courseDuration,
      "months"
    ); // duration of the course in months
    const elapsedDuration = moment.duration(currentDate.diff(courseStartDate));
    const remainingDuration = totalDuration.subtract(elapsedDuration); // subtract elapsed duration from total duration to get remaining duration

    const remainingMonths = remainingDuration.months();
    const remainingDays = remainingDuration.days();

    // Update the state with the fees data
    setCourseFinanceDetail({
      courseId: courseDetail.data().courseId,
      courseName: courseDetail.data().courseName,
      courseDuration: courseDetail.data().courseDuration,
      remainingMonths: remainingMonths,
      remainingDays: remainingDays,
      totalFeesPaid: totalFeesPaid,
      totalFeesRemaining: totalFeesRemaining,
      numDefaulters: numDefaulters,
      defaultersArr: defaultersArr,
      totalFees: totalFees,
      feePaidPercentage: feePaidPercentage,
      feeRemainingPercentage: feeRemainingPercentage,
      noOfStudents: courseDetail.data().noOfStudents,
      completed: true,
    });
    setIsGenerating(false);
  };

  // It handles the course change
  const handleCourseChange = (e) => {
    e.preventDefault();
    setSelectedCourse(e.target.value);
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="title bg-dark  text-center text-white w-100">
        <h3 className="text-white">Course Finance</h3>
      </div>

      {/* Course Selection */}
      <form
        className="w-100"
        onSubmit={(e) => {
          getFeesData(e);
        }}
      >
        <div className="w-100 mt-2 container">
          <select
            name="selectedcourse"
            id="selectedcourse"
            className="w-100  py-3 px-2 rounded"
            onChange={(e) => {
              handleCourseChange(e);
            }}
            required
          >
            <option value="" defaultChecked>
              Select a Course
            </option>
            {Array.isArray(courses) && courses.length !== 0
              ? courses.map((course) => {
                  return (
                    <option value={course.firebaseId}>
                      {course.courseName}({course.courseId})
                    </option>
                  );
                })
              : ""}
          </select>
          <div className="w-100 d-flex mt-2 justify-content-center ">
            <SaveButton
              color="secondary"
              type="submit"
              loading={isGenerating}
              loadingPosition="start"
              startIcon={<AssessmentIcon />}
              variant="contained"
              className="w-100"
            >
              <span>Report</span>
            </SaveButton>
          </div>
        </div>
      </form>

      {/* Displaying the data */}
      {courseFinanceDetail.completed ? (
        courseFinanceDetail.noOfStudents !== 0 ? (
          // Displaying the report
          <div className="w-100 mt-2 ">
            <div className="course-info container">
              <div className="row">
                <div className="d-flex flex-column col">
                  <TextField
                    id="standard-basic"
                    label="ID"
                    variant="standard"
                    value={courseFinanceDetail.courseId}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>
                <div className="d-flex flex-column col">
                  <TextField
                    id="standard-basic"
                    label="Name"
                    variant="standard"
                    value={courseFinanceDetail.courseName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>
              </div>

              <div className="row">
                <div className="d-flex flex-column col">
                  <TextField
                    id="standard-basic"
                    label="Duration"
                    variant="standard"
                    value={`${courseFinanceDetail.courseDuration} Months`}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>
                <div className="d-flex flex-column col">
                  <TextField
                    id="standard-basic"
                    label="Remaining(Month&Days)"
                    variant="standard"
                    value={`${courseFinanceDetail.remainingMonths} Months ${courseFinanceDetail.remainingDays} Days`}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="student-fee-chart mx-auto">
              <Pie data={studentFeePieChart} />
            </div>

            <div className="panels  mt-3 flex-wrap mx-auto container pe-4">
              {/* Panels showing the data */}
              {/* Total Course Fees */}
              <div className="panel border totalfees  d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
                <h4 className="text-dark text">Total Course Fees</h4>
                <h4>{courseFinanceDetail.totalFees}PKR</h4>
              </div>
              {/* Total Fee Paid Percentage */}
              <div className="panel border totalfees  d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
                <h4 className="text-dark text">Total Fee Paid</h4>
                <h4>{courseFinanceDetail.feePaidPercentage}%</h4>
              </div>

              {/* Total Fee Remaining Percentage */}
              <div className="panel border totalfees  d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
                <h4 className="text-dark text">Total Fee Remaining</h4>
                <h4>{courseFinanceDetail.feeRemainingPercentage}%</h4>
              </div>

              <div className="panel border totalfees  d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
                <h4 className="text-dark text">Fee Defaulters</h4>
                <h4>{courseFinanceDetail.numDefaulters}</h4>
              </div>
              <div className="panel border totalfees  d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
                <h4 className="text-dark text">Students Enrolled</h4>
                <h4>{courseFinanceDetail.noOfStudents}</h4>
              </div>
            </div>

            {/* Fee Defaulters Pagination */}
            <div className="container">
           {(courseFinanceDetail.defaultersArr&&courseFinanceDetail.defaultersArr.length!==0)? <FeePagination data={courseFinanceDetail.defaultersArr} pageSize={10} isSuperAdmin={true} isAdmin={false} isStaff={false}/>:""}
            </div>
          </div>
        ) : (
          "No Finance Report"
        )
      ) : (
        ""
      )}
    </div>
  );
};

export default CourseFinancePage;
