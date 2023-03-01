import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useState ,useEffect} from 'react';

import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import { db } from "../Firebase/config";

const columns = [
  { id: 'sr', label: 'Sr.', minWidth: 170 },
  { id: 'name(id)', label: 'Name(ID)', minWidth: 100 },
  {
    id: 'population',
    label: 'Population',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'size',
    label: 'Size\u00a0(km\u00b2)',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'density',
    label: 'Density',
    minWidth: 170,
    align: 'right',
    format: (value) => value.toFixed(2),
  },
];

function createData(name, code, population, size) {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData('India', 'IN', 1324171354, 3287263),
  createData('China', 'CN', 1403500365, 9596961),
  createData('Italy', 'IT', 60483973, 301340),
  createData('United States', 'US', 327167434, 9833520),
  createData('Canada', 'CA', 37602103, 9984670),
  createData('Australia', 'AU', 25475400, 7692024),
  createData('Germany', 'DE', 83019200, 357578),
  createData('Ireland', 'IE', 4857000, 70273),
  createData('Mexico', 'MX', 126577691, 1972550),
  createData('Japan', 'JP', 126317000, 377973),
  createData('France', 'FR', 67022000, 640679),
  createData('United Kingdom', 'GB', 67545757, 242495),
  createData('Russia', 'RU', 146793744, 17098246),
  createData('Nigeria', 'NG', 200962417, 923768),
  createData('Brazil', 'BR', 210147125, 8515767),
];


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
 
  }));

   // Comparator Function to sort attendance
   const compareByDate = (a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
  
    if (dateA < dateB) {
      return 1; // a should come after b
    } else if (dateA > dateB) {
      return -1; // a should come before b
    } else {
      return 0; // a and b are equal
    }
  };





export default function StickyHeadTable({ data ,attendanceData,courseFirebaseId}) {
  const rows = [...data];
    const [isSaving,setIsSaving]=useState(false);
    const [attendanceDataPagination,setAttendanceDataPagination]=useState(attendanceData.sort(compareByDate));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isSuccessfullyAdded, setIsSuccessfullyAdded] = useState(false);


    useEffect(()=>{
        db.collection("courses").doc(courseFirebaseId).onSnapshot((snapshot)=>{
            setAttendanceDataPagination(snapshot.data().attendance.sort(compareByDate));
        })
     },[])


     //   It handles the attendance checkboxes changes
const handleAttendanceCheckbox=(e,index,sid)=>{
    e.preventDefault();
    let updatedAttendance=[...attendanceDataPagination];
    updatedAttendance[index].attendance[sid]=!updatedAttendance[index].attendance[sid];
    setAttendanceDataPagination(updatedAttendance);
}

const handleSaveAttendanceChanges=(e)=>{
    e.preventDefault(); 
    setIsSaving(true);
    db.collection("courses").doc(courseFirebaseId).update({
        attendance:attendanceDataPagination,
    })
    setIsSaving(false);
    setIsSuccessfullyAdded(true);
    setTimeout(()=>{
        
        setIsSuccessfullyAdded(false);
    },1500)          
}


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const SaveButton = styled(LoadingButton)({
    backgroundColor: "#00233a",
    "&:hover": {
      backgroundColor: "#393c41",
    },
  });

  return (
   <div className='mt-2'>
    {isSuccessfullyAdded ? (
    <Alert severity="success">Successfully Added</Alert>
    ) : (
      ""
    )}
     <SaveButton
        color="secondary"
        type="submit"
        loading={isSaving}
        loadingPosition="start"
        startIcon={<SaveIcon />}
        variant="contained"
        className="w-100"
        onClick={(e)=>{handleSaveAttendanceChanges(e)}}
      >
        <span>Save Changes</span>
      </SaveButton>
     <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
            <TableCell
                 
                >
                  Sr.
                </TableCell>
            <TableCell
                 
                >
                  Name(ID)
                </TableCell>
                {(attendanceDataPagination)?attendanceDataPagination.map((attendance)=>{
            return(

                <TableCell align="center" ><div className="d-flex flex-column justify-content-center align-items-center"><span>L-{attendance.lecturenumber}</span><span>{attendance.date.split("-")[0]+"-"+attendance.date.split("-")[1]}</span></div></TableCell>
            )
          }):""}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row,index) => {
                return true? (
                    <StyledTableRow
                      key={row.firebaseId}
                      
                    >
        
                      <StyledTableCell component="th" scope="row">
                        {index+1}
                      </StyledTableCell>
                      <StyledTableCell component="th" scope="row">
                        {row.firstname+" "+row.lastname+"("+row.sid+")"}
                      </StyledTableCell>
                      {attendanceDataPagination.map((attendance,index)=>{
                        return(
                    (index===0)?<StyledTableCell align="center" >
                         <Checkbox inputProps={{'aria-label': 'checkbox'}} onChange={(e)=>{handleAttendanceCheckbox(e,index,row.sid)}} checked={attendance.attendance[row.sid]} />
                  </StyledTableCell>
        
                  :<StyledTableCell align="center"  >
                        
                    {(attendance.attendance[row.sid])?"P":(attendance.attendance[row.sid]!==undefined)?"A":"-"}
                  </StyledTableCell>
                        );
                      })}
                      
                    </StyledTableRow>
                  ) : (
                    ""
                  );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
   </div>
  );
}