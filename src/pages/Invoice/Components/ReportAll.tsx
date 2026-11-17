import React, { useContext, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../../../utils/Api";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
interface Invoice {
  invoice_id: string;
}

interface ReportAllProps {
  invoiceRows: Invoice[];
}

export default function ReportAll({ invoiceRows }: ReportAllProps) {
  const { t, formatString } = useContext(AuthGuardContext);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const isCancelled = useRef(false);
  const paused = useRef(false);

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    handleStart();
  };

  const handleStart = () => {
    setOpen(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setIsProcessing(true);
    isCancelled.current = false;
    paused.current = false;
    sendReports(0);
  };

  const sendReports = async (startIndex: number) => {
    for (let i = startIndex; i < invoiceRows.length; i++) {
      if (isCancelled.current) break;

      if (paused.current) {
        setIsPaused(true);
        return;
      }

      const row = invoiceRows[i];
      try {
        await api.get(`/api/invoiceReport/report/${row.invoice_id}`);
        setSuccessCount((prev) => prev + 1);
      } catch (err) {
        console.error(`Failed invoice ${row.invoice_id}`, err);
        setErrorCount((prev) => prev + 1);
      }

      setProgress((prev) => prev + 1);
    }

    setIsProcessing(false);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      paused.current = false;
      setIsPaused(false);
      setIsProcessing(true);
      sendReports(progress);
    } else {
      paused.current = true;
    }
  };

  const handleCancel = () => {
    isCancelled.current = true;
    setIsProcessing(false);
    setIsPaused(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setOpen(false);
    }
  };

  return (
    <>
      <Secure.GLGenericButton
        resource_key="inovices_22_reportAll"
        variant="contained"
        color="primary"
        startIcon={<AssessmentIcon />}
        onClick={handleOpenConfirm}
        disabled={!invoiceRows.length}
      >
        {t("inovices_22_reportAll")} {invoiceRows.length}
      </Secure.GLGenericButton>

      {/* ✅ Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Reporting</DialogTitle>
        <DialogContent>
          <Secure.GLTypography resource_key="inovices_22_areYouSureReportAllText">
            {formatString(t("inovices_22_areYouSureReportAllText"), {
              length: invoiceRows.length,
            })}
          </Secure.GLTypography>
        </DialogContent>
        <DialogActions>
          <Secure.GLButton
            resource_key="inovices_22_cancel"
            onClick={() => setConfirmOpen(false)}
            color="inherit"
          />
          <Secure.GLButton
            resource_key="inovices_22_yesProceed"
            onClick={handleConfirm}
            variant="contained"
            color="primary"
          />
        </DialogActions>
      </Dialog>

      {/* 📊 Main Progress Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {isProcessing
            ? isPaused
              ? t("inovices_22_reportingPaused")
              : t("inovices_22_reportingInvoices")
            : t("inovices_22_reportingCompleted")}
        </DialogTitle>

        <DialogContent>
          <Box display="flex" alignItems="center" mb={2}>
            {isProcessing && !isPaused && (
              <CircularProgress color="error" size={20} sx={{ mr: 2 }} />
            )}
            {isPaused && <PauseIcon sx={{ mr: 2 }} color="error" />}
            <Secure.GLTypography resource_key="inovices_22_progressLengthProcessed">
              {formatString(t("inovices_22_progressLengthProcessed"), {
                progress,
                length: invoiceRows.length,
              })}
            </Secure.GLTypography>
          </Box>

          <TableContainer
            component={Box}
            sx={{
              maxHeight: 400,
              overflow: "auto",
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <Secure.GLTableCell resource_key="inovices_22_reported" />
                  <Secure.GLTableCell resource_key="inovices_22_error" />
                  <Secure.GLTableCell resource_key="inovices_22_total" />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <Secure.GLTableCell resource_key="inovices_22_reported">
                    <Typography variant="body2">{successCount}</Typography>
                  </Secure.GLTableCell>
                  <Secure.GLTableCell resource_key="inovices_22_error">
                    <Typography variant="body2">{errorCount}</Typography>
                  </Secure.GLTableCell>
                  <Secure.GLTableCell resource_key="inovices_22_total">
                    <Typography variant="body2">
                      {successCount + errorCount}
                    </Typography>
                  </Secure.GLTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          {isProcessing ? (
            <>
              <Secure.GLButton
                resource_key="inovices_22_resume"
                onClick={handlePauseResume}
                variant="contained"
                startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
              >
                {isPaused ? t("inovices_22_resume") : t("inovices_22_pause")}
              </Secure.GLButton>
              <Secure.GLButton
                resource_key="inovices_22_cancelReportAll"
                onClick={handleCancel}
                variant="contained"
                startIcon={<CancelIcon />}
                color="error"
              />
            </>
          ) : (
            <Secure.GLButton
              resource_key="inovices_22_closeReportAll"
              variant="contained"
              onClick={handleClose}
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
