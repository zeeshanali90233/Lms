import React, { useEffect } from "react";
import emptyProfile from "../Assets/Images/no_profile_picture.jpeg";
import { FiLogOut } from "react-icons/fi";
import { AiOutlineDashboard, AiOutlineIdcard } from "react-icons/ai";
import { BsPerson } from "react-icons/bs";
import { CiMoneyCheck1 } from "react-icons/ci";
import { AiOutlineUserAdd } from "react-icons/ai";
import { SiStaffbase } from "react-icons/si";
import { MdOutlineAssignment } from "react-icons/md";
import organization from "../Organization/details";
import "../Css/SAdminDashboard.css";
import { NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createContext } from "react";
import { db } from "../Firebase/config";
import Avatar from "@mui/material/Avatar";
import firebase from "firebase/compat/app";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { GiBookCover } from 'react-icons/gi';
import { BiReceipt } from "react-icons/bi";

// Exporting the context (Search,User)
export const searchKeywordAdmin = createContext("");
export const adminUser = createContext("");

const AdminDashboard = () => {
  const {state} = useLocation();
  const [user, setUser] = useState(state.user ||{});
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // Get the currently signed-in user
    const getUser = async () => {
      try {
        const user =  firebase.auth().currentUser;
       
        if (!user) {
          firebase.auth().signOut();
          navigate("/admin/login");
        }
      } catch (error) {
        console.log(error);
      }

      // Getting the user id from local storage
      const userFirebaseId = localStorage.getItem("adminUser");
      if(userFirebaseId){
        db.collection("admin")
        .doc(userFirebaseId)
        .onSnapshot((snapshot) => {
          setUser({...snapshot.data(),firebaseId:snapshot.id});
        });
      }
    };

    // const interval=setInterval(()=>{
    //   getUser();
    // },15*60*1000) //Converting 15mins to milliseconds

    // Running it once within 1s
    setTimeout(()=>{
      getUser();
    },1000);

    // return ()=>{clearInterval(interval)}
  }, []);
  

  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then((res) => {
        navigate("/");
      });
  };

  // Checks whether the object is empty or not
  const isObjectEmpty = (objectName) => {
    return JSON.stringify(objectName) === "{}";
  };

  return (
    // Dashboard
    <div className="admin-dashboard ">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-dark">
        <div className="container-fluid">
          <ul className="navbar-nav ">
            <li class="nav-item dropdown px-lg-5 px-sm-2 ms-1">
              <Button
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
              >
                <Avatar
                  alt="User"
                  src={(user && user.adminphoto) ? user.adminphoto.URL : emptyProfile}
                  sx={{ width: 56, height: 56 }}
                />
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={handleClose}>
                  {user ? user.firstname + " " + user.lastname : ""}
                </MenuItem>
                <MenuItem onClick={handleClose} className="text-uppercase">
                  {user && user.designation!==undefined  ? user.designation : ""}
                </MenuItem>
                <MenuItem onClick={handleClose} className="text-uppercase">
                  {user && user.aid!==undefined  ? user.aid: ""}
                </MenuItem>
                <NavLink to="editprofile" className="text-decoration-none"><MenuItem onClick={handleClose} className="border rounded ">Edit Profile</MenuItem></NavLink>
              </Menu>

              {!isObjectEmpty(user) ? <></> : ""}
            </li>
          </ul>
          <button
            className="navbar-toggler "
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon "></span>
          </button>
          <div
            className="  collapse navbar-collapse"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
            {/* Search bar */}
            <abbr title="Search" className="text-decoration-none">
              <form class="d-flex  search-bar ">
                <input
                  class="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  // Handling the search change
                  onChange={(e) => {
                     // Debouncing is used here
                     setTimeout(setSearch(e.target.value), 500);
                  }}
                ></input>
              </form>
            </abbr>
            {/* log out */}
            <form className=" d-lg-flex ms-1">
              <abbr title="Log Out" className="text-decoration-none">
                <NavLink to="/admin/login" className="text-decoration-none">
                  <button
                    className="btn-logout btn btn-outline-success text-white mx-3 ms-auto w-100"
                    type="submit"
                    onClick={() => {
                      signOut();
                    }}
                  >
                    {<FiLogOut />}
                  </button>
                </NavLink>
              </abbr>
            </form>
          </div>
        </div>
      </nav>

      {/* sidebar */}
      <div className="admin-sidebar position-absolute bg-dark ">
        {/* SideBar Main Menu */}
        <section className="w-100">
          <div className="heading text-white pt-3 ps-2">Main Menu</div>
          <div className="options pt-2 ">
            <NavLink
              className="text-decoration-none text-white"
              to={
                location.pathname !== "/admin/dashboard/"
                  ? `/admin/dashboard`
                  : ""
              }
            >
              <abbr title="Dashboard" className="text-decoration-none">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2 ">
                    <AiOutlineDashboard color="white" size={25} />
                  </div>
                  <div className="text text-white">Dashboard</div>
                </div>
              </abbr>
            </NavLink>

            <NavLink
              className="text-decoration-none text-white"
              to="attendance"
            >
              <abbr title="Attendance" className="text-decoration-none">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    <AiOutlineIdcard color="white" size={25} />
                  </div>
                  <div className="text text-white">Attendance</div>
                </div>
              </abbr>
            </NavLink>

            <NavLink className="text-decoration-none text-white" to="admission">
              <abbr title="Admission" className="text-decoration-none">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    <AiOutlineUserAdd color="white" size={25} />
                  </div>
                  <div className="text text-white">Admission</div>
                </div>
              </abbr>
            </NavLink>

            <NavLink className="text-decoration-none text-white" to="role">
              <abbr title="role" className="text-decoration-none">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    {" "}
                    <MdOutlineAssignment color="white" size={25} />
                  </div>
                  <div className="text text-white">Role</div>
                </div>
              </abbr>
            </NavLink>

            <NavLink className="text-decoration-none text-white" to="staff">
              <abbr title="Staff" className="text-decoration-none">
                {" "}
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    {" "}
                    <SiStaffbase color="white" size={25} />
                  </div>
                  <div className="text text-white">Staff</div>
                </div>
              </abbr>
            </NavLink>

            <NavLink className="text-decoration-none text-white" to="students">
              <abbr title="Student" className="text-decoration-none">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    {" "}
                    <BsPerson color="white" size={25} />
                  </div>
                  <div className="text text-white">Students</div>
                </div>
              </abbr>
            </NavLink>

            <NavLink className="text-decoration-none text-white" to="courses">
              <abbr title="Account" className="text-decoration-none">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    {" "}
                    <GiBookCover color="white" size={25} />
                  </div>
                  <div className="text text-white">Courses</div>
                </div>
              </abbr>
            </NavLink>
            {/* Dues */}
            {(user.canmanagesalary==="true")?<NavLink className="text-decoration-none text-white" to="dues">
              <abbr title="Dues" className="text-decoration-none">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    {" "}
                    <CiMoneyCheck1 color="white" size={25} />
                  </div>
                  <div className="text text-white">Dues</div>
                </div>
              </abbr>
            </NavLink>:""}
            {/* Fees */}
            <NavLink className="text-decoration-none text-white" to="fees">
              <abbr title="Fees" className="text-decoration-none ">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-2">
                    <CiMoneyCheck1 color="white" size={25} />
                  </div>
                  <div className="text text-white">Fees</div>
                </div>
              </abbr>
            </NavLink>
            <NavLink className="text-decoration-none text-white" to="showalltrans">
              <abbr title="Transactions" className="text-decoration-none ">
                <div className="option option-1 d-flex w-100 ps-3 py-3">
                  <div className="icon pe-1">
                  <BiReceipt color="white" size={25} />
                  </div>
                  <div className="text text-white">Transactions</div>
                </div>
              </abbr>
            </NavLink>
          </div>
        </section>
      </div>

      {/* footer */}
      <div className="footer text-center  position-fixed top-100 start-50 translate-middle w-100 text-white">
        {/* footer text */}
        <div className="text pb-2">
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

      {/* main content */}
      <section className="main-content text-secondary ">
        {/* <AdminRouting/> */}
        <searchKeywordAdmin.Provider value={search}>
          <adminUser.Provider value={user}>
            <Outlet />
          </adminUser.Provider>
        </searchKeywordAdmin.Provider>
      </section>
    </div>
  );
};

export default AdminDashboard;
