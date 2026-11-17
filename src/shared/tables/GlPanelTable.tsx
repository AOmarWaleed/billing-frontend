import React, { createContext, useContext, useState } from "react";
import { Box, Grid2 as Grid, IconButton, Stack } from "@mui/material";
import GlFilterBtn from "./GlFilterBtn";

function GlPanelTableInternal({
  children,
  filterSection,
  showFilterIcon,
}: any) {
  const { openFilter } = useContext(TableContext);
  return (
    <>
      <Stack
        sx={{ py: showFilterIcon && filterSection ? 1 : 0 }}
        direction={"column"}
      >
        {showFilterIcon && (
          <Box>
            <GlFilterBtn />
          </Box>
        )}
        <Box >{showFilterIcon ? (openFilter && filterSection) : filterSection}</Box>
      </Stack>

        
      {children}
    </>
  );
}

export default function GlPanelTable({
  children,
  filterSection,
  showFilterIcon = false,
}: {
  children: React.ReactNode;
  filterSection?: React.ReactNode;
  showFilterIcon?: boolean;
}) {
  return (
    <TableContextProvider>
      <GlPanelTableInternal
        showFilterIcon={showFilterIcon}
        filterSection={filterSection}
      >
        {children}
      </GlPanelTableInternal>
    </TableContextProvider>
  );
}

export const TableContext = createContext<any>(0);
function TableContextProvider({ children }: { children: React.ReactNode }) {
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <TableContext.Provider value={{ openFilter, setOpenFilter }}>
      {children}
    </TableContext.Provider>
  );
}
