import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import {
  Box,
  TextField,
  Stack,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  setSelectedId,
  clearError,
  fetchPatients,
  fetchPatientsCodeTypes,
} from "../../redux/slices/patientSlice";
import { EditPatientForm } from "./EditPatientForm";
import { GridColDef } from "@mui/x-data-grid";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { AddPatientForm } from "./AddPatientForm";
import { ClearIcon } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import { fetchPolicies } from "../../redux/slices/payerPolicySlice";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
import Secure from "../../shared/security";
import { Secure as GalaxySecure } from "@givc/shared-components";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { fetcher } from "../../utils/Api";
function Patient() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useContext(AuthGuardContext);
  const { loading, error, selectedPatientId } = useSelector(
    (state: RootState) => state.patient,
  );
  const {
    palette: { mode },
  } = useTheme();

  const [searchValue, setSearchValue] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const refetchRef = useRef<(() => void) | null>(null);
  // Tracks the selected patient id so a data refresh can keep (or drop) the
  // current selection instead of always jumping to the first row.
  const selectedPatientIdRef = useRef<any>(null);

  const [apiParams, setApiParams] = useState<Record<string, any>>({
    searchField: "",
  });

  const apiUrl = "/patients/new";

  useEffect(() => {
    // Fetch code types on mount
    dispatch(fetchPatientsCodeTypes());

    dispatch(
      fetchPolicies({
        page: 1,
        limit: 100,
        sortField: "policy_id",
        sortOrder: "desc",
        searchField: "",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(
      () => handleValueSearchChange(searchValue.trim()),
      500,
    );

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleValueSearchChange = (value: string) => {
    setApiParams({
      ...apiParams,
      searchField: value,
    });
  };

  const handleKeyDownSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    setApiParams({
      ...apiParams,
      searchField: searchValue,
    });
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setApiParams({
      ...apiParams,
      searchField: "",
    });
  };

  const handleRowSelected = useCallback((selectedRow: any | null) => {
    selectedPatientIdRef.current = selectedRow?.patient_id ?? null;
    if (selectedRow) {
      dispatch(setSelectedId(selectedRow.patient_id));
      setSelectedPatient(selectedRow);
    } else {
      dispatch(setSelectedId(null));
      setSelectedPatient(null);
    }
  }, [dispatch]);

  const handleDataChange = useCallback(
    (data: any[]) => {
      const selectedId = selectedPatientIdRef.current;
      if (selectedId === null || selectedId === undefined) return;

      const freshRow = data?.find((row) => row.patient_id === selectedId);
      if (freshRow) {
        // Keep the same patient selected (and its details fresh) after a
        // refetch, so saving does not jump back to the first row.
        setSelectedPatient(freshRow);
        dispatch(setSelectedId(freshRow.patient_id));
      } else {
        // The selected row disappeared (search/page change): clear the
        // selection so the table can auto-select the first result.
        handleRowSelected(null);
      }
    },
    [dispatch, handleRowSelected],
  );

  const [disable, setDisable] = useState(true);

  const openEditMode = () => {
    setDisable(false);
  };

  const closeEditMode = () => {
    setDisable(true);
  };

  const columns: GLGridColDef[] = [
    {
      field: "patient_id",
      headerName: "Patient ID",
      sortable: true,
      flex: 1,
      // minWidth: 120,
      type: "number",
      align: "right",
      headerAlign: "left",
      resource_key: "patients_20_patientID",
    },
        {
      field: "mrn",
      headerName: "MRN",
      sortable: true,
      align: "right",
      flex: 1,
      resource_key: "patients_20_mrn",
    },
    {
      field: "first_name",
      headerName: "First Name",
      sortable: true,
      flex: 1.5,
      // minWidth: 150,
      type: "string",
      resource_key: "patients_20_firstName",
    },
    {
      field: "last_name",
      headerName: "Last Name",
      sortable: true,
      flex: 1.5,
      // minWidth: 150,
      resource_key: "patients_20_lastName",
    },
    {
      field: "birth_date",
      headerName: "Birth Date",
      sortable: true,
      width: 90,
      resource_key: "patients_20_birthDate",
    },
    // {
    //   field: "gender",
    //   headerName: "Gender",
    //   sortable: true,
    //   flex: 0.8,
    //   // minWidth: 100,
    //   align: "center",
    //   renderCell: (params: any) => {
    //     return params.value === "male" ? (
    //       <img src={`./themes/${mode}/icons/male.png`} width={20} alt="Male" />
    //     ) : params.value === "female" ? (
    //       <img src={`./themes/${mode}/icons/female.png`} width={20} alt="Female" />
    //     ) : (
    //       params.value || "-"
    //     );
    //   },
    //   resource_key: "patients_20_gender",
    // },
    // {
    //   field: "nationality",
    //   headerName: "Nationality",
    //   sortable: true,
    //   flex: 1,
    //   // minWidth: 120,
    //   resource_key: "patients_20_nationality",
    //   align: "center",
    //   renderCell: (params: any) => {
    //     return params.value ? (
    //       <img
    //         src={`./themes/${mode}/flags/${params.value.toLowerCase()}.png`}
    //         width={20}
    //         alt={params.value}
    //       />
    //     ) : (
    //       "-"
    //     );
    //   },
    // },
    {
  field: "", 
  headerName: "",             
  sortable: false,            
  flex: 1.2,                  
  align: "center",
  headerAlign: "center",
  renderCell: (params: any) => {
    const gender = params.row.gender;
    const nationality = params.row.nationality;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
        {gender === "male" ? (
          <img src={`./themes/${mode}/icons/male.png`} width={20} alt="Male" />
        ) : gender === "female" ? (
          <img src={`./themes/${mode}/icons/female.png`} width={20} alt="Female" />
        ) : (
          gender || "-"
        )}

        {nationality ? (
          <img
            src={`./themes/${mode}/flags/${nationality.toLowerCase()}.png`}
            width={20}
            alt={nationality}
          />
        ) : (
          "-"
        )}
      </div>
    );
  },
  resource_key: "",
}
  ];

  return (
    <Box display="flex" width="100%" p={2}>
      <HandleTitle titleKey="PATIENT" />

      <Box width={"33%"} sx={{ p: 0, pr: 2 }} borderRight="1px solid #ccc">
        <Stack direction="row" spacing={1}>
          <Secure.GLTextField
            resource_key="patients_20_searchByIDName"
            id="quickSearch"
            type="search"
            placeholder={
              t("patients_20_searchByIDName") || "search by id, name"
            }
            variant="outlined"
            sx={{
              borderRadius: 2,
              alignSelf: "center",
              "& input": { padding: "7px 10px !important" },
            }}
            value={searchValue}
            style={{ flex: 1 }}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDownSearch}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Secure.GLIconButton
            sx={{ p: 0 }}
            resource_key="patients_20_addPatient"
          >
            <AddPatientForm refetchRef={refetchRef} />
          </Secure.GLIconButton>
        </Stack>

        <Box sx={{ minHeight: 900 }}>
          {/* <GalaxySecure.GLCustomTable2 
            permission="patients_20_viewPatients"
            url={apiUrl}
            params={apiParams}
            fetcher={fetcher}
            columns={columns}
            getRowId={(row) => row.patient_id}
            loading={loading}
            smallSize
            refetchRef={refetchRef}
            actionsSideSort={
              <Secure.GLIconButton
                sx={{ paddingLeft: "20px" }}
                resource_key="patients_20_addPatient"
              >
                <AddPatientForm />
              </Secure.GLIconButton>
            }
            sx={{ width: "100%" }}
            clientPagination
          /> */}
          <Secure.GlCustomTable
            sx={{ width: "100%", marginTop: "10px" }}
            resource_key="replaceme"
            url={apiUrl}
            params={apiParams}
            limit={25}
            columns={columns}
            getRowId={(row) => row.patient_id}
            loading={loading}
            onRowSelected={handleRowSelected}
            handleDataChange={handleDataChange}
            refetchRef={refetchRef}
            enableKeyboardNavigation={true}
            autoSelectFirstRow={!selectedPatient}
            smallSize
            hideHeader={false}
          />
        </Box>
      </Box>

      <EditPatientForm
        selectedPatient={selectedPatient}
        selectedPatientId={selectedPatientId}
        openEditMode={openEditMode}
        closeEditMode={closeEditMode}
        disable={disable}
        setDisable={setDisable}
        refetchRef={refetchRef}
        onPatientUpdated={setSelectedPatient}
      />
    </Box>
  );
}

export default Patient;
