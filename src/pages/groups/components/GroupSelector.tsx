import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { LdapGroup } from "../../../types/LdapGroup";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { GridSearchIcon } from "@mui/x-data-grid";

type Props = {
  data: LdapGroup[];
  onImport: (selectedGroups: LdapGroup[]) => void;
  onClose: () => void;
};

const DESCRIPTION_PREVIEW_LENGTH = 30;

const GroupSelector: React.FC<Props> = ({ data, onImport, onClose }) => {
  const [selectedGroups, setSelectedGroups] = useState<LdapGroup[]>([]);
  const [visibleDescriptions, setVisibleDescriptions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleGroupSelection = (group: LdapGroup) => {
    setSelectedGroups((prev) =>
      prev.find((g) => g.name === group.name)
        ? prev.filter((g) => g.name !== group.name)
        : [...prev, group],
    );
  };

  const toggleDescription = (groupName: string) => {
    setVisibleDescriptions((prev) =>
      prev.includes(groupName)
        ? prev.filter((name) => name !== groupName)
        : [...prev, groupName],
    );
  };

  const handleImport = () => {
    if (selectedGroups.length > 0) {
      onImport(selectedGroups);
    }
  };

  const filteredData = data.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const renderPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5;

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);
      if (left > 2) pages.push("...");

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // const renderDescription = (group: LdapGroup) => {
  //   const full = group.description || "";
  //   const isExpanded = visibleDescriptions.includes(group.name);
  //   const short = full.slice(0, DESCRIPTION_PREVIEW_LENGTH);

  //   if (!full) return null;

  //   return (
  //     <div style={{ marginLeft: "auto", fontStyle: "italic", color: "#ccc", textAlign: "right", wordBreak: "break-word" }}>
  //       {isExpanded ? full : `${short}${full.length > DESCRIPTION_PREVIEW_LENGTH ? "..." : ""}`}

  //       {full.length > DESCRIPTION_PREVIEW_LENGTH && (
  //         <Button onClick={() => toggleDescription(group.name)} size="small" variant="text" style={{ marginLeft: "10px", color: "#ffcc00", textTransform: "none" }}>
  //           {isExpanded ? "Less" : "More"}
  //         </Button>
  //       )}
  //     </div>
  //   );
  // };

  const renderDescription = (group: LdapGroup) => {
    const full = group.description || "";
    const expanded = visibleDescriptions.includes(group.name);

    if (!full) return null;

    const short =
      full.length > DESCRIPTION_PREVIEW_LENGTH
        ? `${full.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
        : full;

    return (
      <>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.25,
            pr: 4,
            fontStyle: "italic",
            wordBreak: "break-word",
          }}
        >
          {expanded ? full : short}
        </Typography>
      </>
    );
  };

  const selectAll = () => {
    setSelectedGroups((prev) => {
      const existingNames = new Set(prev.map((g) => g.name));

      const groupsToAdd = filteredData.filter(
        (group) => !existingNames.has(group.name),
      );

      return [...prev, ...groupsToAdd];
    });
  };

  const clearSelection = () => {
    setSelectedGroups([]);
  };

  const remainingToSelect = filteredData.filter(
    (group) => !selectedGroups.some((selected) => selected.name === group.name),
  );

  const allFilteredSelected = remainingToSelect.length === 0;

  return (
    <div>
      {/* <TextField
        placeholder="Search groups"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset to first page on search
        }}
        style={{
          marginBottom: "20px",
          backgroundColor: "#fff",
          borderRadius: "5px",
        }}
      /> */}

      <TextField
        fullWidth
        placeholder="Search groups"
        value={searchTerm}
        type="search"
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <GridSearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="body2" color="text.secondary">
          {selectedGroups.length} selected
        </Typography>

        <div>
          <Button
            size="small"
            onClick={selectAll}
            disabled={allFilteredSelected}
          >
            Select All ({remainingToSelect.length})
          </Button>

          {selectedGroups.length > 0 && (
            <Button size="small" color="error" onClick={clearSelection}>
              Clear ({selectedGroups.length})
            </Button>
          )}
        </div>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* {paginatedData.map((group, idx) => {
        const selected = selectedGroups.find((g) => g.name === group.name);
        const showDescription = visibleDescriptions.includes(group.name);

        return (
          <div key={group.name + idx} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={!!selected}
                onChange={() => toggleGroupSelection(group)}
                style={{ marginRight: "10px" }}
              />
              <span style={{ flexShrink: 0 }}>{group.name}</span>

              {group.description && (
                <Button onClick={() => toggleDescription(group.name)} size="small" variant="text" style={{ marginLeft: "10px", color: "yellow" }}>
                  {showDescription ? "Hide Description" : "Show Description"}
                  {showDescription ? "Hide Description" : "Show Description"}
                </Button>
              )} 
              {renderDescription(group)}
            </div>

            {showDescription && <div style={{ marginLeft: "30px", marginTop: "5px", fontStyle: "italic", color: "#cccccc" }}>{group.description}</div>}
          </div>
        );
      })} */}

      <List
        sx={{
          maxHeight: 420,
          overflow: "auto",
          pt: 0,
        }}
      >
        {paginatedData.map((group) => {
          const selected = selectedGroups.some((g) => g.name === group.name);

          return (
            <React.Fragment key={group.name}>
              <ListItem
                alignItems="flex-start"
                onClick={() => toggleDescription(group.name)}
                secondaryAction={
                  group.description?.length > DESCRIPTION_PREVIEW_LENGTH && (
                    <IconButton edge="end">
                      {visibleDescriptions.includes(group.name) ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </IconButton>
                  )
                }
                sx={{ p: 0, cursor: "pointer" }}
              >
                <Checkbox
                  checked={selected}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroupSelection(group);
                  }}
                />

                <ListItemText
                  primary={group.name}
                  secondary={renderDescription(group)}
                  slotProps={{
                    primary: {
                      fontWeight: 700,
                    },
                  }}
                />
              </ListItem>

              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>

      {/* Pagination controls */}
      {/* <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <span style={{ color: "#ffffff" }}>
          Page {currentPage} of {totalPages}
        </span>
        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div> */}
      {/* Pagination with Previous / Next buttons and numbered pages */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* <Button
          variant="outlined"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          style={{ minWidth: "60px", backgroundColor: "#f0f0f0" }}
        >
          Previous
        </Button>  */}

        {/* {renderPageNumbers().map((item, idx) =>
          item === "..." ? (
            <span key={"ellipsis-" + idx} style={{ padding: "8px", color: "#aaa" }}>
              ...
            </span>
          ) : (
            <Button
              key={item}
              variant={currentPage === item ? "contained" : "outlined"}
              color="primary"
              onClick={() => handlePageChange(item as number)}
              style={{
                minWidth: "36px",
                padding: "6px",
                backgroundColor: currentPage === item ? undefined : "#f0f0f0",
                color: currentPage === item ? "#fff" : "#000",
              }}>
              {item}
            </Button>
          )
        )} */}

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            page={currentPage}
            count={totalPages}
            color="primary"
            onChange={(_, page) => handlePageChange(page)}
            showFirstButton
            showLastButton
          />
        </Box>

        {/* <Button
          variant="outlined"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          style={{ minWidth: "60px", backgroundColor: "#f0f0f0" }}
        >
          Next
        </Button> */}
      </div>

      {/* <Button
        onClick={handleImport}
        variant="contained"
        color="primary"
        style={{ marginTop: "20px" }}
      >
        Import Selected Groups
      </Button> */}

      <Divider />

      <DialogActions
        sx={{
          gap: 1,
          pt: 2,
        }}
      >
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedGroups.length}
        >
          Import Selected Groups
        </Button>
      </DialogActions>
    </div>
  );
};

export default GroupSelector;
