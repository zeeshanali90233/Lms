import React from "react";
import "../Css/FeesPage.css";
const FeeDisplay = ({fee}) => {
  return (
    <div className={`d-flex ps-2 justify-content-between border-bottom ${(fee.duedate<new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" } && (fee.feepaid<fee.totalfees))?"fee-defaulter":"")}`}>
      <div className="id col-2 word-wrap fees-sid">
        <h5>{fee.sid}</h5>
      </div>
      <div className="id col-3 student-name border-start">
        <h5>{fee.name}</h5>
      </div>
      <div className="id col-2 border-start stotal-fees  border-dark border border-1">
        <h5>{fee.totalfees}Rs</h5>
      </div>
      <div className="id col-1 border-start sinstalllment-fees">
        <h5>{fee.feeperinstallment}Rs</h5>
      </div>
      <div className="id col-2 border-start sfee-paid">
        <h5>{fee.feepaid}Rs</h5>
      </div>
    </div>
  );
};

export default FeeDisplay;
