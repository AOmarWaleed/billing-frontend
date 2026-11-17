import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import {
  Typography,
  Stack,
  Divider,
  TextField,
  Box,
  SelectChangeEvent,
  Autocomplete,
} from "@mui/material";
import { TypeList } from "../../../types/TypeList";
import { CodeTypeDTO } from "../../../types/CodeTypeDTO";
import { SelectOption } from "../../../types/selectOpion";
import { useTranslation } from "react-i18next";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";

interface Row {
  description: string;
  code_type: number | string; // Allow string for temporary IDs
  linked_type: string;
  linked_description: string;
  isEditing?: boolean; // Optional flag to indicate edit mode
}

interface CustomRowCodeTypeProps {
  row: Row;
  isInEditMode: boolean;
  data: CodeTypeDTO;
  isNew?: boolean; // Optional flag to indicate a new row
  handleChange: (
    event: ChangeEvent<HTMLInputElement> | SelectChangeEvent<number>
  ) => void; // Callback for field changes
  types?: TypeList[];
}

const CustomRowCodeType: React.FC<CustomRowCodeTypeProps> = ({
  row,
  isInEditMode,
  data,
  isNew,
  handleChange,
  types = [],
}) => {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;



  //==================  * Resources * ===================


  //==================  * Resources * ===================
  // Filter out the current row's ID from the types
  const filteredTypes = types.filter(
    (type) => type.code_type !== data.code_type
  );
  const codeTypeOptions = filteredTypes.map((type) => ({
    label: `${type.code_type} - ${type.description}`,
    id: type.code_type,
  }));
  // Initialize selectedLinked based on data.linked_type
  const [selectedLinked, setSelectedLinked] = useState<string>();
  const [desc, setDesc] = useState<string>();
  const [selectedLinkedOption, setSelectedLinkedOption] =
    useState<SelectOption | null>();
  const handleChangeWrapper = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value; // Extract the value from the event

    // Call setDesc to update the state
    setDesc(value);

    // Call the original handleChange function
    handleChange(event);
  };

  useEffect(() => {
    if (row) {
      setDesc(row.description);
      setSelectedLinked(row.linked_description);
      if (row.linked_type) {
        const mappedSubData: SelectOption = {
          id: row.linked_type,
          label: row.linked_description,
        };
        setSelectedLinkedOption(mappedSubData);
      }
    }
  }, []);

  return (
    <>
      <Box

      >
        {isInEditMode ? (
          <>
            <Box sx={{ padding: '0px 5px' }}>
              <Stack
                direction="column"
                divider={<Divider orientation="vertical" />}
                spacing={1}
                //sx={{ overflow: 'hidden', flexWrap: 'nowrap' }}
                sx={{ overflow: "visible", flexWrap: "nowrap" }} // Ensure overflow is visible
              >
                {/* Code Type Field */}
                <Typography style={{ flex: 2, color: "GrayText" }}>
                  {t("codetype_8_CodeType") || "Code Type:"}{" "}
                  {isNew ? (
                    <TextField
                      name="code_type"
                      id="codeType"
                      placeholder={t("codetype_8_CodeType")}
                      value={data.code_type}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    row.code_type
                  )}
                </Typography>

                {/* Description Field */}
                <Typography sx={{ flex: 2, color: "GrayText" }}>
                  {t("codetype_8_DescriptionColon") || "Description:"}{" "}
                  <TextField
                    name="description"
                    id="description"
                    value={desc}
                    onChange={handleChangeWrapper}
                    size="small"
                    fullWidth
                  />
                </Typography>
              </Stack>

              {/* Linked Type Field */}
              <Typography
                style={{
                  flex: 2,
                  color: "GrayText",
                  position: "relative",
                  zIndex: 9999,
                }}
              >
                <div style={{ position: "relative", zIndex: 9999 }}>
                  {t("codetype_8_LinkedType") || "Linked Type:"}{" "}
                  <Autocomplete
                    id="linked_type"
                    options={codeTypeOptions}
                    //getOptionLabel={(option) => `${option.id} , ${option.label}`}

                    inputValue={selectedLinked || ""}
                    onInputChange={(event, newInputValue) => {
                      setSelectedLinked(newInputValue ? newInputValue : "");
                    }}
                    value={selectedLinkedOption || null}
                    onChange={(
                      event,
                      newValue: { label: string; id: number } | null
                    ) => {
                      setSelectedLinkedOption(newValue);
                      handleChange({
                        target: {
                          name: "linked_type",
                          value: newValue ? newValue.id : null,
                        },
                      });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                    sx={{ width: "100%" }}
                  />
                </div>
              </Typography>
            </Box>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            width="100%"
            gap={1}
            px={1}
            py={0}
            sx={{ minHeight: 0 }}
          >
            <Box
              display="flex"
              flexDirection="column"
              gap={0}
              flex={1}
              minWidth={0}
            >
              {/* Row 1: Code Type + Description */}
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: 12 }}
                >
                  {row.code_type} - {row.description}
                </Typography>
              </Box>

              {/* Row 2: Linked Type + Linked Description */}
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 11 }}
                >
                  {t("codetype_8_LinkedType") || "Linked Type:"}{" "}
                  {row.linked_type || "-"}
                </Typography>
                {row.linked_description ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 11 }}
                  >
                    {row.linked_description}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default CustomRowCodeType;
