import React, { useState, useEffect } from "react";
import "../Css/Panels.css";
import { db } from "../Firebase/config";

const InformationPanels = ({
  showTotalFeesPanel,
  showTotalStudentsPanel,
  showTotalSalaryPanel,
  showTotalEmployeesPanel,
  showTotalProfitPanel,
}) => {
  const [totalFees, setTotalFees] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalEmployees, setTotalEmployee] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  useEffect(() => {
    // Fetching the no of students and fees
    const fetchTotalStudentsAndFees = async () => {
      await db.collection("students").onSnapshot((snapshot) => {
        let totalFeesFirebase = 0;
        let totalStudentsFirebase = 0;
        snapshot.forEach((doc) => {
          totalFeesFirebase += Number(doc.data().totalfees);
          totalStudentsFirebase += 1;
        });
        setTotalStudents(totalStudentsFirebase);
        setTotalFees(totalFeesFirebase);
      });
    };

    // Fetch Total number of employees and salary
    const fetchTotalEmployeesAndSalary = async () => {
      let totalEmployeesFirebase = 0;
      let totalSalaryFirebase = 0;
      // Admin
      await db.collection("admin").onSnapshot(async (snapshot) => {
        snapshot.forEach((doc) => {
          totalSalaryFirebase += Number(doc.data().initsalary);
          totalEmployeesFirebase += 1;
        });
        // Updating
        setTotalSalary(totalSalaryFirebase);
        setTotalEmployee(totalEmployeesFirebase);
      });
      // Staff
      await db.collection("staff").onSnapshot(async (snapshot) => {
        snapshot.forEach((doc) => {
          totalSalaryFirebase += Number(doc.data().initsalary);
          totalEmployeesFirebase += 1;
        });
        // Updating
        setTotalSalary(totalSalaryFirebase);
        setTotalEmployee(totalEmployeesFirebase);
      });
      // Teachers
      await db.collection("teachers").onSnapshot(async (snapshot) => {
        snapshot.forEach((doc) => {
          totalSalaryFirebase += Number(doc.data().initsalary);
          totalEmployeesFirebase += 1;
        });
        // Updating
        setTotalSalary(totalSalaryFirebase);
        setTotalEmployee(totalEmployeesFirebase);
      });
    };

    const fetchProfit = () => {
      setTotalProfit((totalFees - totalSalary).toLocaleString());
    };

    if (showTotalStudentsPanel || showTotalFeesPanel) {
      fetchTotalStudentsAndFees();
    }
    if (showTotalEmployeesPanel || showTotalSalaryPanel) {
      fetchTotalEmployeesAndSalary();
    }
    if (showTotalProfitPanel) {
      fetchProfit();
    }
  }, []);

  return (
    <div className="panels  mt-3 flex-wrap mx-2 pe-4">
      {/* Total Fees */}
      {showTotalFeesPanel ? (
        <div className="panel border totalfees  d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
          <h4 className="text-dark text">Total Fees</h4>
          <h4>{totalFees.toLocaleString()}PKR</h4>
        </div>
      ) : (
        ""
      )}
      {/*Total Students  */}
      {showTotalStudentsPanel ? (
        <div className="panel border totalstudents d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
          <h4 className="text-dark text">Total Students</h4>
          <h4>{totalStudents.toLocaleString()}</h4>
        </div>
      ) : (
        ""
      )}

      {/* Total Salary */}
      {showTotalSalaryPanel ? (
        <div className="panel border totalsalary d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
          <h4 className="text-dark text">Total Salary</h4>
          <h4>{totalSalary.toLocaleString()}PKR</h4>
        </div>
      ) : (
        ""
      )}

      {/* Total Employees */}
      {showTotalEmployeesPanel ? (
        <div className="panel border totalemployees d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
          <h4 className="text-dark text">Total Employees</h4>
          <h4>{totalEmployees.toLocaleString()}</h4>
        </div>
      ) : (
        ""
      )}
      {/* Total Profit */}
      {showTotalProfitPanel ? (
        <div className="panel border totalprofit d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center">
          <h4 className="text-dark text">Profit/Loss</h4>
          <h4>{totalFees - totalSalary}PKR</h4>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default InformationPanels;
