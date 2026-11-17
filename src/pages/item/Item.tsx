import { useState } from "react";

import { useSelector } from "react-redux";

import { RootState } from "../../redux/store";
import { Box, CircularProgress } from "@mui/material";
import ItemDetail from "./components/ItemDetail";

import "../../assets/css/Style.css";

const buttonStyles = {
  width: "150px",
  padding: "6px",
  marginLeft: "5px",
  fontWeight: "normal", // 'none' is not a valid value for font-weight
  marginTop: "5px",
  gap: "0px",
  backgroundColor: "#21b6ae",
  fontSize: "12px",
  borderColor: "lightgray",
  borderWidth: "2px",
  borderRadius: "5px",
};
const customCancelBtnStyles = {
  width: "150px",
  padding: "6px",
  fontWeight: "normal", // 'none' is not a valid value for font-weight
  marginTop: "5px",
  gap: "0px",
  backgroundColor: "#f7f8f8",
  color: "gray",
  fontSize: "12px",
  borderColor: "lightgray",
  borderWidth: "2px",
  borderRadius: "5px",
};

const Item = ({itemsRef}: { itemsRef: React.RefObject<() => void> }) => {

  const itemStatus = useSelector((state: RootState) => state.items.status);

  const [disable, setDisable] = useState(true);

  const openEditMode = () => {
    setDisable(false);
  };

  const closeEditMode = () => {
    setDisable(true);
  };

  return (
    <Box sx={{ flexGrow: 6, justifyContent: "center", alignItems: "center" }}>
      {itemStatus === "succeeded" ? (
        <ItemDetail
          openEditMode={openEditMode}
          closeEditMode={closeEditMode}
          disable={disable}
          setDisable={setDisable}
          itemsRef={itemsRef}
        />
      ) : (
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
        </Box>
      )}
      {itemStatus === "failed" && <div>Error loading item's details</div>}
    </Box>
  );
};

export default Item;
