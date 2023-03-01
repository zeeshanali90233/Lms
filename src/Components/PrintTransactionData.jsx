import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import PrintSVG from "../Assets/Logos/PrintICON.png";
import orgLogo from "../Assets/Logos/organization_Logo.png";

export const PrintTransactionData = ({ transactionData }) => {
  let componentRef = useRef();
  const printDate = new Date().toLocaleString();
  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className="btn mb-2">
            <img src={PrintSVG} alt="" />
          </button>
        )}
        content={() => componentRef}
      />
      <div style={{ display: "none" }}>
        <div
          id="printContainer"
          ref={(el) => (componentRef = el)}
          style={{ marginLeft: "20px" }}
        >
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "14px" }}>{printDate}</p>
          </div>
          <img src={orgLogo} alt="" width={50} className="text-center" />
          <h1
            style={{
              textAlign: "center",
              fontSize: "24px",
              marginBottom: "20px",
            }}
          >
            Transaction Receipt
          </h1>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <th style={{ textAlign: "left", paddingRight: "1em" }}>
                  Transaction ID:
                </th>
                <td style={{ textAlign: "left" }}>{transactionData.id}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", paddingRight: "1em" }}>
                  From:
                </th>
                <td style={{ textAlign: "left" }}>{transactionData.from}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", paddingRight: "1em" }}>To:</th>
                <td style={{ textAlign: "left" }}>{transactionData.to}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", paddingRight: "1em" }}>
                  Amount:
                </th>
                <td style={{ textAlign: "left" }}>
                  {transactionData.amount} PKR
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", paddingRight: "1em" }}>
                  Date:
                </th>
                <td style={{ textAlign: "left" }}>{transactionData.date}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", paddingRight: "1em" }}>
                  Time:
                </th>
                <td style={{ textAlign: "left" }}>{transactionData.time}</td>
              </tr>
            </tbody>
          </table>
          <p
            style={{
              fontSize: "14px",
              marginBottom: "10px",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            The authenticity of this receipt does not require any further
            validation as it has been generated by a computer system.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrintTransactionData;
