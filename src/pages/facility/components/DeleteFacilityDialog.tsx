import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { deleteFacility } from "../../../redux/slices/facilitySlice";

interface DeleteFacilityDialogProps {
  facility: any;
  onDelete?: () => void;
}

const DeleteFacilityDialog: React.FC<DeleteFacilityDialogProps> = ({
  facility,
  onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (!loading) setOpen(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await dispatch(deleteFacility({ id: facility.facility_id }));
    setLoading(false);
    setOpen(false);
    onDelete?.();
  };

  return (
    <>
      <Button variant="outlined" color="error" size="small" onClick={handleClickOpen}>
        Delete
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-facility-dialog-title"
      >
        <DialogTitle id="delete-facility-dialog-title">
          {"Confirm Deletion?"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete - {facility.facility_id} -{" "}
            {facility.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            autoFocus
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteFacilityDialog;
