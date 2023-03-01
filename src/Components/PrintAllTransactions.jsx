import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import PrintSVG from "../Assets/Logos/PrintICON.png";
import orgLogo from "../Assets/Logos/organization_Logo.png";

const PrintAllTransactions = ({ allTransactionRecords }) => {
  let componentRef = useRef();
  const printDate = new Date().toLocaleDateString();
  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className="btn-showAllTrans btn border mb-2">
            <img src={PrintSVG} alt="" /> Print
          </button>
        )}
        content={() => componentRef}
      />
      <div style={{ display: "none" }}>
        <div id="printContainer" ref={(el) => (componentRef = el)}  >
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "14px" }}>{printDate}</p>
          </div>
          <img src={orgLogo} alt="" width={50} className="text-center" style={{ marginLeft: "20px" }}/>
          <h1
            style={{
              textAlign: "center",
              fontSize: "24px",
              marginBottom: "20px",
            }}
          >
            All Transactions
          </h1>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor: "lightgray",
                  }}
                >
                  Transaction ID
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor: "lightgray",
                  }}
                >
                  From
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor: "lightgray",
                  }}
                >
                  To
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor: "lightgray",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor: "lightgray",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor: "lightgray",
                  }}
                >
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {allTransactionRecords.map((transactionData) => {
                return (
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {transactionData.id}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {transactionData.from}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {transactionData.to}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {transactionData.amount} PKR
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {transactionData.date}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {transactionData.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PrintAllTransactions;
