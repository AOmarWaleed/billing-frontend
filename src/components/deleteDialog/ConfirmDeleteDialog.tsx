import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  title: string;
  message: string;
  errorMsg: string | null;
  loading?: boolean;
}
const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  errorMsg,
  loading = false,
}) => {
  return (
    <>
      {/* ✅ Hidden element outside the Dialog to store values */}
      <div
        id="delete-dialog-props"
        data-title={title}
        data-message={message}
        style={{ display: "none" }}
      ></div>

      <Dialog
        disableEscapeKeyDown
        open={open}
      
        onClose={(event, reason) => reason !== "backdropClick" && onClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle sx={{p : 1}}>
          <Typography
            // id="alert-dialog-title"
            variant="h6"
            component="h2"
            data-title={title}
          >
            {title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{p : 1}}>
         
            <Typography>{errorMsg ? errorMsg : message}</Typography>
        </DialogContent>
        <DialogActions>
          {errorMsg ? (
            <div>
              <Button variant="contained" onClick={onClose} color="primary">
                Close
              </Button>
            </div>
          ) : (
            <Box sx={{display : "flex" , gap :1}}>
              <Button variant="contained" onClick={onClose} color="primary">
                No
              </Button>
              <Button variant="contained" onClick={onConfirm}  color="error" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Yes"}
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
export default ConfirmDeleteDialog;
