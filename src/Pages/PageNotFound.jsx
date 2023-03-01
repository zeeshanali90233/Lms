import React from "react";
import { NavLink } from "react-router-dom";
import "../Css/PageNotFound.css";

const PageNotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-head">404:(</h1>
      <h1 className="not-found-heading">That Page Doesn't exist</h1>
      <p className="not-found-text">
        Sorry, the page you were looking for could not found
      </p>
      <div className="page-404-btns">
        <NavLink to="/">
          <button
            type="button"
            class="not-found-backhome btn-padd btn-marg txt-color"
          >
            Go Back Home
          </button>
        </NavLink>
        <NavLink to="">
          <button
            type="button"
            class="not-found-contact btn-padd btn-marg txt-color"
          >
            Contact Us
          </button>
        </NavLink>
      </div>
    </div>
  );
};

export default PageNotFound;
