import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../Firebase/config";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CnicICON from "../Assets/Logos/CnicICON.png";
import MedicalRecordICON from "../Assets/Logos/MedicalRecordICON.png";
import AdditionalFilesICON from "../Assets/Logos/AdditionalFilesICON.png";
import ProfilePhotoICON from "../Assets/Logos/ProfilePhotoICON.png";
import TextField from "@mui/material/TextField";
// MUI table
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";


const isObjectEmpty = (objectName) => {
  return JSON.stringify(objectName) === "{}";
};

var rows = [
  { authorityname: "Students" },
  { authorityname: "Courses" },
  { authorityname: "Fees" },
];

const StaffDetail = () => {
  const { state } = useLocation();
  const [staff, setStaff] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    return db
      .collection("staff")
      .doc(state.firebaseId)
      .onSnapshot(async (snapshot) => {
        setStaff({ ...snapshot.data(), firebaseId: snapshot.id });
        rows = [
          { authorityname: "Students", ...snapshot.data().studentauthority },
          { authorityname: "Courses", ...snapshot.data().courseauthority },
          { authorityname: "Fees", ...snapshot.data().feesauthority },
        ];
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
    navigate("edit", { state: { firebaseId: staff.firebaseId } });
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="title bg-dark  text-center text-white w-100">
        <h3 className="text-white">Staff Detail</h3>
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

      <div className="studentphoto  d-flex justify-content-center mt-2 mb-1">
        <img
          src={!isObjectEmpty(staff) ? staff.staffphoto.URL : ""}
          alt="Staff Photo "
          width={150}
          className="rounded"
        />
      </div>

      {!isObjectEmpty(staff) ? (
        <div className="staff-details w-100 ms-3 d-flex justify-content-center mx-auto">
          <div>
          <div className="row">
            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="ID"
                variant="standard"
                value={staff.staffid}
                InputProps={{            
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
              <TextField
                id="standard-basic"
                label="Staff Name"
                variant="standard"
                value={staff.firstname + " " + staff.lastname}
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
                label="Date Of Birth(MM/DD/YYYY)"
                type="date"
                variant="standard"
                value={staff.dob}
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
                value={staff.gender[0].toUpperCase() + staff.gender.slice(1)}
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
                value={staff.address}
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
                value={staff.phone}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

            <div className="row">
              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="Email"
                  value={
                    staff.email && staff.email.length !== 0 ? staff.email : "-"
                  }
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col d-flex flex-column">
                <TextField
                  id="standard-basic"
                  label="CNIC/ B-Form"
                  variant="standard"
                  value={staff.cnic}
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
                value={staff.education ? staff.education.toUpperCase() : ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
            <TextField
                id="standard-multiline-static"
                label="Institute Name "
                multiline
                rows={4}
                value={staff.institutename}
                variant="standard"
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
                label="Passing Year(MM/DD/YYYY)"
                type="date"
                variant="standard"
                value={staff.yearofpass}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
            <TextField
                id="standard-basic"
                label="Designation"
                variant="standard"
                value= {staff.designation}
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
                label="Salary"
                variant="standard"
                value={staff.initsalary}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
            <TextField
                id="standard-basic"
                label="Emergency Contact Name"
                variant="standard"
                value={staff.emergencyname}
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
                label="Emergency Contact No."
                variant="standard"
                
                value={staff.emergencyphone}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>

            <div className="col d-flex flex-column">
            <TextField
                id="standard-basic"
                label="Relationship"
                variant="standard"
                value={staff.emergencyphone}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </div>
          </div>
          </div>
         

         
        </div>
      ) : (
        ""
      )}

      <div className="title bg-dark  text-center text-white w-100">
        <h5 className="text-white">Authorities</h5>
      </div>
      {/* Table of Authorities */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="right">Review</TableCell>
              <TableCell align="right">Add</TableCell>
              <TableCell align="right">Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.authorityname}
                </TableCell>
                <TableCell align="right">{row.review ? "✓" : "🗴"}</TableCell>
                <TableCell align="right">{row.add ? "✓" : "🗴"}</TableCell>
                <TableCell align="right">{row.edit ? "✓" : "🗴"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="title bg-dark  text-center text-white w-100">
        <h5 className="text-white">Files</h5>
      </div>
      {/* File Download Buttons */}
      {!isObjectEmpty(staff) ? (
        <div className="files mt-2 w-100 d-flex flex-wrap justify-content-evenly">
          {/* Profile Photo */}
          {staff.staffphoto.length !== 0 ? (
            <button
              className="panel border profilephoto d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  staff.staffphoto,
                  `${
                    staff.firstname.toUpperCase() +
                    " " +
                    staff.lastname.toUpperCase() +
                    "(" +
                    staff.staffid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={ProfilePhotoICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text">Profile Photo</h3>
            </button>
          ) : (
            ""
          )}

          {/* Staff CNIC */}
          {staff.staffcnicphoto.length !== 0 ? (
            <button
              className="panel border cnic d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  staff.staffcnicphoto,
                  `${
                    staff.firstname.toUpperCase() +
                    " " +
                    staff.lastname.toUpperCase() +
                    "CNIC" +
                    "(" +
                    staff.staffid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={CnicICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text">CNIC</h3>
            </button>
          ) : (
            ""
          )}

          {/* Medical Records */}
          {staff.medicalrecordsphoto.length !== 0 ? (
            <button
              className="panel border medicalrecords d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                handleDownload(
                  staff.medicalrecordsphoto,
                  `${
                    staff.firstname.toUpperCase() +
                    " " +
                    staff.lastname.toUpperCase() +
                    "Medical Record" +
                    "(" +
                    staff.staffid +
                    ")"
                  }`
                );
              }}
            >
              <div className="icon">
                <img src={MedicalRecordICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text"> Medical Records</h3>
            </button>
          ) : (
            ""
          )}

          {/* Additional Records */}
          {staff.additionaldocuments.length !== 0 ? (
            <button
              className="panel border additionalfiles d-flex flex-column px-4 py-3 align-items-center rounded justify-content-center"
              onClick={() => {
                staff.additionaldocuments.forEach((eachFile, index) => {
                  handleDownload(
                    eachFile,
                    `${
                      staff.firstname.toUpperCase() +
                      " " +
                      staff.lastname.toUpperCase() +
                      "AdditionalFile " +
                      index +
                      1 +
                      "(" +
                      staff.staffid +
                      ")"
                    }`
                  );
                });
              }}
            >
              <div className="icon">
                <img src={AdditionalFilesICON} alt="" width={50} />
              </div>
              <h3 className="text-dark text">Additional Files</h3>
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

export default StaffDetail;
