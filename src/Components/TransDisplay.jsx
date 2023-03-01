import React from 'react'
import '../Css/AllTransPage.css';

const TransDisplay = ({trans}) => {
  return (
    <div className="d-flex ps-2 justify-content-between border-bottom" key={trans.id}>
      <div className="id col word-wrap trans-id">
        <h5>{trans.id}</h5>
      </div>
      <div className=" col border-start">
        <h5>{trans.from}</h5>
      </div>
      <div className=" col border-start trans-to">
        <h5>{trans.to}</h5>
      </div>

      <div className=" col border-start ">
        <h5>{trans.amount}</h5>
      </div>
      <div className=" col border-start trans-date">
        <h5>{trans.date}</h5>
      </div>
      <div className=" col border-start ">
        <h5>{trans.time}</h5>
      </div>
      
    </div>
  )
}

export default TransDisplay