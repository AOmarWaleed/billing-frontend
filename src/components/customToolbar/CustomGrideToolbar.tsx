

import { GridToolbarContainer} from '@mui/x-data-grid'; 
import { Box, IconButton, TextField } from '@mui/material'
// MUI ICONS
import IconFilterAlt from "@mui/icons-material/FilterAlt";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
// Styles
import useStyles from '../../assets/css/useStyles';
import React from 'react';

interface CustomToolbarProps{
  title:string,
  isFilterOn: boolean,
  openCodeDataForm(event: React.MouseEvent<HTMLButtonElement>) : void,
  clickFilterOnHandler(event: React.MouseEvent<HTMLButtonElement>) : void,
}
const CustomToolbar: React.FC<CustomToolbarProps> = ({ 
    title,isFilterOn,openCodeDataForm, clickFilterOnHandler}) => { 
    const classes = useStyles();
    return ( 
        <GridToolbarContainer className={classes.actions}>     
                <IconButton onClick={clickFilterOnHandler}>
        
            <IconFilterAlt sx={{color: isFilterOn ? "#08A90A" : ""}} />
            </IconButton>
            <IconButton onClick={openCodeDataForm} sx={{ alignContent: 'right'}}> 
                <AddCircleIcon />
                    <span className='title-text' style={{  paddingLeft: "10px" }}> {title} </span> 
            </IconButton>
        </GridToolbarContainer> ); }; 
export default React.memo(CustomToolbar);