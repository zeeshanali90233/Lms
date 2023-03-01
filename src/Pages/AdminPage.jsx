import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import AdminPagination from '../Components/AdminPagination';
import { db } from '../Firebase/config'
import AddSuperAndAdminICON from "../Assets/Logos/AddSuperAndAdminICON.png";

const AdminPage = () => {
  const [admin,setAdmin]=useState([]);
  useEffect(()=>{
    db.collection("admin").onSnapshot((snapshot)=>{
      let data=[];
      snapshot.forEach((doc)=>{data.push({...doc.data(),firebaseId:doc.id})})
      setAdmin(data);
    })
    
  },[])
  return (
    <div className='adminSide'>
      <div className='d-flex justify-content-end w-100 mt-1 mb-2'>
      <NavLink to="add-admin" className="text-decoration-none">
          <button className="btn-showAllTrans  border edit d-flex px-2 py-2 align-items-center rounded justify-content-center">
            <div className="icon">
              <img src={AddSuperAndAdminICON} alt="" width={20}/>
            </div>
            <div className="text-dark text ">Add Admin</div>
          </button>
        </NavLink>

        <NavLink to="add-sadmin"  className="text-decoration-none">
          <button className="btn-showAllTrans  border edit d-flex px-2 py-2 align-items-center rounded justify-content-center ms-1">
          <div className="icon">
              <img src={AddSuperAndAdminICON} alt="" width={20}/>
            </div>
            <div className="text-dark text ">Add Super Admin</div>
          </button>   
        </NavLink>
      </div>
      <AdminPagination data={admin}/>
    </div>
  )
}

export default AdminPage