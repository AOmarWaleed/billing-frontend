// MUIS
import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  margin: {
    margin: theme.spacing(2),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  columnFilter: {
    width: "100%",
    marginBottom: "5px",
  },
}));

export default useStyles;
