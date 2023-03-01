import React from "react";
import "../Css/Login.css";
import { useNavigate } from "react-router-dom";
import { useState,useRef } from "react";
import firebase from "firebase/compat/app";
import { db } from "../Firebase/config";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import orgLogo from "../Assets/Logos/organization_Logo.png";
import LoginGif from "../Assets/Images/LoginGif.gif";
import LoginGifVideo from "../Assets/Images/LoginGif.mp4";
// MUI MODAL COMPONENT
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import SearchIcon from '@mui/icons-material/Search';
import { styled } from "@mui/system";
import LoadingButton from "@mui/lab/LoadingButton";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Modal MUI Style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "350px",
  bgcolor: "background.paper",
  border: "1px solid #0086c9",
  borderRadius: "23px",
  boxShadow: 24,
  p: 4,
};

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

const linkPhoneNumberToAccount = async (phoneNumber) => {
  try {
    const user = firebase.auth().currentUser;
    const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneNumber);
    const verificationCode = prompt('Enter the verification code that was sent to your phone:');
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
    await user.linkWithCredential(credential);
    return true;
  } catch (error) {
    // Handle error
    return false;
  }
};

const LoginPage = ({ userType }) => {
  const navigate = useNavigate();
  const [isLogging,setIsLogging]=useState(false);
const [isFinding,setIsFinding]=useState(false);
  const [showForgotPassword,setShowForgotPassword]=useState(false);
  const [forgotPasswordForm,setForgotPasswordForm]=useState({id:"",isVerified:false})
  const recaptchaContainerRef = useRef(null);

  const [id, setId] = useState("");
  const [alertState, setAlertState] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "right",
  });
  const { vertical, horizontal, open } = alertState;
  const [loginForm, setLoginForm] = useState({
    userType: userType,
    id: "",
    password: "",
  });

  // It sends the code to sms
  const sendVerificationCode = async (phoneNumber) => {
    
    try {
      await sendPasswordResetEmail(getAuth(), "sa1230@alm.edu.pk");
      console.log("Password reset email sent")
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  const handleForgotPasswordClose=()=>{
    setShowForgotPassword(false);
  }
  const handleForgotPasswordOpen=(e)=>{
    e.preventDefault();
    setShowForgotPassword(true);
  }
  const forgotPasswordChange=(e)=>{
    e.preventDefault();
    setForgotPasswordForm({...forgotPasswordForm,id:e.target.value});
  }

  const forgotPasswordSubmit=(e)=>{
    e.preventDefault();
    let user;
    if(forgotPasswordForm.id[0].toLowerCase()==='s'){
      db.collection("superadmin").where("said","==",forgotPasswordForm.id).onSnapshot((snapshot)=>{
        user=snapshot.docs[0].data();
        sendVerificationCode(user.phone);
      })
    }
  }

  // For Error Toast
  const handleClick = () => {
    setAlertState({ ...alertState, open: true });
  };
  const handleClose = () => {
    setAlertState({ ...alertState, open: false });
  };

  const handleChange = (e) => {
    if (e.target.name === "id") {
      setLoginForm({
        ...loginForm,
        [e.target.name]: `${e.target.value.toLowerCase()}@alm.edu.pk`,
      });
      setId(e.target.value.toLowerCase());
    } else {
      setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLogging(true);
    if (userType === "admin") {
      if (loginForm.id.match(/^a[0-9a-zA-Z]+@alm.edu.pk$/)) {
        firebase
          .auth()
          .signInWithEmailAndPassword(loginForm.id, loginForm.password)
          .then((res) => {
            // Fetching the user firebase id and storing at the local storage then navigating to dashboard
            db.collection("admin")
              .where("aid", "==", id)
              .get()
              .then((res) => {
                localStorage.setItem("adminUser", res.docs[0].id);
                navigate("../admin/dashboard", {
                  state: { user: res.docs[0].data() },
                });
                setIsLogging(false);
              });
          })
          .catch((err) => {
            handleClick();
            setIsLogging(false);
          });
      } else {
        handleClick();
        setIsLogging(false);
      }
    setIsLogging(false);

    } else if (userType === "super admin") {
      if (loginForm.id.match(/^sa[0-9a-zA-Z]+@alm.edu.pk$/)) {
        firebase
          .auth()
          .signInWithEmailAndPassword(loginForm.id, loginForm.password)
          .then((res) => {
            // Fetching the user firebase id and storing at the local storage then navigating to dashboard
            db.collection("superadmin")
              .where("said", "==", id)
              .get()
              .then((res) => {
                localStorage.setItem("sAdminUser", res.docs[0].id);
                // Also passing the user data as props
                navigate("../sadmin/dashboard", {
                  state: { user: res.docs[0].data() },
                });
                setIsLogging(false);
              });
          })
          .catch((err) => {
            handleClick();
            setIsLogging(false);
          });
      } else {
        handleClick();
        setIsLogging(false);
      }
   

    } else if (userType === "staff") {
      if (loginForm.id.match(/^e[0-9a-zA-Z]+@alm.edu.pk$/)) {
        firebase
          .auth()
          .signInWithEmailAndPassword(loginForm.id, loginForm.password)
          .then((res) => {
            // Fetching the user firebase id and storing at the local storage then navigating to dashboard
            db.collection("staff")
              .where("staffid", "==", id)
              .get()
              .then((res) => {
                localStorage.setItem("staffUser", res.docs[0].id);
                // Also passing the user data as props
                navigate("../staff/dashboard", {
                  state: { user: res.docs[0].data() },
                });
                setIsLogging(false);
              });
          })
          .catch((err) => {
            handleClick();
            setIsLogging(false);
          });
      } else {
        handleClick();
        setIsLogging(false);
      }
    } else if (userType === "student") {
      if (loginForm.id.match(/^s[0-9a-zA-Z]+@alm.edu.pk$/)) {
        firebase
          .auth()
          .signInWithEmailAndPassword(loginForm.id, loginForm.password)
          .then((res) => {
            // Fetching the user firebase id and storing at the local storage then navigating to dashboard
            db.collection("students")
              .where("sid", "==", id)
              .get()
              .then((res) => {
                localStorage.setItem("studentUser", res.docs[0].id);
                // Also passing the user data as props
                navigate("../student/dashboard", {
                  state: { user: res.docs[0].data() },
                });
                setIsLogging(false);
              });
          })
          .catch((err) => {
            handleClick();
            setIsLogging(false);
          });
      } else {
        handleClick();
        setIsLogging(false);
      }
    } else if (userType === "teacher") {
      if (loginForm.id.match(/^t[0-9a-zA-Z]+@alm.edu.pk$/)) {
        firebase
          .auth()
          .signInWithEmailAndPassword(loginForm.id, loginForm.password)
          .then((res) => {
            // Fetching the user firebase id and storing at the local storage then navigating to dashboard
            db.collection("teachers")
              .where("tid", "==", id)
              .get()
              .then((res) => {
                localStorage.setItem("teacherUser", res.docs[0].id);
                // Also passing the user data as props
                navigate("../teacher/dashboard", {
                  state: { user: res.docs[0].data() },
                });
                setIsLogging(false);
              });
          })
          .catch((err) => {
            handleClick();
            setIsLogging(false);
          });
      } else {
        handleClick();
        setIsLogging(false);
      }
    }
  };

  return (
    <>
      <div className="limiter">
        {/* Forgot Password Modal */}
        <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showForgotPassword}
        onClose={handleForgotPasswordClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showForgotPassword}>
          <Box sx={style}>
            <form
              onSubmit={(e) => {
                forgotPasswordSubmit(e);
              }}
            >
              {/* ID Input*/}
              <div className=" w-100">
                <div className="d-flex flex-column mt-2 ">
                <TextField
                id="outlined-basic"
                type="text"
                name="id"
                value={forgotPasswordForm.id}
                placeholder="Enter Your ID"
                onChange={(e) => {
                  forgotPasswordChange(e);
                }}
                required
              />
                 
                </div>
              </div>
              <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

              {/* Save Button */}
              <div className="d-flex justify-content-center mt-2">
                <SaveButton
                  color="secondary"
                  type="submit"
                  loading={isFinding}
                  loadingPosition="start"
                  startIcon={<SearchIcon />}
                  variant="contained"
                  className="w-100"
                >
                  <span>Find</span>
                </SaveButton>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>
     
        {/* Error Message Toaster */}
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={handleClose}
          autoHideDuration={1500}
          key={vertical + horizontal}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Incorrect ID and Password
          </Alert>
        </Snackbar>

        <div className="container-login100">
          <div className="wrap-login100">
            <form
              className="login100-form validate-form"
              onSubmit={(e) => {
                handleSubmit(e);
              }}
            >
              <span className="login100-form-title pb-2 d-flex flex-column">
                <div className="bg-dark">
                  <img src={orgLogo} className="mr-auto" alt="#" width={150} />
                </div>
                <div className="mt-4">
                  {userType.charAt(0).toUpperCase() + userType.slice(1)} Login
                </div>
              </span>

              <TextField
                id="outlined-basic"
                label="ID"
                variant="outlined"
                className="w-100 mt-1"
                type="text"
                pattern="t[a-zA-Z0-9]{4}"
                required
                name="id"
                onChange={(e) => {
                  handleChange(e);
                }}
                autoFocus={loginForm.id !== ""}
                title="Input value should be in the format 't/s/a-____', where ____ is a combination of letters and numbers"
              />

              <TextField
                className="w-100 mt-3"
                id="outlined-password-input"
                label="Password"
                type="password"
                autoComplete="current-password"
                name="password"
                value={loginForm.password}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />

              <div className="flex-sb-m w-100 pt-3 pb-3">
                <div>
                  <div
 
                    className="txt1 text-right"
                    onClick={(e)=>{handleForgotPasswordOpen(e)}}
                    style={{cursor:"pointer"}}
                  >
                    Forgot Password?
                  </div>
                </div>
              </div>

              <div className="container-login100-form-btn">
                <button className="login100-form-btn" type="submit" disabled={isLogging===true}>
                  {(isLogging)?"Please Wait...":"Login"}
                </button>
              </div>
            </form>

            {/* Carousel */}
            <div className="login100-more my-auto">
              <div
                id="carouselExampleIndicators"
                class="carousel slide"
                data-bs-ride="carousel"
                data-interval="0.1"
              >
                
                <div className="carousel-indicators">
                </div>
                <div class="carousel-inner">
                  <div class="carousel-item active">
                    
                    <img
                      src={LoginGif}
                      className="d-block w-100"
                      alt="..."
                    ></img>

                    {/* <video src={LoginGifVideo} autoPlay autoFocus></video> */}

                  </div>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
