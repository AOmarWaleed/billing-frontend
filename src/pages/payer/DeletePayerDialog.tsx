import { IconButton, useTheme } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { deletePayer } from "../../redux/slices/payerSlice";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { DisplayMsgDialog, Secure } from "@givc/shared-components";
import { publicUrl } from "../../utils/publicUrl";

interface DeletePayerDialogProps {
  selectedPayer: any;
  onDeleted?: () => void;
}

const DeletePayerDialog: React.FC<DeletePayerDialogProps> = ({
  selectedPayer,
  onDeleted,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    palette: { mode },
  } = useTheme();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePayer({ id: selectedPayer.payer_id }))
        .unwrap()
        .then(() => {
          setOpen(false);
          mutate((key) => apiUtility(key, "payer"));
          onDeleted?.();
        });
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <>
      {/* <IconButton onClick={handleClickOpen} color="error" size="small">
        <img src={publicUrl(`themes/${mode}/icons/delete.png`)} alt="Delete" />
      </IconButton> */}

      <Secure.GLButton2
        permission="payers_7_deletePayer"
        onClick={handleClickOpen}
        fallBackText="Delete Payer"
        sx={{
          p: 0,
        }}
        startIcon={
          <img
            src={publicUrl(`themes/${mode}/icons/delete.png`)}
            alt="Delete"
          />
        }
      />
      <DisplayMsgDialog
        open={open}
        onClose={handleClose}
        getResource={false}
        status="DELETE"
        actionLabel="Delete"
        actionColor="error"
        onAction={handleDelete}
        children={`Are you sure you want to delete - ${selectedPayer.payer_id} - ${selectedPayer.short_name} ?`}
      />
    </>
  );
};

export default DeletePayerDialog;
