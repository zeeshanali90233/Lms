import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../Firebase/config";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import CnicICON from "../Assets/Logos/CnicICON.png";
import MedicalRecordICON from "../Assets/Logos/MedicalRecordICON.png";
import AdditionalFilesICON from "../Assets/Logos/AdditionalFilesICON.png";
import ProfilePhotoICON from "../Assets/Logos/ProfilePhotoICON.png";
import DegreeFileICON from "../Assets/Logos/DegreeFileICON.png";
import CvICON from "../Assets/Logos/CvICON.png";
import TextField from "@mui/material/TextField";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },

  "&": {
    padding: "10px",
    minWidth: "210px",
  },
}));

const isObjectEmpty = (objectName) => {
  return JSON.stringify(objectName) === "{}";
};

const AdminDetail = () => {
  const { state } = useLocation();
  const [admin, setAdmin] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    return db
      .collection("admin")
      .doc(state.firebaseId)
      .onSnapshot(async (snapshot) => {
        setAdmin({ ...snapshot.data(), firebaseId: snapshot.id });
      });
  }, []);

  // It downloads the files
  const handleDownload = (file, fileTitle = "") => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", file.URL, true);
    xhr.responseType = "blob";
    xhr.onload = function (event) {
      const blob = xhr.response;
      // Set the content-disposition header to specify the original file type and extension
      const contentDispositionHeader = `attachment; filename=${fileTitle}.${file.metadata.customMetadata.fileExtension};`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileTitle}.${file.metadata.customMetadata.fileExtension}`;
      link.setAttribute("style", "display: none;");
      link.setAttribute(
        "download",
        `${fileTitle}.${file.metadata.customMetadata.fileExtension}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    xhr.send();
  };

  const handleNavigation = () => {
    navigate("edit", { state: { firebaseId: admin.firebaseId } });
  };
  return (
    <div className="d-flex flex-column align-items-center">
      <div className="title bg-dark  text-center text-white w-100">
        <h3 className="text-white">Admin Detail</h3>
      </div>

       {/* Edit Button */}
      {/*!Importane It's CSS is in the studentpage.css , due to global scope it is accessible here */}
      <div
        className="w-100 d-flex mt-2 justify-content-end pe-2"
        onClick={() => {
          handleNavigation();
        }}
      >
        <button type="submit" id="edit-button" className='border rounded'  onClick={() => {
          handleNavigation();
        }}>Edit</button>
      </div>

      {/* Student Photo */}
      <div className="adminphoto w-100 d-flex justify-content-center mt-2 mb-1">
        <img
          src={!isObjectEmpty(admin) ? admin.adminphoto.URL : ""}
          alt="Admin Photo "
          width={150}
          className="rounded"
        />
      </div>

      {!isObjectEmpty(admin) ? (
        <div className="admin-details w-100 ms-3 d-flex justify-content-center mx-auto">
          <div className="w-100">
            <div className="row">
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="ID"
                  variant="standard"
                  value={admin.aid}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Admin Name"
                  variant="standard"
                  value={admin.firstname + " " + admin.lastname}
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
                  label="Date Of Birth"
                  variant="standard"
                  type="date"
                  value={admin.dob}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Gender"
                  variant="standard"
                  value={admin.gender[0].toUpperCase() + admin.gender.slice(1)}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-multiline-static"
                  label="Address"
                  multiline
                  rows={4}
                  value={admin.address}
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column mt-4">
                <TextField
                  id="standard-basic"
                  label="Phone Number"
                  variant="standard"
                  value={admin.phone}
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
                  label="Email"
                  variant="standard"
                  value={admin.email !== "" ? admin.email : "-"}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="CNIC"
                  variant="standard"
                  value={admin.cnic}
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
                  label="Qualification"
                  variant="standard"
                  value={admin.education}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Institute Name"
                  variant="standard"
                  multiline
                  rows={4}
                  value={(admin.institutename!=="")?admin.institutename:""}
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
                  label="Passing Year"
                  variant="standard"
                  type="date"
                  value={admin.yearofpass}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="CGPA"
                  variant="standard"
                  value={admin.cgpa}
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
                  label="Designation"
                  variant="standard"
                  value={admin.designation}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Salary(PKR)"
                  variant="standard"
                  value={admin.initsalary}
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
                  label="Emergency Contact Name"
                  variant="standard"
                  value={admin.emergencyname}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Emergency Contact No."
                  variant="standard"
                  value={admin.emergencyphone}
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
                  label="Relationship"
                  variant="standard"
                  value={admin.emergencyrelationship}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Manage Salary Records"
                  variant="standard"
                  value={admin.canmanagesalary === "true" ? "Yes" : "No"}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
            </div>






          </div>

        </div>
      ) : (
        ""
      )}

      <div className="title bg-dark  text-center text-white w-100">
        <h5 className="text-white">Files</h5>
      </div>
      {/* File Download Buttons */}
      {!isObjectEmpty(admin) ? (
        <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">
          {/* Profile Photo */}
          {admin.adminphoto.length !== 0 ? (
            <button
              className="panel border profilephoto d-flex flex-column px-4 py-2 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  admin.adminphoto,
                  `${
                    admin.firstname.toUpperCase() +
                    " " +
                    admin.lastname.toUpperCase() +
                    "(" +
                    admin.aid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={ProfilePhotoICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">Profile Photo</h4>
            </button>
          ) : (
            ""
          )}

          {/* Admin CNIC */}
          {admin.admincnicphoto.length !== 0 ? (
            <button
              className="panel border cnic d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  admin.admincnicphoto,
                  `${
                    admin.firstname.toUpperCase() +
                    " " +
                    admin.lastname.toUpperCase() +
                    "CNIC" +
                    "(" +
                    admin.aid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CnicICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">CNIC</h4>
            </button>
          ) : (
            ""
          )}

          {/*cv */}
          {admin.cv.length !== 0 ? (
            <button
              className="panel border cv d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  admin.cv,
                  `${
                    admin.firstname.toUpperCase() +
                    " " +
                    admin.lastname.toUpperCase() +
                    "CV" +
                    "(" +
                    admin.aid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CvICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">CV</h4>
            </button>
          ) : (
            ""
          )}

          {/*Degree File */}
          {admin.degreefile.length !== 0 ? (
            <button
              className="panel border cnic d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  admin.degreefile,
                  `${
                    admin.firstname.toUpperCase() +
                    " " +
                    admin.lastname.toUpperCase() +
                    "Degree" +
                    "(" +
                    admin.aid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={DegreeFileICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text"> Degree File</h4>
            </button>
          ) : (
            ""
          )}

          {/*Medical Records File */}
          {admin.medicalrecordsphoto.length !== 0 ? (
            <button
              className="panel border medicalrecords d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  admin.medicalrecordsphoto,
                  `${
                    admin.firstname.toUpperCase() +
                    " " +
                    admin.lastname.toUpperCase() +
                    "MedicalRecord" +
                    "(" +
                    admin.aid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={MedicalRecordICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text"> Medical Records</h4>
            </button>
          ) : (
            ""
          )}

          {/* Additional Records */}
          {admin.additionaldocuments.length !== 0 ? (
            <button
              className="panel border additionalfiles d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                admin.additionaldocuments.forEach((eachFile, index) => {
                  handleDownload(
                    eachFile,
                    `${
                      admin.firstname.toUpperCase() +
                      " " +
                      admin.lastname.toUpperCase() +
                      "AdditionalFile " +
                      index +
                      1 +
                      "(" +
                      admin.aid +
                      ")"
                    }`
                  );
                });
              }}
            >
              <div className="icon">
                <img src={AdditionalFilesICON} alt="" width={40} />
              </div>
              <h4 className="text-dark text">Additional Files</h4>
            </button>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default AdminDetail;
