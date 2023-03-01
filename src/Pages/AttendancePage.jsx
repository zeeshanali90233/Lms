import React, { useState, useEffect } from "react";
import AdminICON from "../Assets/Logos/AdminICON.png";
import StaffICON from "../Assets/Logos/StaffICON.png";
import SearchAttendanceICON from "../Assets/Logos/SearchAttendanceICON.png";
import { styled } from "@mui/system";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import Alert from "@mui/material/Alert";
import { db } from "../Firebase/config";
import "../Css/AttendancePage.css";
import firebase from "firebase/compat/app";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import EmployeeAttendanceICON from "../Assets/Logos/EmployeeAttendanceICON.png";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
// MUI MODAL COMPONENT
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import TextField from "@mui/material/TextField";
// Moment JS for date
import moment from "moment";
import EmployeeAttendancePagination from "../Components/EmployeeAttendancePagination";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SuccessAlert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

// Modal MUI Style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "1px solid #0086c9",
  borderRadius: "23px",
  boxShadow: 24,
  p: 4,
};

const AttendancePage = ({ showAdminAttendance, showStaffAttendance }) => {
  const [showAdminAttendanceBox, setShowAdminAttendanceBox] = useState(false);
  const [showAdminCreateAttendanceModal, setShowAdminCreateAttendanceModal] =
    useState(false);
  const [showSearchAttendanceModal, setShowSearchAttendanceModal] =
    useState(false);
  const [showStaffAttendanceBox, setStaffAttendanceBox] = useState(false);
  const [showStaffCreateAttendanceModal, setShowStaffCreateAttendanceModal] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [adminData, setAdminData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [attendanceData, setAttendanceData] = useState("");
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createAdminAttendanceForm, setCreateAdminAttendanceForm] = useState({
    attendancedate: moment(new Date()).format("YYYY-MM-DD"),
  });
  const [createStaffAttendanceForm, setCreateStaffAttendanceForm] = useState({
    attendancedate: moment(new Date()).format("YYYY-MM-DD"),
  });
  const[searchEmplName,setSearchEmplName]=useState("");

  const [searchAttendanceResult, setSearchAttendanceResult] = useState({
    month: moment().month(),
    year: moment().year(),
    adminData:[],
    staffData:[],
  });

  // Success Alert
  const [alertState, setAlertState] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "right",
  });
  const { vertical, horizontal, open } = alertState;
  // For Success Toast
  const handleClick = () => {
    setAlertState({ ...alertState, open: true });
  };
  const handleClose = () => {
    setAlertState({ ...alertState, open: false });
  };

  // Reseting Attendance Box Related Things
  const handleCreateAttendanceBoxClose = () => {
    setShowAdminCreateAttendanceModal(false);
    setShowStaffCreateAttendanceModal(false);
    setShowSearchAttendanceModal(false);
    setSearchAttendanceResult({
      month: moment().month(),
      year: moment().year(),
      name:"",
    });
    setShowSearchResult(false);
  };

  // Admin &  Staff Data
  useEffect(() => {
    const fetchAdminData = async () => {
      const adminDataArray = [];
      await db.collection("admin").onSnapshot((snapshot) => {
        snapshot.forEach((admin) => {
          adminDataArray.push({ ...admin.data(), firebaseId: admin.id });
        });
        setAdminData(adminDataArray);
        let updatedSearch=searchAttendanceResult;
        updatedSearch.adminData=adminDataArray;
        setSearchAttendanceResult(updatedSearch);
        
      });
    };

    const fetchStaffData = async () => {
      const staffDataArray = [];
      await db.collection("staff").onSnapshot((snapshot) => {
        snapshot.forEach((staff) => {
          staffDataArray.push({ ...staff.data(), firebaseId: staff.id });
        });
        setStaffData(staffDataArray);
        let updatedSearch=searchAttendanceResult;
        updatedSearch.staffData=staffDataArray;
        setSearchAttendanceResult(updatedSearch);
      });
    };

    const fetchAttendance = async () => {
      const snapshot = await db.collection("attendance").get();
      setAttendanceData({
        ...snapshot.docs[0].data(),
        firebaseId: snapshot.docs[0].id,
      });
    };

    fetchAdminData();
    fetchStaffData();
    fetchAttendance();
  }, []);



  const handleAdminChange = (e) => {
    e.preventDefault();
    setCreateAdminAttendanceForm({
      ...createAdminAttendanceForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleStaffChange = (e) => {
    e.preventDefault();
    setCreateStaffAttendanceForm({
      ...createStaffAttendanceForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchAttendanceChange = (e) => {
    e.preventDefault();
    setSearchAttendanceResult({
      ...searchAttendanceResult,
      [e.target.name]: e.target.value,
    });
    setErrorMessage("");
  };

  const getAttendanceStats = (attendance, id, month, year) => {
    let totalDays = 0;
    let totalPresent = 0;
    attendance
      .filter((record) => {
        // Convert the date string to a Date object
        const date = new Date(record.date);
        // Check if the record's date matches the given month and year
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .forEach((record) => {
        // Check if the attendance record contains the ID
        if (record.attendance[id] !== undefined) {
          totalDays++;
          // Check if the staff was present on the given date
          if (record.attendance[id] === true) {
            totalPresent++;
          }
        }
      });

      

    return {
      totalDays,
      totalPresent,
      percentage: (totalPresent / totalDays) * 100,
    };
  };

  const handleSearchAttendanceSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    if (searchAttendanceResult.id.match(/^a[0-9a-zA-Z]{4}$/)) {
      setSearchAttendanceResult({
        ...searchAttendanceResult,
        result: getAttendanceStats(
          attendanceData.adminattendance,
          searchAttendanceResult.id,
          searchAttendanceResult.month,
          searchAttendanceResult.year
        ),
      });
    let employeeName="";
    let admin =searchAttendanceResult.adminData.filter((admin)=>{
      return admin.aid===searchAttendanceResult.id;
    })[0];

    employeeName=admin.firstname+" "+admin.lastname;

    setSearchEmplName(employeeName)
      

      setIsSaving(false);
      setShowSearchResult(true);
    } else if (searchAttendanceResult.id.match(/^e[0-9a-zA-Z]{4}$/)) {
      setSearchAttendanceResult({
        ...searchAttendanceResult,
        result: getAttendanceStats(
          attendanceData.staffattendance,
          searchAttendanceResult.id,
          searchAttendanceResult.month,
          searchAttendanceResult.year
        ),
      });
      let employeeName="";
      let staff =searchAttendanceResult.staffData.filter((staff)=>{
        return staff.staffid===searchAttendanceResult.id;
      })[0];
      employeeName=staff.firstname+" "+staff.lastname;
  
      setSearchEmplName(employeeName)

      setIsSaving(false);
      setShowSearchResult(true);
    } else {
      setErrorMessage("Incorrect Admin/Staff ID");
    }
  };
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let attendanceObject = {
      date: moment(createAdminAttendanceForm.attendancedate).format(
        "DD-MMM-YY"
      ),
      attendance: {},
    };

    for (const admin of adminData) {
      attendanceObject.attendance = {
        ...attendanceObject.attendance,
        [admin.aid]: true,
      };
    }
    // Amending the attendance object
    await db
      .collection("attendance")
      .doc(attendanceData.firebaseId)
      .update({
        adminattendance:
          firebase.firestore.FieldValue.arrayUnion(attendanceObject),
      });
    handleClick();
    setIsSaving(false);
    setCreateAdminAttendanceForm({
      date: moment(new Date()).format("YYYY-MM-DD"),
    });
    handleCreateAttendanceBoxClose();
  };
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let attendanceObject = {
      date: moment(createStaffAttendanceForm.attendancedate).format(
        "DD-MMM-YY"
      ),
      attendance: {},
    };

    for (const staff of staffData) {
      attendanceObject.attendance = {
        ...attendanceObject.attendance,
        [staff.staffid]: true,
      };
    }
    // Amending the attendance object
    await db
      .collection("attendance")
      .doc(attendanceData.firebaseId)
      .update({
        staffattendance:
          firebase.firestore.FieldValue.arrayUnion(attendanceObject),
      });
    setIsSaving(false);
    setCreateStaffAttendanceForm({
      date: moment(new Date()).format("YYYY-MM-DD"),
    });

    handleClick();
    handleCreateAttendanceBoxClose();
  };

  return (
    <div className="w-100">
      <div className="titlebar w-100 bg-dark d-flex text-white ps-2 flex-sm-wrap text-center justify-content-center">
        Attendance
      </div>

      {/* Success Alert */}
      {/* Success Message Toaster */}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        autoHideDuration={1500}
        key={vertical + horizontal}
      >
        <SuccessAlert
          onClose={handleClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Successfully Saved
        </SuccessAlert>
      </Snackbar>
      <div className="d-md-flex w-100  mt-2">
        {/* Admin Attendance Panel */}
        {showAdminAttendance ? (
          <div
            className=" w-100 admin panel button "
            onClick={() => {
              setShowAdminAttendanceBox(!showAdminAttendanceBox);
              setStaffAttendanceBox(false);
            }}
          >
            <span className="panel button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
              <div className="icon">
                <img src={AdminICON} alt="" width={40} />
              </div>
              Admin
            </span>
          </div>
        ) : (
          ""
        )}

        {/* Staff Attendance Panel */}
        {showStaffAttendance ? (
          <div
            className=" w-100  admin staff-attendancebtn panel button "
            onClick={(e) => {
              setStaffAttendanceBox(!showStaffAttendanceBox);
              setShowAdminAttendanceBox(false);
            }}
          >
            <span className="panel button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
              <div className="icon">
                <img src={StaffICON} alt="" width={40} />
              </div>
              Staff
            </span>
          </div>
        ) : (
          ""
        )}
      </div>

      {showAdminAttendanceBox === false && showStaffAttendanceBox === false ? (
        <div
          className="panel button mt-2 w-100"
          onClick={() => {
            setShowSearchAttendanceModal(!showSearchAttendanceModal);
          }}
        >
          <span className=" button__text text-dark text fee d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center">
            <div className="icon">
              <img src={SearchAttendanceICON} alt="" width={40} />
            </div>
            Search Attendance
          </span>
        </div>
      ) : (
        ""
      )}

      {/* Search  Attendance Panel */}
      {showSearchAttendanceModal ? (
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={showSearchAttendanceModal}
          onClose={handleCreateAttendanceBoxClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={showSearchAttendanceModal}>
            <Box sx={style}>
              <div className="w-100 container mt-1">
                <div className="title bg-dark  text-center text-white w-100 rounded py-1 ">
                  <h4 className="text-white">Search By ID</h4>
                </div>
                {showSearchResult ? (
                  // Search Result
                  <div>
                    <div className="row">
                      <div className="col d-flex flex-column">
                        <TextField
                          id="standard-basic"
                          label="Month"
                          variant="standard"
                          value={moment(
                            searchAttendanceResult.month,
                            "M"
                          ).format("MMMM")}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                      <div className="col d-flex flex-column">
                        <TextField
                          id="standard-basic"
                          label="Year"
                          variant="standard"
                          value={searchAttendanceResult.year}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col d-flex flex-column">
                        <TextField
                          id="standard-basic"
                          label="ID"
                          variant="standard"
                          value={searchAttendanceResult.id}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>

                      <div className="col d-flex flex-column">
                        <TextField
                          id="standard-basic"
                          label="Name"
                          variant="standard"
                          value={searchEmplName}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col d-flex flex-column">
                        <TextField
                          id="standard-basic"
                          label="Total Days"
                          variant="standard"
                          value={searchAttendanceResult.result.totalDays}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                      <div className="col d-flex flex-column">
                        <TextField
                          id="standard-basic"
                          label="Total Presents"
                          variant="standard"
                          value={searchAttendanceResult.result.totalPresent}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col d-flex flex-column">
                        <InputLabel htmlFor="outlined-adornment-amount">
                          Percentage
                        </InputLabel>
                        <OutlinedInput
                          id="outlined-adornment-amount"
                          startAdornment={
                            <InputAdornment position="start">%</InputAdornment>
                          }
                          label="Amount"
                          value={searchAttendanceResult.result.percentage}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      handleSearchAttendanceSubmit(e);
                    }}
                  >
                    {/*Attendance Date */}
                    <div className="row">
                      {/* Name Input */}
                      <div className="d-flex flex-column col">
                        <label htmlFor="id">Name</label>
                        <TextField
                          id="outlined-basic"
                          variant="outlined"
                          name="name"
                          onChange={(e) => {
                            handleSearchAttendanceChange(e);
                          }}
                        />
                      </div>
                      {/* Id */}
                      <div className="d-flex flex-column col">
                        <InputLabel id="demo-simple-select-helper-label">
                          ID *
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-helper-label"
                          id="demo-simple-select-helper"
                          variant="outlined"
                          name="id"
                          onChange={(e) => {
                            handleSearchAttendanceChange(e);
                          }}
                          required
                        >
                          {/* Admin with filtering according to name */}
                          {(searchAttendanceResult && searchAttendanceResult.adminData)?searchAttendanceResult.adminData.filter((admin)=>{let name=admin.firstname+" "+admin.lastname; return name.toLowerCase().includes((searchAttendanceResult.name)?searchAttendanceResult.name.toLowerCase():"");}).map((admin)=>{
                            return(<MenuItem value={`${admin.aid}`}>{admin.aid}</MenuItem>);
                          }):""}
                          {/* Staff with filtering according to name */}
                          {(searchAttendanceResult && searchAttendanceResult.staffData)?searchAttendanceResult.staffData.filter((staff)=>{let name=staff.firstname+" "+staff.lastname; return name.toLowerCase().includes((searchAttendanceResult.name)?searchAttendanceResult.name.toLowerCase():"");}).map((staff)=>{
                            return(<MenuItem value={`${staff.staffid}`}>{staff.staffid}</MenuItem>);
                          }):""}
                        </Select>
                      </div>
                    
                      {errorMessage !== "" ? (
                        <span className="required">{errorMessage}</span>
                      ) : (
                        ""
                      )}

                      
                    </div>

                    <div className="row">
                      <div className="d-flex flex-column col">
                        <InputLabel id="demo-simple-select-helper-label">
                          Month *
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-helper-label"
                          id="demo-simple-select-helper"
                          name="month"
                          value={searchAttendanceResult.month}
                          onChange={(e) => {
                            handleSearchAttendanceChange(e);
                          }}
                          required
                        >
                          <MenuItem value={0}>January</MenuItem>
                          <MenuItem value={1}>February</MenuItem>
                          <MenuItem value={2}>March</MenuItem>
                          <MenuItem value={3}>April</MenuItem>
                          <MenuItem value={4}>May</MenuItem>
                          <MenuItem value={5}>June</MenuItem>
                          <MenuItem value={6}>July</MenuItem>
                          <MenuItem value={7}>August</MenuItem>
                          <MenuItem value={8}>September</MenuItem>
                          <MenuItem value={9}>October</MenuItem>
                          <MenuItem value={10}>November</MenuItem>
                          <MenuItem value={11}>December</MenuItem>
                        </Select>
                      </div>
                      <div className="d-flex flex-column col">
                        <InputLabel id="demo-simple-select-helper-label">
                          Year *
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-helper-label"
                          id="demo-simple-select-helper"
                          name="year"
                          value={searchAttendanceResult.year}
                          onChange={(e) => {
                            handleSearchAttendanceChange(e);
                          }}
                          required
                        >
                          <MenuItem value={2021}>2021</MenuItem>
                          <MenuItem value={2022}>2022</MenuItem>
                          <MenuItem value={2023}>2023</MenuItem>
                          <MenuItem value={2024}>2024</MenuItem>
                          <MenuItem value={2025}>2025</MenuItem>
                          <MenuItem value={2026}>2026</MenuItem>
                          <MenuItem value={2027}>2027</MenuItem>
                          <MenuItem value={2028}>2028</MenuItem>
                          <MenuItem value={2029}>2029</MenuItem>
                          <MenuItem value={2030}>2030</MenuItem>
                          <MenuItem value={2031}>2031</MenuItem>
                          <MenuItem value={2032}>2032</MenuItem>
                        </Select>
                      </div>
                    </div>
                    {/* Save Button */}
                    <div className="d-flex justify-content-center mt-2">
                      <SaveButton
                        color="secondary"
                        type="submit"
                        loading={isSaving}
                        loadingPosition="start"
                        startIcon={<SearchIcon />}
                        variant="contained"
                        className="w-100"
                      >
                        <span>Search</span>
                      </SaveButton>
                    </div>
                  </form>
                )}
              </div>
            </Box>
          </Fade>
        </Modal>
      ) : (
        ""
      )}

      {/* Admin Attendance Box */}
      {showAdminAttendanceBox ? (
        <div className="mt-2">
          {/* Create Lecture Button */}
          <div
            className="panel border attendance mt-1 d-flex py-2 align-items-center rounded justify-content-center user-select-none mx-auto"
            onClick={() => {
              setShowAdminCreateAttendanceModal(
                !showAdminCreateAttendanceModal
              );
            }}
            style={{ width: "250px" }}
          >
            <div className="icon">
              <img src={EmployeeAttendanceICON} alt="" width={40} />
            </div>
            <h5 className="text-dark text ps-1">Create Attendance</h5>
          </div>
          {/* Admin Attendance Box */}
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={showAdminCreateAttendanceModal}
            onClose={handleCreateAttendanceBoxClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={showAdminCreateAttendanceModal}>
              <Box sx={style}>
                <div className="w-100 container mt-1">
                  <div className="title bg-dark  text-center text-white w-100 rounded py-1 ">
                    <h4 className="text-white">Admin Attendance Detail</h4>
                  </div>

                  <form
                    onSubmit={(e) => {
                      handleAdminSubmit(e);
                    }}
                  >
                    {/*Attendance Date */}
                    <div className="d-flex flex-column col">
                      <label htmlFor="attendancedate">Date(MM/DD/YYYY)</label>
                      <TextField
                        type="date"
                        id="outlined-basic"
                        variant="outlined"
                        value={createAdminAttendanceForm.attendancedate}
                        name="attendancedate"
                        onChange={(e) => {
                          handleAdminChange(e);
                        }}
                        required
                      />
                    </div>

                    {/* Save Button */}
                    <div className="d-flex justify-content-center mt-2">
                      <SaveButton
                        color="secondary"
                        type="submit"
                        loading={isSaving}
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        variant="contained"
                        className="w-100"
                      >
                        <span>Create</span>
                      </SaveButton>
                    </div>
                  </form>
                </div>
              </Box>
            </Fade>
          </Modal>

          <div className="container">
            {attendanceData.adminattendance &&
            attendanceData.adminattendance.length !== 0 ? (
              <EmployeeAttendancePagination
                data={adminData}
                attendanceData={attendanceData.adminattendance}
                attendanceFirebaseId={attendanceData.firebaseId}
                isAdminAttendance={true}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}

      {/* Staff Attendance Box */}
      {showStaffAttendanceBox ? (
        <div className="mt-2">
          {/* Create Lecture Button */}
          <div
            className="panel border attendance mt-1 d-flex py-2 align-items-center rounded justify-content-center user-select-none mx-auto"
            onClick={() => {
              setShowStaffCreateAttendanceModal(
                !showStaffCreateAttendanceModal
              );
            }}
            style={{ width: "250px" }}
          >
            <div className="icon">
              <img src={EmployeeAttendanceICON} alt="" width={40} />
            </div>
            <h5 className="text-dark text ps-1">Create Attendance</h5>
          </div>
          {/* Staff Attendance Box */}
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={showStaffCreateAttendanceModal}
            onClose={handleCreateAttendanceBoxClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={showStaffCreateAttendanceModal}>
              <Box sx={style}>
                <div className="w-100 container mt-1">
                  <div className="title bg-dark  text-center text-white w-100 rounded py-1 ">
                    <h4 className="text-white">Staff Attendance Detail</h4>
                  </div>

                  <form
                    onSubmit={(e) => {
                      handleStaffSubmit(e);
                    }}
                  >
                    {/*Attendance Date */}
                    <div className="d-flex flex-column col">
                      <label htmlFor="attendancedate">Date(MM/DD/YYYY)</label>
                      <TextField
                        type="date"
                        id="outlined-basic"
                        variant="outlined"
                        value={createStaffAttendanceForm.attendancedate}
                        name="attendancedate"
                        onChange={(e) => {
                          handleStaffChange(e);
                        }}
                        required
                      />
                    </div>

                    {/* Save Button */}
                    <div className="d-flex justify-content-center mt-2">
                      <SaveButton
                        color="secondary"
                        type="submit"
                        loading={isSaving}
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        variant="contained"
                        className="w-100"
                      >
                        <span>Create</span>
                      </SaveButton>
                    </div>
                  </form>
                </div>
              </Box>
            </Fade>
          </Modal>

          <div className="container">
            {attendanceData.staffattendance &&
            attendanceData.staffattendance.length !== 0 ? (
              <EmployeeAttendancePagination
                data={staffData}
                attendanceData={attendanceData.staffattendance}
                attendanceFirebaseId={attendanceData.firebaseId}
                isAdminAttendance={false}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default AttendancePage;
