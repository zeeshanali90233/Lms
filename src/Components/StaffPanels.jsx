import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import "../Css/Panels.css";
import Course from "../Assets/Logos/Course.png";
import FeesICON from "../Assets/Logos/FeesICON.png";
import SalaryPanelICON from "../Assets/Logos/SalaryPanelICON.png";
import { staffUser } from "../Pages/StaffDashboard";
const StaffPanels = ({
}) => {
  // For admin and for staff
  const user = useContext(staffUser);
  return (
    <div className="panels w-100 mt-3 flex-wrap mx-2 ps-3 justify-content-evenly d-flex ">
      {/* Course Panel */}
      {(user && user.courseauthority && user.courseauthority.review) ? (
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
      {(user && user.feesauthority && user.feesauthority.review) ? (
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


      {/* Salary Panel */}
      <NavLink className="text-decoration-none text-white button border panel" to="mysalary">
           <span className="button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
           <div className="icon">
              <img src={SalaryPanelICON} alt="" width={40} />
            </div>
            My Salary
          </span>
        </NavLink>


      

    
    </div>
  );
};

export default StaffPanels;
