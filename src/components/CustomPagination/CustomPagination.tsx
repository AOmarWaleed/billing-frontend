import { TextField, Box, Button, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {  debounce } from "lodash";
import { useAppSelector } from "../../hooks/hooks";
import { createResourceHelpers } from "../../utils/resourceMapping/createResourceHelpers";
import { useTranslation } from "react-i18next";

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  limit?: number;
  setLimit?: (value: number) => void;
  onPageChange: (page: number, limit?: number) => void;
  isLoading?: boolean;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({ 
  totalPages, 
  currentPage, 
  limit, 
  setLimit, 
  onPageChange,
  isLoading = false
}) => {
  const { direction } = useSelector((state: RootState) => state.theme);

  //==================  * Resources * ===================
  const  {t} = useTranslation('9');
  // const { resource } = useAppSelector((state) => state.trans);
  // const { t, getDisable } = useMemo(() => 
  //   createResourceHelpers(resource.resources), 
  //   [resource.resources]
  // );
  //==================  * Resources * ===================
  
  const [inputPage, setInputPage] = useState(currentPage.toString());
  const [inputSize, setInputSize] = useState(limit?.toString());

  // Memoize text values to prevent recalculating on every render
  const pageText =  t("179") || "PAGE";
  const ofText =  t("180") || "OF";
  const rowsPerPageText =  t("181") || "ROWS PER PAGE";

  // Debounced page change function with useCallback to maintain reference
  const debouncedPageChange = useCallback(
    debounce((page: number, size?: number) => {
      onPageChange(page, size);
    }, 300),
    [onPageChange]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedPageChange.cancel();
    };
  }, [debouncedPageChange]);

  const handleInputPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(event.target.value);
  }, []);

  const handleInputPageSubmit = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isLoading) {
      const pageNumber = Number(inputPage);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        debouncedPageChange(pageNumber);
      } else {
        setInputPage(currentPage.toString());
      }
    }
  }, [inputPage, isLoading, totalPages, debouncedPageChange, currentPage]);

  const handleInputSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSize(event.target.value);
  }, []);

  const handleInputSizeSubmit = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isLoading) {
      const sizeNumber = Number(inputSize);
      if (!isNaN(sizeNumber) && sizeNumber >= 1) {
        handleSizeChange(sizeNumber);
      } else {
        setInputSize(limit?.toString());
      }
    }
  }, [inputSize, isLoading, limit]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !isLoading) {
      debouncedPageChange(page);
    }
  }, [totalPages, isLoading, debouncedPageChange]);

  const handleSizeChange = useCallback((size: number) => {
    if (!isNaN(size) && size >= 1 && !isLoading) {
      setLimit && setLimit(size);
      // Reset to first page when changing page size
      debouncedPageChange(1, size);
    }
  }, [isLoading, setLimit, debouncedPageChange]);

  // Update input values when props change
  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    setInputSize(limit?.toString());
  }, [limit]);

  // Memoize button styles to prevent recreation on every render
  const buttonStyles = useMemo(() => ({
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    minWidth: "30px",
    padding: 0,
    transition: "all 0.2s ease",
    '&:disabled': {
      opacity: 0.5
    }
  }), []);

  const iconButtonStyles = useMemo(() => [
    { 
      color: "#2764AF",
      transition: "opacity 0.2s ease, transform 0.2s ease"
    }, 
    direction === "rtl" ? { transform: "rotate(180deg)" } : {}
  ], [direction]);

  const contentContainerStyles = useMemo(() => ({
    opacity: isLoading ? 0.7 : 1, 
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  }), [isLoading]);

  return (
    <Box display="flex" alignItems="center" gap={0.2}>
      {/* {currentPage} */}
      {/* First Page Button */}
      <IconButton 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1 || isLoading} 
        size="small" 
        sx={iconButtonStyles}
      >
        <FirstPageIcon />
      </IconButton>

      {/* Previous Page Button */}
      <IconButton 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1 || isLoading} 
        size="small" 
        sx={iconButtonStyles}
      >
        <KeyboardArrowLeftIcon />
      </IconButton>

      <Box sx={contentContainerStyles}>
        {currentPage != 1 && "..."}
        {currentPage > 1 && (
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={isLoading}
            sx={buttonStyles}>
            {currentPage - 1}
          </Button>
        )}

        {/* Current Page */}
        <Button
          variant="contained"
          disabled={isLoading}
          sx={{
            ...buttonStyles,
            '&:disabled': {
              opacity: 0.7
            }
          }}>
          {currentPage}
        </Button>

        {/* Next Page (if exists) */}
        {currentPage < totalPages && (
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={isLoading}
            sx={buttonStyles}>
            {currentPage + 1}
          </Button>
        )}

        {currentPage != totalPages && "..."}
      </Box>

      {/* Next Page Button */}
      <IconButton
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        size="small"
        sx={iconButtonStyles}>
        <KeyboardArrowRightIcon />
      </IconButton>

      {/* Last Page Button */}
      <IconButton
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages || isLoading}
        size="small"
        sx={iconButtonStyles}>
        <LastPageIcon />
      </IconButton>

      <Typography sx={{ 
        mr: "5px", 
        opacity: isLoading ? 0.7 : 1, 
        transition: 'opacity 0.3s ease' 
      }}>
        {pageText}
      </Typography>

      {/* Jump to Page Input */}
      <TextField
        type="number"
        variant="outlined"
        value={inputPage}
        onChange={handleInputPageChange}
        onKeyUp={handleInputPageSubmit}
        inputProps={{ 
          min: 1, 
          max: totalPages,
          disabled: isLoading
        }}
        disabled={isLoading}
        size="small"
        sx={{ 
          width: 50, 
          "& input": { color: "" },
          "& .Mui-disabled": {
            opacity: 0.7
          }
        }}
      />

      <span
        style={{
          marginLeft: "5px",
          marginInlineEnd: "50px",
          display: "flex",
          gap: "5px",
          alignItems: "center",
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}>
        <span>
          {ofText}
        </span>{" "}
        <span>{totalPages === 0 ? 1 : totalPages}</span>
      </span>

      {limit && setLimit && (
        <>
          <Typography sx={{ 
            mr: "5px", 
            opacity: isLoading ? 0.7 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            {rowsPerPageText}{" "}
          </Typography>

          <TextField
            type="number"
            variant="outlined"
            value={inputSize}
            onChange={handleInputSizeChange}
            onKeyUp={handleInputSizeSubmit}
            inputProps={{ 
              min: 1,
              disabled: isLoading
            }}
            disabled={isLoading}
            size="small"
            sx={{ 
              width: 50, 
              "& input": { color: "" },
              "& .Mui-disabled": {
                opacity: 0.7
              }
            }}
          />
        </>
      )}
    </Box>
  );
};

export default React.memo(CustomPagination);