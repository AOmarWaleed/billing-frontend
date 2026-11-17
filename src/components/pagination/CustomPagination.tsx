import React, { useEffect } from 'react'; 
import { Pagination, PaginationItem,Box } from '@mui/material'; 
import { useGridApiContext, useGridSelector, gridPageCountSelector, gridPageSelector } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setPage } from '../../redux/slices/CodeTypeSlice';
interface CustomPaginationProps { 
    totalPages: number; 
    handlePageChange(value : number ):void,
}
const CustomPagination: React.FC<CustomPaginationProps> = ({ totalPages, handlePageChange }) => {
  const dispatch = useDispatch();  
  // Access currpage from Redux store
  const currpage =  useSelector((state: RootState) => state.codedata.page); 
  // Get the dispatch function
  useEffect(() => { 

       
       }, 
     [dispatch, currpage]);

  // Handle page change
  const handlePageClick = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value)); // Dispatch the action to update currpage in Redux
    handlePageChange(value);
  };
    return ( 
        <>
     <Pagination
        showFirstButton={true}
        showLastButton={true}
        color="primary" 
        count={totalPages} 
        page={currpage} 
        onChange={(event, value) =>handlePageClick(event,value)}
                                  
        />  
    <span> Page {currpage} of {totalPages} </span> 
                              </>
        ); 
    }; 
export default CustomPagination;