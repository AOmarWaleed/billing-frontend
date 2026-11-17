import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  encodedData: string;
  encodingType?: "base64" | "binary";
  fileName: string;
}

export default function PDFViewer({ encodedData, encodingType = "base64", fileName }: PDFViewerProps) {
  const [pdfData, setPdfData] = useState<{ data: Uint8Array } | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    setPageNumber(1);
    setDownloadUrl(null);

    try {
      let decodedData: string;
      if (encodingType === "base64") {
        decodedData = atob(encodedData);
      } else {
        decodedData = encodedData;
      }

      const buffer = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++) {
        buffer[i] = decodedData.charCodeAt(i);
      }

      setPdfData({ data: buffer });
      setError(null);

      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err: any) {
      setError(err.message);
    }
  }, [encodedData, encodingType]);

  function onDocumentLoadSuccess({ numPages }: PDFDocumentProxy) {
    setNumPages(numPages);
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ textAlign: "center" }}>
      {pdfData && (
        <>
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => setError(err.message)}
          >
            <Page pageNumber={pageNumber} width={700} />
          </Document>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 2 }}>
            <IconButton
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography>
              Page {pageNumber} of {numPages ?? "?"}
            </Typography>
            <IconButton
              disabled={pageNumber >= (numPages ?? 0)}
              onClick={() =>
                setPageNumber((prev) =>
                  numPages ? Math.min(prev + 1, numPages) : prev
                )
              }
              size="small"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {downloadUrl && (
            <Button
              href={downloadUrl}
              download={`file-${fileName}`}
              variant="contained"
              sx={{ mt: 1 }}
            >
              Download PDF
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
