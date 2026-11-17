import { Box, Tooltip } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

const renderTruncatedCell = (params: GridRenderCellParams) => {
  const value = params.value == null ? "-" : String(params.value);

  return (
    <Tooltip title={value}>
      <Box
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        {value}
      </Box>
    </Tooltip>
  );
};

export default renderTruncatedCell;
