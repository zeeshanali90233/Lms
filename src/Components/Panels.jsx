import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import "../Css/Panels.css";
import Course from "../Assets/Logos/Course.png";
import FeesICON from "../Assets/Logos/FeesICON.png";
import DuesICON from "../Assets/Logos/DuesICON.png";
import AttendanceICON from "../Assets/Logos/AttendanceICON.png";
import AdminICON from "../Assets/Logos/AdminICON.png";
import SalaryPanelICON from "../Assets/Logos/SalaryPanelICON.png";
import FinancePanelICON from "../Assets/Logos/FinancePanelICON.png";
import { adminUser } from "../Pages/AdminDashboard";

const Panels = ({
  showCoursePanel,
  showFeePanel,
  showDuesPanel,
  showAttendencePanel,
  showAdminPanel,
  showSalaryPanel,
  showFinancePanel,
  isAdmin,
}) => {
  // For admin and for staff
  const user = useContext(adminUser);
  return (
    <div className="panels w-100 mt-3 flex-wrap mx-2 ps-3 justify-content-evenly d-flex ">
      {/* Course Panel */}
      {showCoursePanel ? (
        <NavLink className="text-decoration-none text-white button border" to="courses">
          <span className="panel button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
            <div className="icon">
              <img src={Course} alt="" width={40} />
            </div>
            Courses
            </span>
        
        </NavLink>
      ) : (
        ""
      )}

      {/* Fee Panel */}
      {(showFeePanel) ? (
        <NavLink
          className="text-decoration-none text-white button border panel"
          to="fees"
        >
          <span className="button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
            <div className="icon ">
              <img src={FeesICON} alt="" width={40} />
            </div>
            Fees
          </span>
        </NavLink>
      ) : (
        ""
      )}

      {/* Dues Panel */}
      {showDuesPanel &&
      (isAdmin ? (user.canmanagesalary === "true" ? true : false) : true) ? (
        <NavLink
          className="text-decoration-none text-white button border panel"
          to="dues"
        >
         <span className="button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
              <div className="icon">
                <img src={DuesICON} alt="" width={40} />
              </div>
              Dues
            </span>
        </NavLink>
      ) : (
        ""
      )}
      {/* Salary Panel */}
      {showSalaryPanel ? (
        <NavLink className="text-decoration-none text-white button border panel" to="mysalary">
           <span className="button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
           <div className="icon">
              <img src={SalaryPanelICON} alt="" width={40} />
            </div>
            My Salary
          </span>
        </NavLink>
      ) : (
        ""
      )}

      {/* Attendence Panel */}
      {showAttendencePanel ? (
        <NavLink className="text-decoration-none text-white button border panel" to="attendence">
          <span className="button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
          <div className="icon">
              <img src={AttendanceICON} alt="" width={40} />
            </div>
            Attendence
          </span>
          
        </NavLink>
      ) : (
        ""
      )}
      {/* Finance Panel */}
      {showFinancePanel ? (
        <NavLink className="text-decoration-none text-white button border panel" to="coursefinance">
          <span className="button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
          <div className="icon">
              <img src={FinancePanelICON} alt="" width={40} />
            </div>
            Finance
          </span>
          
        </NavLink>
      ) : (
        ""
      )}


      {/* Admin Panel */}
      {showAdminPanel ? (
        <NavLink className="text-decoration-none text-white button border panel" to="admin">
          <span className="button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
          <div className="icon">
              <img src={AdminICON} alt="" width={40} />
            </div>
            Admin
          </span>
      
        </NavLink>
      ) : (
        ""
      )}
    </div>
  );
};

export default Panels;
