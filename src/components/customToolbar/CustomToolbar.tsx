import { Box, IconButton } from "@mui/material";
// MUI ICONS
import IconFilterAlt from "@mui/icons-material/FilterAlt";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// Styles
import useStyles from "../../assets/css/useStyles";
import React from "react";
import Secure from "../../shared/security";

interface CustomToolbarProps {
  title: string;
  isFilterOn: boolean;
  openForm(event: React.MouseEvent<HTMLButtonElement>): void;
  clickFilterOnHandler(event: React.MouseEvent<HTMLButtonElement>): void;
  disableAdd: boolean;
  resourceKey: string
}
const CustomToolbar: React.FC<CustomToolbarProps> = ({ title, isFilterOn, disableAdd, openForm, clickFilterOnHandler, resourceKey }) => {
  const classes = useStyles();
  return (
    <Box className={classes.actions} sx={{ maxHeight: "30px" }}>
      <Secure.GLIconButton resource_key={resourceKey} onClick={clickFilterOnHandler}>
        <IconFilterAlt sx={{ color: isFilterOn ? "#08A90A" : "", fontSize: "20px" }} />
      </Secure.GLIconButton>
      {/* <IconButton onClick={openForm} sx={{ alignContent: "right" }} disabled={disableAdd}>
        <AddCircleIcon sx={{ fontSize: "20px" }} />
        <span className="title-text" style={{ paddingLeft: "10px", marginTop: "3px" }}>
          {" "}
          {title}{" "}
        </span>
      </IconButton> */}
    </Box>
  );
};
export default React.memo(CustomToolbar);
