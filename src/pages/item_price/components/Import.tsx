import { Button, Modal, Backdrop, LinearProgress, Box, Typography } from "@mui/material";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import api from "../../../utils/Api";

interface ImportProps {
  selectedChangeDate: string;
  page: number;
  fetchData: (page: number) => void;
  currentPayerOption1: string | null;
  currentPriceListId: string | null;
  label:string
}

const Import: React.FC<ImportProps> = ({
  selectedChangeDate,
  page,
  fetchData,
  currentPayerOption1,
  currentPriceListId,
  label
}) => {
  const [loading, setLoading] = useState(false); // Loading state
  const [progress, setProgress] = useState(0); // Progress percentage
  const [controller, setController] = useState<AbortController | null>(null);


  const handleImport = async () => {
    if (controller) {
      controller.abort(); // Abort any existing request before making a new one
    }
  
    const abortController = new AbortController(); // Create a new AbortController
    setController(abortController); // Store it in state before the request starts

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx, .xls";

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        setLoading(true); // Show loading screen
        setProgress(0); // Reset progress bar

        try {
          const binaryStr = e.target.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          // Chunk data into smaller parts
          const chunkSize = 200;
          const totalChunks = Math.ceil(jsonData.length / chunkSize);

          

          for (let i = 0; i < totalChunks; i++) {
            const chunk = jsonData.slice(i * chunkSize, (i + 1) * chunkSize);

            try {
              const result = await api.post(
                `item_prices/import-excel?change_date=${selectedChangeDate}&payer_id=${currentPayerOption1}&price_list_id=${currentPriceListId}`,
                chunk,
                {
                  signal: abortController.signal, // Ensure this is passed correctly
                }
                
              );

              toast.info(`Updated ${result.data.updatedItems} Items | Skipped ${result.data.skippedItems} Items`)

              // Update progress percentage
              setProgress(((i + 1) / totalChunks) * 100);
            } catch (error: any) {
              console.error("Error importing data:", error);
              toast.error(`Error importing data: ${error.response?.data?.message || error.message}`);
              break; // Stop further execution if an error occurs
            }
          }

          fetchData(page);
        } finally {
          setLoading(false); // Hide loading screen after completion
          setController(null);
        }
      };

      reader.readAsBinaryString(file);
    };

    input.click();
  };

  const handleCancel = async() => {
    if (controller) {
      controller.abort(); // Abort the request
      setLoading(false);
      setController(null);
    }

    try {
        await api.post(`item_prices/abort-import-excel?payer_id=${currentPayerOption1}`);
        toast.error("Cancelled importing Prices")
        setOpenCancel(false)

    } catch (error) {
        console.error("Error aborting import process:", error);
        alert("Failed to abort process.");
    }
  };


  // cancel import modal
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const [openCancel, setOpenCancel] = useState(false);
  const handleOpenCancel = () => setOpenCancel(true);
  const handleCloseCancel = () => setOpenCancel(false);

  return (
    <div>
      <Button variant="contained" color="primary" size="small" onClick={handleImport} sx={{ whiteSpace: "nowrap" }}>
        {label}
      </Button>

      {/* Loading screen */}
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <Box sx={{ width: "50%", textAlign: "center", bgcolor: "white", p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color:"red" }}>Importing Data...</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          <Typography variant="body2" sx={{ mt: 1, color:"red" }}>{Math.round(progress)}% Completed</Typography>
          <Box sx={{display: "flex", gap: 3, mt: 2}}>

          <Box sx={{display: "flex", gap: 3, mt: 2}}>
            <Button onClick={handleOpenCancel} variant="contained" color="error">Cancel Import?</Button>
            <Modal
              open={openCancel}
              onClose={handleCloseCancel}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Are you sure you want to cancel the import?
                </Typography>
                <Box sx={{display: "flex", gap: 3, mt: 3}}>
                  <Button variant='contained' color='secondary' onClick={handleCancel}>Yes, Cancel Import</Button>
                  <Button variant='contained' color='error' onClick={handleCloseCancel}>No, Don't cancel</Button>
                </Box>

              </Box>
            </Modal>
          </Box>
            

          </Box>
        </Box>
      </Backdrop>
    </div>
  );
};

export default Import;
