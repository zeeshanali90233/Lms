import React, { useState, useEffect, useRef,useContext } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/system";
import firebase from "firebase/compat/app";
import { db } from "../Firebase/config";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import RoughMaterialPagination from "./RoughMaterialPagination";
import RoughMaterialICON from "../Assets/Logos/RoughMaterialICON.png";
import { showMaterialDeleteButtonContext } from "./CourseDetails";

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

const SaveButton = styled(LoadingButton)({
  backgroundColor: "#00233a",
  "&:hover": {
    backgroundColor: "#393c41",
  },
});

const CourseRoughMaterial = ({ firebaseId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);
  const [addRoughMaterialModal, setAddRoughMaterialModal] = useState(false);
  const [roughMaterialForm, setRoughMaterialForm] = useState({});
  const [courseRoughMaterial, setCourseRoughMaterial] = useState([]);
  const {showAddRoughMaterialButtons}=useContext(showMaterialDeleteButtonContext);
  useEffect(() => {
    db.collection("courses")
      .doc(firebaseId)
      .onSnapshot((snapshot) => {
        setCourseRoughMaterial(snapshot.data().roughMaterial);
      });
  }, []);
  const handleChange = (e) => {
    e.preventDefault();
    setRoughMaterialForm({ [e.target.name]: e.target.value });
  };

  const handleAddRoughMaterialModelClose = () => {
    setAddRoughMaterialModal(false);
  };
  const saveRoughMaterial = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const coursesUpdate = await db
      .collection("courses")
      .doc(firebaseId)
      .update({
        roughMaterial: firebase.firestore.FieldValue.arrayUnion(
          roughMaterialForm.roughcontent
        ),
      });
      setIsSaving(false);
      setAddRoughMaterialModal(false);
    setIsSuccessfullyAdded(true);
    setTimeout(()=>{setIsSuccessfullyAdded(false)},1500)
  };
  return (
    <div className="w-100 container mt-1">
      <div className="title bg-dark  text-center text-white w-100 rounded py-1 ">
        <h4 className="text-white">Rough Material</h4>
      </div>
      {isSuccessfullyAdded ? (
        <Alert severity="success">Successfully Added</Alert>
      ) : (
        ""
      )}

      {/* Buttons */}
      {(showAddRoughMaterialButtons)?<div className="btns d-flex w-100 justify-content-evenly flex-wrap mt-1">
        <div
          className="panel border material d-flex flex-column px-3 py-2 align-items-center rounded justify-content-center"
          onClick={() => {
            setAddRoughMaterialModal(!addRoughMaterialModal);
          }}
        >
          <div className="icon">
            <img src={RoughMaterialICON} alt="" width={30}/>
          </div>
          <h5 className="text-dark user-select-none">Add Rough Material</h5>
        </div>
      </div>:""}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={addRoughMaterialModal}
        onClose={handleAddRoughMaterialModelClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={addRoughMaterialModal}>
          <Box sx={style}>
            <form
              onSubmit={(e) => {
                saveRoughMaterial(e);
              }}
            >
              {/* Title Input*/}
              <div className=" w-100">
                <div className="d-flex flex-column mt-2 ">
                  <textarea
                    type="text"
                    id="roughContent"
                    name="roughcontent"
                    className="w-100 rounded"
                    rows={5}
                    placeholder="Enter the content here"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                  ></textarea>
                </div>
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
                  <span>Save</span>
                </SaveButton>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>

      {/* Rough Material Pagination */}
      {(courseRoughMaterial.length!==0)?<RoughMaterialPagination
        data={courseRoughMaterial}
        firebaseId={firebaseId}
        showDeleteButton={showAddRoughMaterialButtons}
      />:""}
    </div>
  );
};

export default CourseRoughMaterial;
