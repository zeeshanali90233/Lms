import React from "react";
import Chart from "chart.js/auto";
import { Pie, Line } from "react-chartjs-2";
import "../Css/AdminCharts.css";
import { useEffect, useState } from "react";
import { db } from "../Firebase/config";

const AdminCharts = () => {
  const [studentFeeData, setStudentFeeData] = useState({
    feepaid: 0,
    feenotpaid: 0,
  });
  const [employeeSalaryData, setEmployeeSalaryData] = useState({
    salarypaid: 0,
    salarynotpaid: 0,
  });
  const [studentEnrollDate, setStudentEnrollDate] = useState([]);

  useEffect(() => {
    const fetchStudentFee = async () => {
      db.collection("fees").onSnapshot((snapshot) => {
        // Separating the fee amount paid and not paid
        let feepaid=0;
        let feenotpaid=0;
        snapshot.forEach((fee) => {
          feepaid+=  parseFloat(fee.data().feepaid,10);
          feenotpaid+=parseInt(fee.data().totalfees)-parseFloat(fee.data().feepaid);
        });
        setStudentFeeData({feepaid:feepaid, feenotpaid:feenotpaid})
      });
    };
    const fetchEmployeeSalaries = async () => {
      db.collection("salaries").onSnapshot((snapshot) => {
        // Separating the salary paid and not paid
        let salarypaid = 0;
        let salarynotpaid = 0;
        snapshot.forEach((salary) => {
          salary.data().paid
            ? (salarypaid = salarypaid + parseFloat(salary.data().salary))
            : (salarynotpaid =
                salarynotpaid + parseFloat(salary.data().salary));
        });
        setEmployeeSalaryData({
          salarypaid: salarypaid,
          salarynotpaid: salarynotpaid,
        });
      });
    };

    const fetchStudentEnroll = async () => {
      db.collection("students").onSnapshot((snapshot) => {
        const currentYear = new Date().getFullYear(); // get the current year and modulo 100 to get the last two digits

        let enrollPerMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        snapshot.forEach((doc) => {
          const dateString = doc.data().enrolleddate;
          const date = new Date(dateString);
          const month = date.getMonth(); // returns a number between 0 and 11, so we add 1 to get the month number
          const year = date.getFullYear(); // get the year as a 4-digit string and take the last 2 digits
          if (year === currentYear) {
            enrollPerMonth[month] += 1;
          }
        });
        setStudentEnrollDate(enrollPerMonth);
      });
    };
    fetchStudentFee();
    fetchEmployeeSalaries();
    fetchStudentEnroll();
  }, []);
  const studentFeeLabel = ["Fee Paid", "Fee Not Paid"];
  const studentFeePieChart = {
    labels: studentFeeLabel,
    datasets: [
      {
        label: "Students Fee",
        backgroundColor: ["#00c3ff", "#f7bf41"],
        borderColor: "#393c41",
        data: [studentFeeData.feepaid, studentFeeData.feenotpaid],
      },
    ],
  };

  const staffSalaryLabel = ["Salary Paid", "Salary Not Paid"];
  const staffSalaryPieChart = {
    labels: staffSalaryLabel,
    datasets: [
      {
        label: "Staff Salary",
        backgroundColor: ["#00c3ff", "#393c41"],
        borderColor: "#393c41",
        data: [employeeSalaryData.salarypaid, employeeSalaryData.salarynotpaid],
      },
    ],
  };

  const studentEnrolledChartLabel = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const studentEnrolledLineChart = {
    labels: studentEnrolledChartLabel,
    datasets: [
      {
        label: `Student Enrolled in ${new Date().getFullYear()}`,
        backgroundColor: "#f7bf41",
        borderColor: "#00233a",
        data: studentEnrollDate,
      },
    ],
  };
  return (
    <div className="charts mx-2 my-2">
      <div className="d-flex flex-wrap ">
        <div className="student-fee-chart ">
          <Pie data={studentFeePieChart} />
        </div>
        <div className="student-fee-chart ms-auto">
          <Pie data={staffSalaryPieChart} />
        </div>
      </div>
      <br />
      <br />
      <div className="w-100 d-md-flex flex-wrap justify-content-center">
        <div className=" student-enrolled-chart">
          <Line data={studentEnrolledLineChart} />
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
