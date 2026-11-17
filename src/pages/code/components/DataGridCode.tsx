import {
  GridToolbar,
  GridPaginationModel,
  GridColDef,
  GridRowId,
  GridRowModesModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
// MUI ICONS
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import * as React from "react";
import { publicUrl } from "../../../utils/publicUrl";
import {
  useState,
  useRef,
  ChangeEvent,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCodeDataByCodeType,
  deleteCodeData,
  clearError,
} from "../../../redux/slices/CodeDataSlice";

import { CodeData } from "../../../types/CodeData";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  Alert,
  Box,
  IconButton,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DisplayMsgDialog } from "@givc/shared-components";
import { CodeDataDTO } from "../../../types/CodeDataDTO";
import CustomFormCodeData from "./CustomFormCodeData";
import { setSelectedItem } from "../../../redux/slices/CodeDataSlice";
import { grey } from "@mui/material/colors";
import useStyles from "../../../assets/css/useStyles";
import { CodeDataFilter } from "../../../types/CodeDataFilter";
import GenericDialog from "../../../components/genericDialog/GenericDialog";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import { apiUtility } from "../../../utils/apiUtility";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import { Secure as GalaxySecure } from "@givc/shared-components";
import CustomToolbar from "../../../components/customToolbar/CustomToolbar";
import { Add } from "@mui/icons-material";
import { Autocomplete, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { GLGridColDef } from "../../users/components/UserFacilitySection";
import { fetcher } from "../../../utils/Api";

// export const ArrayTextField = ({
//   name,
//   value,
//   onChange,
//   label
// }: {
//   name: string;
//   value: string[];
//   onChange: (name: string, value: string[]) => void;
//   label: string;
// }) => {
//   const [inputValue, setInputValue] = useState(value?.join(', ') || '');

//   const handleBlur = () => {
//     const arrayValue = inputValue
//       .split(',')
//       .map(item => item.trim())
//       .filter(item => item !== '');
//     onChange(name, arrayValue);
//   };

//   return (
//     <TextField
//       name={name}
//       value={inputValue}
//       onChange={(e) => setInputValue(e.target.value)}
//       onBlur={handleBlur}
//       size="small"
//       fullWidth
//       label={label}
//       placeholder="Enter comma-separated values"
//       // helperText="Enter comma-separated values"
//     />
//   );
// };

export const ChipArrayInput = ({
  value = [],
  onChange,
  label,
  placeholder = "Enter value",
}: {
  value?: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleDelete = (itemToDelete: string) => {
    onChange(value.filter((item) => item !== itemToDelete));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          label={label}
        />
        <IconButton
          color="primary"
          onClick={handleAdd}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            height: 40,
            width: 40,
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {value.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
          {value.map((item, index) => (
            <Chip
              key={index}
              label={item}
              onDelete={() => handleDelete(item)}
              deleteIcon={<CloseIcon />}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {/* {value.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          No items added. Type and click + or press Enter to add items.
        </Typography>
      )} */}
    </Box>
  );
};



function truncateTextByWords(text: string, maxWords = 20) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "…"
    : text;
}

type CustomGridColDef = GridColDef & {
  id?: string;
  name?: string;
  resource_key: string;
};

const initialData: CodeData = {
  code: 0,
  user_code: "",
  description: "",
  linked_code: null,
  sub_code_type: null,
  linked_description: "",
  code_type: 0,
  sub_type_description: "",
  cat_code: [],
  col_1: "",
  col_2: "",
  col_3: "",
};

const initialFilters: CodeDataFilter = {
  // code:0,
  // code_type:0,
  code: "",
  user_code: "",
  description: "",
  linked_user_code: "",
  linked_code: null,
  linked_description: "",
  sub_code_type: null,
  sub_type_description: "",
  cat_code: [],
};
const DataGridCode = () => {
  const {
    palette: { mode },
  } = useTheme();
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const [isFilterOn, setIsFilterOn] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const codeTypeRef = useRef<(() => void) | null>(null);
  const selectedCodeItem = useSelector(
    (state: RootState) => state.codetypes.selectedItem,
  );

  const columns = useMemo(
    (): GLGridColDef[] => [
      {
        field: "code",
        headerName: "Code",
        permission: "code_8_code",
        uiText: "code_8_code",
        // flex: 2,
        width: 90,
      },
      {
        field: "user_code",
        headerName: "User Code",
        permission: "code_8_userCode",
        uiText: "code_8_userCode",
        // flex: 3,
        width: 190,
        // renderHeader: () => (
        //   <div>
        //     {!isFilterOn && <span>{t("codetype_8_UserCode")}</span>}
        //     {isFilterOn && (
        //       <div onClick={(e) => e.stopPropagation()}>
        //         <TextField
        //           variant="outlined"
        //           sx={{
        //             mr: "10px",
        //             borderRadius: 2,
        //             alignSelf: "center",
        //             "& input": { padding: "7px 10px !important" },
        //             "& input::placeholder": {
        //               fontSize: "12px",
        //               opacity: 0.5,
        //             },
        //             height: "80%",
        //             bgcolor: (theme) =>
        //               theme.palette.mode === "light" ? "#fff" : grey[800],
        //           }}
        //           size="small"
        //           className={classes.columnFilter}
        //           placeholder={t("codetype_8_UserCode") || "User Code"}
        //           type="text"
        //           name="user_code"
        //           value={filters.user_code}
        //           onChange={handleFiltersChange}
        //         />
        //       </div>
        //     )}
        //   </div>
        // ),
        filterable: true,
        // renderCell(params) {
        //   return (
        //     <span style={{}}>{params.row.user_code}</span>
        //   );
        // },
      },
      {
        field: "linked_user_code",
        permission: "code_8_linkedUserCode",
        uiText: "code_8_linkedUserCode",
        headerName: "Linked User Code",

        width: 190,
        // flex: 2,
        // renderHeader: () => (
        //   <div>
        //     {!isFilterOn && <span>{t("codetype_8_LinkedUserCode")}</span>}
        //     {isFilterOn && (
        //       <div onClick={(e) => e.stopPropagation()}>
        //         <TextField
        //           variant="outlined"
        //           sx={{
        //             mr: "10px",
        //             borderRadius: 2,
        //             alignSelf: "center",
        //             "& input::placeholder": {
        //               fontSize: "12px",
        //               opacity: 0.5,
        //             },
        //             "& input": { padding: "7px 10px !important" },
        //             height: "80%",
        //             bgcolor: (theme) =>
        //               theme.palette.mode === "light" ? "#fff" : grey[800],
        //           }}
        //           size="small"
        //           className={classes.columnFilter}
        //           placeholder={"Linked User Code"}
        //           type="text"
        //           name="linked_user_code"
        //           value={filters.linked_user_code}
        //           onChange={handleFiltersChange}
        //         />
        //       </div>
        //     )}
        //   </div>
        // ),
        // filterable: true,
        // renderCell(params) {
        //   return (
        //     <span style={{ paddingLeft: "15px" }}>
        //       {params.row.linked_user_code}
        //     </span>
        //   );
        // },
      },
      {
        field: "description",
        permission: "code_8_description",
        uiText: "generic_0_description",
        headerName: "Description",
        flex: 4,
        // renderHeader: () => (
        //   <div>
        //     {!isFilterOn && <span>{t("codetype_8_Description")}</span>}
        //     {isFilterOn && (
        //       <div onClick={(e) => e.stopPropagation()}>
        //         <TextField
        //           variant="outlined"
        //           sx={{
        //             mr: "10px",
        //             borderRadius: 2,
        //             alignSelf: "center",
        //             "& input": { padding: "7px 10px !important" },
        //             "& input::placeholder": {
        //               fontSize: "12px",
        //               opacity: 0.5,
        //             },
        //             height: "80%",
        //             bgcolor: (theme) =>
        //               theme.palette.mode === "light" ? "#fff" : grey[800],
        //           }}
        //           size="small"
        //           className={classes.columnFilter}
        //           placeholder={t("codetype_8_Description") || "Description"}
        //           type="text"
        //           name="description"
        //           value={filters.description}
        //           onChange={handleFiltersChange}
        //         />
        //       </div>
        //     )}
        //   </div>
        // ),
        // filterable: true,
        // renderCell(params) {
        //   return (
        //     <>
        //       {params.row.description.split(" ").length > 10 ? (
        //         <Tooltip title={params.row.description}>
        //           <span style={{ paddingLeft: "5px" }}>
        //             {truncateTextByWords(params.row.description, 10)}
        //           </span>
        //         </Tooltip>
        //       ) : (
        //         params.row.description
        //       )}
        //     </>
        //   );
        // },
      },
      {
        field: "linked_code",
        headerName: "Linked Code",
        permission: "code_8_linkedCode",
        uiText: "code_8_linkedCode",
        width: 100,
        // flex: 2,
        // renderHeader: () => (
        //   <div>
        //     {!isFilterOn && <span>{t("codetype_8_LinkedCode")}</span>}
        //     {isFilterOn && (
        //       <div onClick={(e) => e.stopPropagation()}>
        //         <TextField
        //           variant="outlined"
        //           sx={{
        //             mr: "10px",
        //             borderRadius: 2,
        //             alignSelf: "center",
        //             "& input": { padding: "7px 10px !important" },
        //             "& input::placeholder": {
        //               fontSize: "12px",
        //               opacity: 0.5,
        //             },
        //             height: "80%",
        //             bgcolor: (theme) =>
        //               theme.palette.mode === "light" ? "#fff" : grey[800],
        //           }}
        //           size="small"
        //           className={classes.columnFilter}
        //           placeholder={t("codetype_8_LinkedCode") || "Linked code"}
        //           type="text"
        //           name="linked_code"
        //           value={filters.linked_code}
        //           onChange={handleFiltersChange}
        //         />
        //       </div>
        //     )}
        //   </div>
        // ),
        // filterable: true,
        // renderCell(params) {
        //   return (
        //     <span style={{ paddingLeft: "15px" }}>
        //       {params.row.linked_code}
        //     </span>
        //   );
        // },
      },
      // {
      //   field: "linked_description",
      //   resource_key: "codetype_8_LinkedDescription",
      //   flex: 2,
      //   renderHeader: () => (
      //     <div>
      //       {!isFilterOn && <span>{t("codetype_8_LinkedDescription")}</span>}
      //       {isFilterOn && (
      //         <div onClick={(e) => e.stopPropagation()}>
      //           <TextField
      //             variant="outlined"
      //             sx={{
      //               mr: "10px",
      //               borderRadius: 2,
      //               alignSelf: "center",
      //               "& input": { padding: "7px 10px !important" },
      //               "& input::placeholder": {
      //                 fontSize: "12px",
      //                 opacity: 0.5,
      //               },
      //               height: "80%",
      //               bgcolor: (theme) =>
      //                 theme.palette.mode === "light" ? "#fff" : grey[800],
      //             }}
      //             size="small"
      //             className={classes.columnFilter}
      //             placeholder={
      //               t("codetype_8_LinkedDescription") || "Linked Description"
      //             }
      //             type="text"
      //             name="linked_description"
      //             value={filters.linked_description}
      //             onChange={handleFiltersChange}
      //           />
      //         </div>
      //       )}
      //     </div>
      //   ),
      //   filterable: true,
      //   renderCell(params) {
      //     return (
      //       <span style={{ paddingLeft: "5px" }}>
      //         {params.row.linked_description}
      //       </span>
      //     );
      //   },
      // },
      {
        field: "sub_code_type",
        permission: "code_8_subCodeType",
        uiText: "code_8_subCodeType",
        headerName: "Sub Code Type",
        flex: 2,
        // renderHeader: () => (
        //   <div>
        //     {!isFilterOn && <span>{t("codetype_8_SubTypeCode")}</span>}
        //     {isFilterOn && (
        //       <div onClick={(e) => e.stopPropagation()}>
        //         <TextField
        //           variant="outlined"
        //           sx={{
        //             mr: "10px",
        //             borderRadius: 2,
        //             alignSelf: "center",
        //             "& input": { padding: "7px 10px !important" },
        //             "& input::placeholder": {
        //               fontSize: "12px",
        //               opacity: 0.5,
        //             },
        //             height: "80%",
        //             bgcolor: (theme) =>
        //               theme.palette.mode === "light" ? "#fff" : grey[800],
        //           }}
        //           size="small"
        //           className={classes.columnFilter}
        //           placeholder={t("codetype_8_SubTypeCode") || "Sub Type"}
        //           type="text"
        //           name="sub_code_type"
        //           value={filters.sub_code_type}
        //           onChange={handleFiltersChange}
        //         />
        //       </div>
        //     )}
        //   </div>
        // ),
        filterable: true,

        renderCell(params) {
          return (
            <span style={{ paddingLeft: "15px" }}>
              {params.row.sub_code_type}
            </span>
          );
        },
      },
      // {
      //   field: "sub_type_description",
      //   resource_key: "codetype_8_SubTypeDescription",
      //   flex: 2,
      //   renderHeader: () => (
      //     <div>
      //       {!isFilterOn && <span>{t("codetype_8_SubTypeDescription")}</span>}
      //       {isFilterOn && (
      //         <div onClick={(e) => e.stopPropagation()}>
      //           <TextField
      //             variant="outlined"
      //             sx={{
      //               mr: "10px",
      //               borderRadius: 2,
      //               alignSelf: "center",
      //               "& input": { padding: "7px 10px !important" },
      //               "& input::placeholder": {
      //                 fontSize: "12px",
      //                 opacity: 0.5,
      //               },
      //               height: "80%",
      //               bgcolor: (theme) =>
      //                 theme.palette.mode === "light" ? "#fff" : grey[800],
      //             }}
      //             size="small"
      //             className={classes.columnFilter}
      //             placeholder={
      //               t("codetype_8_SubTypeDescription") || "Sub Type Description"
      //             }
      //             type="text"
      //             name="sub_type_description"
      //             value={filters.sub_type_description}
      //             onChange={handleFiltersChange}
      //           />
      //         </div>
      //       )}
      //     </div>
      //   ),
      //   filterable: true,
      //   renderCell(params) {
      //     return (
      //       <span style={{ paddingLeft: "5px" }}>
      //         {params.row.sub_type_description}
      //       </span>
      //     );
      //   },
      // },
      {
        field: "cat_code",
        permission: "code_8_categoryCode",
        uiText: "code_8_categoryCode",
        headerName: "Category Code",
        width: 150,

        renderCell(params) {
          return (
            <span>
              {params.row.cat_code ? params.row.cat_code.join(", ") : "—"}
            </span>
          );
        },

        // flex: 2,
        // renderHeader: () => (
        //   <div>
        //     {!isFilterOn && <span>{t("codetype_8_CategoryCode")}</span>}
        //     {isFilterOn && (
        //       <div onClick={(e) => e.stopPropagation()}>
        //         <TextField
        //           variant="outlined"
        //           sx={{
        //             mr: "10px",
        //             borderRadius: 2,
        //             alignSelf: "center",
        //             "& input": { padding: "7px 10px !important" },
        //             "& input::placeholder": {
        //               fontSize: "12px",
        //               opacity: 0.5,
        //             },
        //             height: "80%",
        //             bgcolor: (theme) =>
        //               theme.palette.mode === "light" ? "#fff" : grey[800],
        //           }}
        //           size="small"
        //           className={classes.columnFilter}
        //           placeholder={"Category Code"}
        //           type="text"
        //           name="cat_code"
        //           value={filters.cat_code}
        //           onChange={handleFiltersChange}
        //         />
        //       </div>
        //     )}
        //   </div>
        // ),
        // filterable: true,
        // renderCell(params) {
        //   return (
        //     <span style={{ paddingLeft: "5px" }}>{params.row.cat_code}</span>
        //   );
        // },
      },
      {
        field: "actions",
        type: "actions",
        permission: "code_8_actions",
        uiText: "generic_0_actions",
        headerName: "Actions",
        headerClassName: "super-app-theme--header",
        headerAlign: "left",
        align: "right",
        // flex: 2,
        width: 90,
        sortable: false,
        filterable: false,
        cellClassName: "actions",
        renderHeader: () => {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Actions</span>
              {selectedCodeItem && (
                <GalaxySecure.GLIconButton2
                  permission="code_8_addCodeData"
                  uiText="generic_0_add"
                  fallBackText="Add Code Data"
                  onClick={handleOpenAdd}
                  size="small"
                >
                  <img
                    src={publicUrl(`themes/${mode}/icons/plus.png`)}
                    alt="add"
                  />
                </GalaxySecure.GLIconButton2>
              )}
              {/* <Secure.GLIconButton
                title={t("codetype_8_Actions")}
                resource_key="codetype_8_Actions"
                onClick={handleOpenAdd}
              >
                <img
                  src={publicUrl(`themes/${mode}/icons/plus.png`)}
                  alt="add"
                />
              </Secure.GLIconButton> */}
            </div>
          );
        },
        renderCell: (params: any) => {
          return (
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <GalaxySecure.GLIconButton2
                permission="code_8_editCodeData"
                uiText="generic_0_edit"
                fallBackText="Edit Code"
                onClick={handleEditClick(params.row)}
                size="small"
              >
                <img src={publicUrl(`themes/${mode}/icons/pen.png`)} alt="edit"/>
              </GalaxySecure.GLIconButton2>
              {/* <Tooltip title="Edit">
                <IconButton
                  onClick={handleEditClick(params.row)}
                  size="small"
                  sx={{
                    padding: "4px",
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  <img
                    src={publicUrl(`themes/${mode}/icons/pen.png`)}
                    width="15px"
                    height="15px"
                    alt="Edit"
                  />
                </IconButton>
              </Tooltip> */}

              <GalaxySecure.GLIconButton2
                permission="code_8_deleteCodeData"
                uiText="generic_0_delete"
                fallBackText="Delete Code"
                onClick={openDialog(params.row.code)}
                size="small"
              >
                <img
                  src={publicUrl(
                    `themes/${mode}/icons/delete.png`,
                  )}
                  alt="Delete"
                />
              </GalaxySecure.GLIconButton2>

              {/* <Tooltip title="Delete">
                <IconButton
                  onClick={openDialog(params.row.code)}
                  size="small"
                  sx={{
                    padding: "4px",
                    color: "text.secondary",
                    "&:hover": { color: "error.main" },
                  }}
                >
                  <img
                    src={publicUrl(`themes/${mode}/icons/delete.png`)}
                    width="15px"
                    height="15px"
                    alt="Delete"
                  />
                </IconButton>
              </Tooltip> */}
            </Stack>
          );
        },
      },
    ],
    [userLang, t, isFilterOn, filters, selectedCodeItem],
  );
  //==================  * Resources * ===================

  const classes = useStyles();

  const [data, setData] = useState<CodeDataDTO>(initialData);
  const errRef = useRef<HTMLElement | null>(null);
  const [errMsg, setErrMsg] = useState<String>("");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  // Role Action
  const [rowId, setRowId] = useState<number[] | null>(null);
  const [row, setRow] = useState<CodeData[] | null>();
  const [rows, setRows] = React.useState<CodeData[]>();
  const error = useSelector((state: RootState) => state.codedata.error);
  const codedata = useSelector((state: RootState) => state.codedata.codedata);
  const limit = useSelector((state: RootState) => state.codetypes.limit);
  const totalPages = useSelector(
    (state: RootState) => state.codedata.totalPages,
  );
  const codetypestatus = useSelector(
    (state: RootState) => state.codedata.status,
  );
  const selectedCodeData = useSelector(
    (state: RootState) => state.codedata.selectedItem,
  );
  const selectedCodeType = useSelector(
    (state: RootState) => state.codetypes.selectedItemId,
  );
  // Create a ref to store the latest value of selectedCodeItem
  const selectedCodeItemRef = useRef(selectedCodeItem);
  const types = useSelector((state: RootState) => state.codetypes.types);
  const linkedList = useSelector(
    (state: RootState) => state.codedata.codetypelist,
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 16,
  }); // Default pagination model
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    code: false, // Hide the 'id' column
    user_code: true,
    description: true,
    linked_code: true,
    linked_description: true,
    sub_code_type: true,
    linked_code_type: true,
    actions: true,
  });

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const page = useSelector((state: RootState) => state.codedata.page);
  const [isNew, setIsNew] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);
  const [editId, setEditId] = useState(null);
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  // open Delete Dialog
  const openDialog = (id: GridRowId) => () => {
    dispatch(clearError());
    setDeleteId(id);
    setDialogOpen(true);
  };
  // close Delete Dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setDeleteId(null);
    dispatch(clearError());
  };
  // Open Add new dialog
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const handleOpenAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsNew(true);
    setOpenAdd(true);
    dispatch(clearError());
  };

  const handleCloseAddDialog = () => {
    setOpenAdd(false);
    dispatch(clearError()); // Clear any previous errors
  };
  const handleCloseEditDialog = () => {
    setOpenEdit(false);
    dispatch(clearError()); // Clear any previous errors
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | SelectChangeEvent<number>,
  ) => {
    const { name, value } = event.target;

    const newValue =
      name === "linked_code" || name === "sub_code_type"
        ? value
          ? Number(value)
          : null
        : value
          ? value
          : "";
    setData({ ...data, [name]: newValue });
  };
  // Filter Functions
  const handleFiltersChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prevFilters) => {
        const newFilters = {
          ...prevFilters,
          [event.target.name]: event.target.value,
        };
        return newFilters;
      });
    },
    [],
  );
  const clickFilterOnHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Toggle isFilterOn and update selectedColumnList in one go
    setIsFilterOn((current) => {
      const newFilterState = !current; // Get the updated value of isFilterOn
      if (current) {
        setFilters(initialFilters);
      }

      return newFilterState; // Return the new state for setIsFilterOn
      // });
    });
  };

  const handleEditClick = (row: any) => () => {
    dispatch(setSelectedItem(row));
    // const selectedCodeDataCurr = codedata.find((item) => item.code === id);
    // if (selectedCodeDataCurr) {
    // }
    setEditId(row.code);
    setIsNew(false);
    setOpenEdit(true);
  };
  const processRowUpdate = (newRow: CodeData) => {
    dispatch(
      fetchCodeDataByCodeType({
        codeType: selectedCodeType,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      }),
    ); // Fetch codetypes with 1-based page

    const updatedRow = { ...newRow, isNew: false };
    if (rows) {
      setRows(rows.map((row) => (row.code === newRow.code ? updatedRow : row)));
    }
    return updatedRow;
  };

  const handleDeleteClick = async () => {
    try {
      await dispatch(deleteCodeData({ id: deleteId }))
        .unwrap()
        .then(() => {
          setDialogOpen(false);
          mutate((e) => apiUtility(e, "codedata"));
          dispatch(
            fetchCodeDataByCodeType({
              codeType: selectedCodeType,
              page: paginationModel.page + 1,
              limit: paginationModel.pageSize,
            }),
          ); // Fetch codetypes with 1-based page
          codeTypeRef?.current?.();
        })
        .catch((error) => {
          throw error;
        });

      // if (rows) { setRows(rows.filter((row) => row.code !== deleteId)); }
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Adding Item Failed");
      }
      errRef.current?.focus();
    }
  };
  const slots = {
    toolbar: GridToolbar,
    noRowsOverlay: () => (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <span className="title-text">NO DATA FOUND</span>
      </Stack>
    ),
    noResultsOverlay: () => (
      <Stack height="100%" alignItems="center" justifyContent="center">
        Local filter returns no result
      </Stack>
    ),
  };

  return (
    <>
      {/* confirm delete dialog */}
      <DisplayMsgDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onAction={handleDeleteClick}
        description={
          t("codetype_8_DeleteConfirmation") ||
          "Are you sure you want to delete this Code Data?"
        }
        getResource={false}
        status="DELETE"
        actionLabel="Delete"
        actionColor="error"
      />
      {/* add new record  dialog*/}
      <GenericDialog
        // className="dialog-gradient "
        open={openAdd}
        onClose={handleCloseAddDialog}
        title={t("codetype_8_AddCodeData") || "Add Code Data"}
        icon={
          <PlaylistAddIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              border: "0",
              width: "30px", // Set width of the circle
              height: "30px", // Set height of the circle
              borderRadius: "50%", // Makes it circular
              padding: "5px", // Optional padding inside the circle
              display: "flex", // Ensures proper alignment
              alignItems: "center", // Centers the icon vertically
              justifyContent: "center", // Centers the icon horizontally
            }}
          />
        }
        content={
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* <h2>lorem</h2> */}
            <CustomFormCodeData
              row={isNew ? initialData : selectedCodeData}
              isInEditMode={true}
              isNew={isNew}
              editId={editId}
              master_code_type={selectedCodeType}
              handleChange={handleChange}
              types={types}
              linkedList={linkedList}
              master_code_desc={selectedCodeItem?.description}
              linked_code_desc={selectedCodeItem?.linked_description}
              linked_type={selectedCodeItem?.linked_type}
              isLinked={selectedCodeItem?.linked_type ? true : false}
              handleClose={handleCloseAddDialog}
              selectedCodeData={selectedCodeData}
              codeTypeRef={codeTypeRef}
            />
          </>
        }
      />

      {/* edit */}
      <GenericDialog
        // className="dialog-gradient "
        open={openEdit}
        onClose={handleCloseEditDialog}
        title={t("codetype_8_UpdateDataCode") || "Update Data Code"}
        icon={
          <EditIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              border: "0",
              width: "30px", // Set width of the circle
              height: "30px", // Set height of the circle
              borderRadius: "50%", // Makes it circular
              padding: "5px", // Optional padding inside the circle
              display: "flex", // Ensures proper alignment
              alignItems: "center", // Centers the icon vertically
              justifyContent: "center", // Centers the icon horizontally
            }}
          />
        }
        content={
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* {
              JSON.stringify({
                row: isNew ? initialData : selectedCodeData,
              })
            } */}

            <CustomFormCodeData
              row={isNew ? initialData : selectedCodeData}
              isInEditMode={true}
              isNew={isNew}
              editId={editId}
              master_code_type={selectedCodeType}
              handleChange={handleChange}
              types={types}
              linkedList={linkedList}
              master_code_desc={selectedCodeItem?.description}
              linked_code_desc={selectedCodeItem?.linked_description}
              linked_type={selectedCodeItem?.linked_type}
              isLinked={selectedCodeItem?.linked_type ? true : false}
              handleClose={handleCloseEditDialog}
              selectedCodeData={selectedCodeData}
              codeTypeRef={codeTypeRef}
            />
          </>
        }
      />

      {/* <Box sx={{ mb: "35px" }}> */}
      <Box sx={{ flexGrow: 1 }}>
        {/* <GlPanelTable>
          <Secure.GlCustomTable
            resource_key="codetype_8_CodeTypeTable"
            getRowId={(r) => r.code}
            columns={columns}
            params={filters}
            smallSize
            url={
              selectedCodeItem
                ? "/codedata/type/" + selectedCodeItem.code_type + "/new"
                : ""
            }
            onRowSelected={(r: any) => r && dispatch(setSelectedItem(r))}
            // slots={{
            //   toolbar: (props: any) => (
            //     <CustomToolbar
            //       {...props}
            //       title={t("codetype_8_NewCodeData")}
            //       resourceKey="codetype_8_NewCodeData"
            //       isFilterOn={isFilterOn}
            //       openForm={handleOpenAdd}
            //       clickFilterOnHandler={clickFilterOnHandler}
            //     />
            //   ),
            // }}
          ></Secure.GlCustomTable>
        </GlPanelTable> */}
        <GalaxySecure.GLCustomTable2
          key={selectedCodeItem?.code_type ?? "no-code-type"}
          permission="code_8_codeTypeTable"
          fetcher={fetcher}
          refetchRef={codeTypeRef}
          getRowId={(r) => r.code}
            columns={columns}
            params={filters}
            smallSize
            url={
              selectedCodeItem
                ? "/codedata/type/" + selectedCodeItem.code_type + "/new"
                : ""
            }
            onRowSelected={(r: any) => dispatch(setSelectedItem(r ?? null))}
            localeText={{
              noRowsLabel: "✨ No data available",
              noResultsOverlayLabel: "✨ No data available",
            }}
        />
        <Box>
          {/* {JSON.stringify(selectedCodeData)} */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 2,
              mt: 2,
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Description */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bolder", minWidth: "140px" }}
              >
                Code Description:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", wordBreak: "break-word" }}
              >
                {selectedCodeData?.description || "—"}
              </Typography>
            </Box>

            {/* Linked Code Description */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bolder", minWidth: "140px" }}
              >
                Linked Code Description:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", wordBreak: "break-word" }}
              >
                {selectedCodeData?.linked_description || "—"}
              </Typography>
            </Box>

            {/* Sub Type Description */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bolder", minWidth: "140px" }}
              >
                Sub Type Description:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", wordBreak: "break-word" }}
              >
                {selectedCodeData?.sub_type_description || "—"}
              </Typography>
            </Box>

            {/* Col 1 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bolder", minWidth: "140px" }}
              >
                Col 1:
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "text.primary", wordBreak: "break-word" }}
              >
                {selectedCodeData?.col_1 || "—"}
              </Typography>
            </Box>

            {/* Col 2 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bolder", minWidth: "140px" }}
              >
                Col 2:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", wordBreak: "break-word" }}
              >
                {selectedCodeData?.col_2 || "—"}
              </Typography>
            </Box>

            {/* Col 3 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bolder", minWidth: "140px" }}
              >
                Col 3:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", wordBreak: "break-word" }}
              >
                {selectedCodeData?.col_3 || "—"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DataGridCode;
