import React from "react";
import {
  Box,
  Grid,
  Button,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
  TablePagination,
  useTheme,
  IconButton,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import Joi from "joi";
import { MappingRow, ExternalCode } from "../../types/CodeMappingIndex";
import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/hooks";
import Secure from "../../shared/security";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { useContext } from "react";
interface AddEditMappingFormProps {
  mapping: MappingRow;
  dialogType: "create" | "edit";
  externalCodes: ExternalCode[];
  onSubmit: (data: {
    map_to_code_id: number;
    start_date?: string;
    end_date?: string;
  }) => void;
  onCancel: () => void;
  loading: boolean;
}

// Custom pagination actions component
function TablePaginationActions(props: any) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <Secure.GLIconButton
        resource_key="codeMapping_13_firstPageIconBtn"
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPage /> : <FirstPage />}
      </Secure.GLIconButton>
      <Secure.GLIconButton
        resource_key="codeMapping_13_lastPageIconBtn"
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </Secure.GLIconButton>
      <Secure.GLIconButton
        resource_key="codeMapping_13_nextPageIconBtn"
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </Secure.GLIconButton>
      <Secure.GLIconButton
        resource_key="codeMapping_13_lastPageIconBtn"
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPage /> : <LastPage />}
      </Secure.GLIconButton>
    </Box>
  );
}

// Combined validation schema
const validationSchema = Joi.object({
  map_to_code_id: Joi.number().required().label("Map To Code"),
  start_date: Joi.date().allow(null).optional(),
  end_date: Joi.date()
    .allow(null)
    .min(Joi.ref("start_date"))
    .optional()
    .messages({
      "date.min": "End date must be after start date",
    }),
});

const AddEditMappingForm: React.FC<AddEditMappingFormProps> = ({
  mapping,
  dialogType,
  externalCodes,
  onSubmit,
  onCancel,
  loading,
}) => {
  const theme = useTheme();
  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);
  const [filterCode, setFilterCode] = React.useState("");
  const [filterDescription, setFilterDescription] = React.useState("");
  const dateFormat = useAppSelector((state) => state.config.values.DATE_FORMAT);
  const { t } = useContext(AuthGuardContext);
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // Get the initial selected row ID
  const initialSelectedRowId = mapping.map_to_code_id || null;

  const formik = useFormik({
    // initialValues: {
    //   map_to_code_id: initialSelectedRowId,
    //   start_date: mapping.start_date ? new Date(mapping.start_date) : (new Date()),
    //   end_date: mapping.end_date ? new Date(mapping.end_date) : (null as Date | null),
    // },
    initialValues: {
      map_to_code_id: initialSelectedRowId,
      start_date: mapping.start_date ? new Date(mapping.start_date) : null,
      end_date: mapping.end_date ? new Date(mapping.end_date) : null,
    },

    validate: (values) => {
      const { error } = validationSchema.validate(values, {
        abortEarly: false,
      });
      if (!error) return {};

      const errors: Record<string, string> = {};
      error.details.forEach((detail) => {
        errors[detail.path[0]] = detail.message;
      });
      return errors;
    },
    onSubmit: (values) => {
      onSubmit({
        map_to_code_id: values.map_to_code_id as number,
        start_date: values.start_date
          ? new Date(
              values.start_date.getTime() -
                values.start_date.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : null,
        end_date: values.end_date
          ? new Date(
              values.end_date.getTime() -
                values.end_date.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : null,
      });
    },
  });

  // Handle row selection
  const handleRowSelection = (codeId: number) => {
    formik.setFieldValue("map_to_code_id", codeId);
  };

  // Paginated data
  //const paginatedCodes = externalCodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const filteredCodes = externalCodes.filter(
    (code) =>
      code.code.toLowerCase().includes(filterCode.toLowerCase()) &&
      code.description.toLowerCase().includes(filterDescription.toLowerCase())
  );

  const paginatedCodes = filteredCodes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{ color: "text.obs" }}
              gutterBottom
            >
              {dialogType === "create"
                ? t("codeMapping_13_mapping")
                : t("codeMapping_13_editing")}
              <Box component="span" fontWeight="bold">
                {mapping.app_code} - {mapping.description}
              </Box>
            </Typography>

            {dialogType === "create" && !mapping.map_to_code_id && (
              <Secure.GLTypography
                resource_key="codeMapping_13_thisRowIsNotCurrentlyMapped"
                variant="body2"
                sx={{ color: "text.obs" }}
                gutterBottom
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <Secure.GLTypography
              resource_key="codeMapping_13_selectAnExternalCode"
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: "text.obs" }}
              gutterBottom
            />

            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "#e3f2fd",
                maxHeight: 400,
              }}
            >
              <Table size="small" stickyHeader>
                {/* <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                  </TableRow>
                </TableHead> */}
                <TableHead>
                  {/* Filter row */}
                  <TableRow>
                    <TableCell />
                    <Secure.GLTableCell resource_key="codeMapping_13_filterCode">
                      <Secure.GLTextField
                        resource_key="codeMapping_13_filterCode"
                        placeholder="Filter Code"
                        value={filterCode}
                        onChange={(e) => setFilterCode(e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                      />
                    </Secure.GLTableCell>
                    <Secure.GLTableCell resource_key="codeMapping_13_filterDescription">
                      <Secure.GLTextField
                        resource_key="codeMapping_13_filterDescription"
                        placeholder="Filter Description"
                        value={filterDescription}
                        onChange={(e) => setFilterDescription(e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                      />
                    </Secure.GLTableCell>
                  </TableRow>

                  {/* Header row */}
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <Secure.GLTableCell
                      resource_key="codeMapping_13_codeForm"
                      sx={{ fontWeight: "bold" }}
                    >
                      Code
                    </Secure.GLTableCell>
                    <Secure.GLTableCell
                      resource_key="codeMapping_13_descriptionForm"
                      sx={{ fontWeight: "bold" }}
                    >
                      Description
                    </Secure.GLTableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedCodes.map((code) => (
                    <TableRow
                      key={code.code_id}
                      hover
                      selected={formik.values.map_to_code_id === code.code_id}
                      onClick={() => handleRowSelection(code.code_id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <input
                          type="radio"
                          name="map_to_code_id"
                          checked={
                            formik.values.map_to_code_id === code.code_id
                          }
                          onChange={() => {}}
                          style={{ cursor: "pointer" }}
                        />
                      </TableCell>
                      <Secure.GLTableCell resource_key="codeMapping_13_codeForm">
                        {code.code}
                      </Secure.GLTableCell>
                      <Secure.GLTableCell resource_key="codeMapping_13_descriptionForm">
                        {code.description}
                      </Secure.GLTableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[]}
                      colSpan={3}
                      count={externalCodes.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      ActionsComponent={(props) => (
                        <TablePaginationActions {...props} />
                      )}
                      labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} of ${count}`
                      }
                      sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            {formik.touched.map_to_code_id && formik.errors.map_to_code_id && (
              <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                {formik.errors.map_to_code_id}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <Secure.GLDatePicker
              resource_key="codeMapping_13_startDateMapping"
              format={dateFormat || "dd/MM/yyyy"}
              label={t("codeMapping_13_startDateMapping")}
              value={formik.values.start_date ? formik.values.start_date : null}
              onChange={(date) => formik.setFieldValue("start_date", date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  error:
                    formik.touched.start_date &&
                    Boolean(formik.errors.start_date),
                  helperText:
                    formik.touched.start_date && formik.errors.start_date,
                },
              }}
              sx={{ background: "white" }}
            />
          </Grid>

          <Grid item xs={6}>
            <Secure.GLDatePicker
              resource_key="codeMapping_13_endDateMapping"
              format={dateFormat || "dd/MM/yyyy"}
              label={t("codeMapping_13_endDateMapping")}
              value={formik.values.end_date}
              onChange={(date) => formik.setFieldValue("end_date", date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  error:
                    formik.touched.end_date && Boolean(formik.errors.end_date),
                  helperText: formik.touched.end_date && formik.errors.end_date,
                },
              }}
              sx={{ background: "white" }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Secure.GLButton
              resource_key="codeMapping_13_cancelMapping"
              onClick={onCancel}
              sx={{ mr: 1 }}
              size="small"
            >
              Cancel
            </Secure.GLButton>
            <Secure.GLButton
              resource_key="codeMapping_13_submitMapping"
              type="submit"
              variant="contained"
              disabled={loading || !formik.isValid}
              size="small"
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : dialogType === "create" ? (
                t("codeMapping_13_createMapping")
              ) : (
                t("codeMapping_13_updateMapping")
              )}
            </Secure.GLButton>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AddEditMappingForm;
