import React from "react";
import "../Css/Home.css";
import { NavLink } from "react-router-dom";
// importing the logos
import orgLogo from "../Assets/Logos/organization_Logo.png";
import playstore from "../Assets/Logos/playstore_Logo.png";
import youtube from "../Assets/Logos/youtube_Logo.jpg";
import contactUs from "../Assets/Logos/contactus_Logo.png";
import organization from "../Organization/details";

const Home = () => {
  return (
    <div className="home-container">
      {/* header */}
      <div className="header text-center py-5 bg-dark">
        <img src={orgLogo} alt="#" width={160} />
        <h1 className="title pt-2 text-white">{organization.organizationDetails.name}</h1>
        <div className="sub-title text-white">E-Learning System</div>
      </div>

      {/* Home Page Login Panel(Like Admin Login , Student Login)  */}
      <div className="login-panel container mt-3">
        <div className="row pb-1">
          <div className="panel super-admin text-center py-2 rounded col-6 border">
            <NavLink to="/sadmin/login" className="text-decoration-none">
              <h2>Super Admin Login</h2>
            </NavLink>
          </div>
          <div className="panel admin text-center  py-2 rounded col-6 ml-5 border">
            <NavLink to="/admin/login" className="text-decoration-none">
              <h2>Admin Login</h2>
            </NavLink>
          </div>
        </div>
        <div className="row pb-1">
        <div className="panel teacher-admin text-center  py-2 rounded col-6 border">
          <NavLink to="/teacher/login" className="text-decoration-none">
            <h2>Teacher Login</h2>
          </NavLink>
        </div>
        <div className="panel staff text-center  py-2 rounded col-6 border">
          <NavLink to="/staff/login" className="text-decoration-none">
            <h2 >Staff Login</h2>
          </NavLink>
        </div>
        </div>
        <div className="panel student text-center  py-2 rounded row col-13 border">
          <NavLink to="student/login" className="text-decoration-none">
            <h2>Student Login</h2>
          </NavLink>
        </div>
      </div>

      {/* footer */}
      <div className="footer text-center pb-0 mb-0 mt-5">
        <div className="d-lg-flex d-md-flex justify-content-center">
          <div className="playstore-app">
            <img src={playstore} alt="#" width={150} />
          </div>
          <div className="youtube">
            <img src={youtube} alt="#" width={150} />
          </div>
          <div className="contact-us">
            <img src={contactUs} alt="#" width={150} />
          </div>
        </div>
        {/* footer text */}
        <div className="text">
          <p>
            &copy; Copyright 2020{" "}
            <a href={`https://${organization.organizationDetails.website}`}>
              AL-MUNIR HIGH SCHOOL
            </a>{" "}
            Design and Developed by{" "}
            <a href={`https://${organization.P2PClouds.website}`}>P2P CLOUDS</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
