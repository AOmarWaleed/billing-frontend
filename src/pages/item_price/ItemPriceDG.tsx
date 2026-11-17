import { GridColDef } from "@mui/x-data-grid";
import { useState, useEffect, useRef, useContext } from "react";
import api, { fetcher } from "../../utils/Api";
import {
  TextField,
  Box,
  InputLabel,
  Button,
  Modal,
  Typography,
  Dialog,
  DialogContent,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ModeIcon from "@mui/icons-material/Mode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Import from "./components/Import";
import Export from "./components/Export";
import PrintReport from "./components/PrintReport";
import PriceHistoryTable from "./components/PriceHistoryTable";
import ItemPrice from "./ItemPrice";
import CopyPriceModal from "./components/CopyPriceModal";
import { toast } from "react-toastify";
import PageWithSideContent from "../../components/PageWithSideContent/PageWithSideContent";
import { Link } from "react-router-dom";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { DesktopDatePicker as DatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { formatDisplayCurrency } from "../../utils/formatData/formatterv2";
import { useAppSelector } from "../../hooks/hooks";
import "react-toastify/dist/ReactToastify.css";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import GlCustomAutoSuggest from "../../shared/forms/StandAlone/GlAutoComplete";
import GlPanelTable from "../../shared/tables/GlPanelTable";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import GlStaticAutoComplete, {
  OptionType,
} from "../../shared/forms/StandAlone/GlStaticAutoComplete";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import GlAutoComplete from "../../shared/forms/StandAlone/GlAutoComplete";
import { useTranslation } from "react-i18next";
// import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { AuthGuardContext } from "@givc/shared-components";
// import Secure from "../../shared/security";
import { Secure } from "@givc/shared-components";
import { CustomGridColDef } from "../../types/Columns";
import { DisplayMsgDialog } from "@givc/shared-components";
import { publicUrl } from "../../utils/publicUrl";
import { Palette } from "@mui/icons-material";
import renderTruncatedCell from "../../utils/renderTruncatedCell";
interface ItemPrice {
  price_id: Number;
  item_id: Number;
  price: Number;
  start_date: string;
  end_date: string | null;
  notes_id: Number;
  status: string;
  payer_id: Number;
  empolyee_id: Number;
  price_list_id: Number;
  facility_id: Number;
  created_by: Number;
  creation_date: string;
  modified_by: Number;
  modification_date: string;
  item_bk: string;
  legacy_code: string;
}

const ItemPriceDG: React.FC = () => {
  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    return null;
  }
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { resourcesData, t, userLang } = ctx;

  const [forceRenderKey, setForceRenderKey] = useState(0);
  const dateFormat = useAppSelector((state) => {
    return state.config.values.DATE_FORMAT;
  });
  const [showFilter, setShowFilter] = useState(false);
  const [rows, setRows] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(14);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currRowItemId, setCurrRowItemId] = useState(null);
  const [currRowPayerId, setCurrRowPayerId] = useState(null);
  const [currRowPriceListId, setCurrRowPriceListId] = useState<any>(null);
  const [customValues, setCustomValues] = useState<{ [key: string]: string }>(
    {},
  );
  const optionsForPrices = [
    { value: "All", label: t("item_prices_6_All") || "All" },
    { value: "WithPrice", label: t("item_prices_6_WithPrice") || "With Price" },
    {
      value: "WithoutPrice",
      label: t("item_prices_6_WithoutPrice") || "Without Price",
    },
  ];
  const optionsStandardPayer = [
    { value: "Standard", label: t("item_prices_6_Standard") || "Standard" },
    { value: "Payer", label: t("item_prices_6_Payer") || "Payer" },
  ];
  // const [optionsStandardPayer, setOptionsStandardPayer] = useState);
  const [pricesOptions, setPricesOptions] = useState<{
    value: string;
    label: string;
  } | null>(optionsForPrices[0]);

  const [itemBkField, setItemBkField] = useState("");
  const [itemDescField, setItemDescField] = useState("");
  const [itemCurrPriceField, setItemCurrPriceField] = useState("");
  const [itemCatCodeField, setItemCatCodeField] = useState("");
  const [itemStatusField, setItemStatusField] = useState("");
  const [itemLegacyCodeField, setItemLegacyCodeField] = useState("");

  const columns: CustomGridColDef[] = [
    {
      field: "item_bk",
      display: "flex",
      resource_key: "item_prices_6_ItemBK",
      width: 115,
      flex: 1,
      renderHeader: () => (
        <div>
          {!showFilter && <span>{t("item_prices_6_ItemBK") || "Item BK"}</span>}
          {showFilter && (
            <div onClick={(e) => e.stopPropagation()}>
              <TextField
                // className="filter-textfield-spacing"
                type="text"
                placeholder={t("item_prices_6_ItemBK") || "Item BK"}
                value={itemBkField}
                onChange={(e) => {
                  setItemBkField(e.target.value);
                }}
                sx={{
                  borderRadius: 1,
                  alignSelf: "center",
                  "& input": { padding: "0px 4px !important" },
                  height: "20px",
                  bgcolor: theme.palette.background.obvious,
                }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      field: "description",
      display: "flex",
      resource_key: "item_prices_6_ItemDescription",
      width: 300,
      renderHeader: () => (
        <div>
          {!showFilter && (
            <span>
              {t("item_prices_6_ItemDescription") || "Item Description"}
            </span>
          )}
          {showFilter && (
            <div onClick={(e) => e.stopPropagation()}>
              <TextField
                type="text"
                placeholder={
                  t("item_prices_6_ItemDescription") || "Description"
                }
                value={itemDescField}
                onChange={(e) => {
                  setItemDescField(e.target.value);
                }}
                sx={{
                  borderRadius: 1,
                  alignSelf: "center",
                  "& input": { padding: "0px 4px !important" },
                  height: "20px",
                  bgcolor: theme.palette.background.obvious,
                }}
              />
            </div>
          )}
        </div>
      ),
      renderCell: renderTruncatedCell,
    },
    {
      field: "price",
      display: "flex",
      resource_key: "item_prices_6_Price",
      width: 150,
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderHeader: () => (
        <div>
          {!showFilter && <span>{t("item_prices_6_Price") || "Price "}</span>}
          {showFilter && (
            <div onClick={(e) => e.stopPropagation()}>
              <TextField
                type="number"
                placeholder={t("item_prices_6_Price") || "Price"}
                value={itemCurrPriceField}
                onChange={(e) => {
                  setItemCurrPriceField(e.target.value);
                }}
                sx={{
                  borderRadius: 1,
                  alignSelf: "center",
                  "& input": { padding: "0px 4px !important" },
                  height: "20px",
                  bgcolor: theme.palette.background.obvious,
                }}
              />
            </div>
          )}
        </div>
      ),
      renderCell: (params) => {
        return formatDisplayCurrency(params.row.price);
      },
    },
    {
      flex: 1,
      field: "New price",
      display: "flex",
      resource_key: "item_prices_6_NewPrice",
      headerName: t("item_prices_6_NewPrice"),
      width: 200,
      type: "number",
      renderCell: (params) => {
        return (
          // <div
          //   style={{
          //     display: "flex",
          //     gap: "10px",
          //     alignItems: "center",
          //     justifyContent: "center",
          //     height: "100%",
          //     marginTop: "2px",
          //     marginBottom: "2px",
          //   }}
          // >
          //   <TextField
          //     type="number"
          //     variant="outlined"
          //     size="small"
          //     placeholder={t("item_prices_6_NewPrice") || "New Price"}
          //     value={customValues[params.row.item_id] || ""}
          //     onChange={(e) => handlePriceChange(params.row, e.target.value)}
          //     sx={{
          //       bgcolor: theme.palette.background.obvious,
          //       my: "2px",
          //       "& .MuiInputBase-input": { py: "6px" },
          //     }}
          //     // className="ex-small"
          //   />
          // </div>
          <TextField
            type="number"
            variant="outlined"
            size="small"
            placeholder={t("item_prices_6_NewPrice") || "New Price"}
            value={customValues[params.row.item_id] || ""}
            onChange={(e) => handlePriceChange(params.row, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
            sx={{
              width: "100%",
              bgcolor: theme.palette.background.obvious,

              "& .MuiInputBase-root": {
                height: "21px",
              },

              "& input[type=number]": {
                padding: "1px 6px",
                height: "19px",
                boxSizing: "border-box",
                fontSize: "12px",

                "&::-webkit-outer-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },

                "&::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },

                MozAppearance: "textfield",
              },
            }}
          />
        );
      },
    },
    {
      flex: 1,
      field: "start_date",
      display: "flex",
      resource_key: "item_prices_6_StartDate",
      headerName: t("item_prices_6_StartDate"),

      width: 150,
    },
    {
      flex: 1,
      field: "end_date",
      display: "flex",
      resource_key: "item_prices_6_EndDate",
      headerName: t("item_prices_6_EndDate"),

      width: 150,
      renderCell: (params) => {
        if (!params.row.end_date && params.row.start_date) {
          return (
            <Box sx={{ display: "flex", alignItems: "start" }}>
              <Tooltip title={t("item_prices_6_EndPrice") || "End Price"}>
                <Secure.GLButton
                  resource_key="item_prices_6_EndPrice"
                  onClick={() => handleOpen(params.row)}
                  color="primary"
                  // className="ex-small"
                >
                  <img
                    src={publicUrl(`themes/${mode}/icons/endprice.png`)}
                    width="24px"
                    alt="end price"
                  />
                </Secure.GLButton>
              </Tooltip>
            </Box>
          );
        }
      },
    },
    {
      flex: 1.7,
      field: "category_code",
      display: "flex",
      resource_key: "item_prices_6_CategoryCode",
      headerName: t("item_prices_6_CategoryCode"),

      width: 150,
      renderHeader: () => (
        <div>
          {!showFilter && (
            <span>{t("item_prices_6_CategoryCode") || "Cat Code"}</span>
          )}
          {showFilter && (
            <div onClick={(e) => e.stopPropagation()}>
              <TextField
                type="text"
                placeholder={t("item_prices_6_CatCode") || "Cat Code"}
                value={itemCatCodeField}
                sx={{
                  borderRadius: 1,
                  alignSelf: "center",
                  "& input": { padding: "0px 4px !important" },
                  height: "20px",
                  bgcolor: theme.palette.background.obvious,
                }}
                onChange={(e) => {
                  setItemCatCodeField(e.target.value);
                }}
              />
            </div>
          )}
        </div>
      ),
      renderCell: (params) => {
        return `${params.row.category_code} - ${params.row.category_description}`;
      },
    },
    {
      flex: 1,
      field: "status",
      display: "flex",
      resource_key: "item_prices_6_Status",
      headerName: t("item_prices_6_Status"),

      width: 105,
      renderHeader: () => (
        <div>
          {!showFilter && <span>{t("item_prices_6_Status") || "Status"}</span>}
          {showFilter && (
            <div onClick={(e) => e.stopPropagation()}>
              <TextField
                type="text"
                placeholder={t("item_prices_6_Status") || "Status"}
                value={itemStatusField}
                sx={{
                  borderRadius: 1,
                  alignSelf: "center",
                  "& input": { padding: "0px 4px !important" },
                  height: "20px",
                  bgcolor: theme.palette.background.obvious,
                }}
                onChange={(e) => {
                  setItemStatusField(e.target.value);
                }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      flex: 1,
      field: "legacy_code",
      display: "flex",
      resource_key: "item_prices_6_LegacyCode",
      headerName: t("item_prices_6_LegacyCode"),

      width: 150,
      renderHeader: () => (
        <div>
          {!showFilter && (
            <span>{t("item_prices_6_LegacyCode") || "Legacy Code"}</span>
          )}
          {showFilter && (
            <div onClick={(e) => e.stopPropagation()}>
              <TextField
                type="text"
                placeholder={t("item_prices_6_LegacyCode") || "Legacy Code"}
                value={itemLegacyCodeField}
                sx={{
                  borderRadius: 1,
                  alignSelf: "center",
                  "& input": { padding: "0px 4px !important" },
                  height: "20px",
                  bgcolor: theme.palette.background.obvious,
                }}
                onChange={(e) => {
                  setItemLegacyCodeField(e.target.value);
                }}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleLimitChange = (limit: number) => {
    setPageSize(limit);
  };

  const [selectedType, setSelectedType] = useState<{
    value: string;
    label: string;
  } | null>(optionsStandardPayer[0]);
  const [payerOption1, setPayerOption1] = useState<{
    payer_id: string;
    description: string;
  } | null>(null);
  // const [currentPayerOption1, setCurrentPayerOption1] = useState<string | null>(
  //   null
  // );
  const [payerOption2, setPayerOption2] = useState<{
    value: string;
    label: string;
  } | null>(null);
  // const [currentPriceListId, setCurrentPriceListId] = useState<string | null>(
  //   null
  // );

  const [payerDropdownOptions, setPayerDropdownOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "null", label: "" }]);
  const [priceListDropdownOptions, setPriceListDropdownOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "null", label: "" }]);

  const shouldClearCustomValuesRef = useRef(false);

  const handleSelectedType = async (selected: OptionType | null) => {
    const selectedOption = selected?.original;

    if (!selectedOption) return;

    try {
      setIosHistory([]);
      setSelectedType(selectedOption);

      // Clear the selected row state when switching types
      setCurrRowItemId(null);
      setCurrRowPayerId(null);
      setCurrRowPriceListId(null);
      setSelectedRow(null); // Also clear the selected row

      const getAllPayers = await api.get(`/item_prices/get-all-payers`);
      setPayerDropdownOptions([
        { value: "null", label: "" },
        ...getAllPayers?.data?.data.map((payer: any) => ({
          value: payer.payer_id,
          label: payer.payer_id + " " + payer.description,
        })),
      ]);

      setPayerOption1(null);
      setPayerOption2(null);
      setPrices({});
    } catch (error: any) {
      console.error("Error in handleSelectedType:", error.message);
    }
  };

  const handlePayerDropdown = async (
    selectedOption: { payer_id: string; description: string } | null,
  ) => {
    try {
      setIosHistory([]);
      setPayerOption1(selectedOption || null);
      setPayerOption2(null);
      // setCurrentPayerOption1((selectedOption?.payer_id || ''));
      // setCurrentPriceListId(null);
      setPrices({});

      // selectedPayerIdRef.current = +(selectedOption?.payer_id || 0);
      shouldClearCustomValuesRef.current = true;
    } catch (error: any) {
      setPriceListDropdownOptions([{ value: "null", label: "" }]);
    }
  };

  const handlePriceListDropdown = async (selected: {
    price_list_id: string;
    description: string;
  }) => {
    try {
      setIosHistory([]);
      setPayerOption2({
        label: selected?.description || "",
        value: selected?.price_list_id || "",
      });
      setPrices({});
      setCurrRowPriceListId(
        selected
          ? (selected as { price_list_id: string; description: string })
              .price_list_id
          : null,
      );
      // setCurrentPriceListId(
      //   selected
      //     ? (selected as { price_list_id: string; description: string })
      //         .price_list_id
      //     : null
      // );
      shouldClearCustomValuesRef.current = true;
    } catch (error: any) {
      console.error("ërror in handlePRiceListDropdown:", error.message);
    }
  };

  const optionsForCategory = [
    {
      value: "CategoryCode",
      label: t("item_prices_6_CategoryCodeFull") || "Category Code",
    },
    {
      value: "SubCategoryCode",
      label: t("item_prices_6_SubCategoryCode") || "Sub Category Code",
    },
  ];

  // const selectedPayerIdRef = useRef(0);

  const [category, setCategory] = useState<{
    value: string;
    label: string;
  } | null>(optionsForCategory[0]);
  const [selectedCategory, setSelectedCategory] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "null", label: "" }]);
  const [selectedCategoryData, setSelectedCategoryData] = useState<
    string | null
  >("");

  const handleCategoryDropdown = async (select: OptionType | null) => {
    let selectedOption = select?.original;
    setSelectedCategory(selectedOption);
    try {
      setSelectedCategoryData("");
      shouldClearCustomValuesRef.current = true;
    } catch (error: any) {
      console.error("error at handleCategoryDropdown");
    }
  };

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [selectedDateTwo, setSelectedDateTwo] = useState(new Date());

  const handleSearch = async () => {
    mutate((key) => {
      return apiUtility(key, "item_price");
    });
  };

  const [selectedChangeDate, setSelectedChangeDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [selectedChangeDateTwo, setSelectedChangeDateTwo] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const [prices, setPrices] = useState<{ [key: number]: any }>({});

  const handlePriceChange = (row: any, value: string) => {
    setCustomValues((prev) => ({
      ...prev,
      [row.item_id]: value,
    }));

    setPrices((prev: any) => {
      const newPrices = { ...prev };

      if (value.trim() === "") {
        delete newPrices[row.item_id];
      } else {
        newPrices[row.item_id] = {
          price_id: row.price_id,
          item_id: row.item_id,
          new_price: Number(value),
          start_date: selectedChangeDate,
          payer_id: payerOption1?.payer_id,
          price_list_id: payerOption2?.value || 0,
          category_code: row.category_code,
          description: row.description,
          legacy_code: row.legacy_code,
          item_bk: row.item_bk,
        };
      }

      return newPrices;
    });
  };

  const handleApplyPrices = async () => {
    try {
      setPrices((prev) => {
        const updatedPrices = { ...prev };
        for (const itemId in updatedPrices) {
          if (updatedPrices.hasOwnProperty(itemId)) {
            updatedPrices[itemId] = {
              ...updatedPrices[itemId],
              start_date: selectedChangeDate,
              payer_id: payerOption1?.payer_id || 0,
              price_list_id: payerOption2?.value || 0,
            };
          }
        }
        return updatedPrices;
      });

      const response = await api.post(`/item_prices/new_prices`, {
        data: prices,
      });

      shouldClearCustomValuesRef.current = true;

      setRows((prevRows: any) =>
        prevRows.map((row: any) => ({
          ...response.data,
          ...row,
        })),
      );

      mutate((key) => {
        return apiUtility(key, "item_price");
      });

      setForceRenderKey((prev) => prev + 1);
      shouldClearCustomValuesRef.current = true;
      setPrices({});

      toast.success("Item Price Updated");
      setOpenApplyAndSave(false);
      setCustomValues({});
    } catch (error: any) {
      console.error("handleApplyPrices error:", error.response.data.errors[0]);
      toast.error(
        error.response.data.errors[0] ||
          "no new price Given OR cannot apply price for back date OR this item have already price at this date!",
      );
    }
  };

  const clearFilter = () => {
    setPayerOption1(null);
    // setCurrentPayerOption1(null);
    setPayerOption2(null);
    setCurrRowPriceListId(null);
    setSelectedCategoryData(null);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    shouldClearCustomValuesRef.current = true;
  };

  const [selectedRow, setSelectedRow] = useState<ItemPrice | null>(null);
  const [disapprove, setDisapprove] = useState(false);
  const [disapproveAll, setDisapproveAll] = useState(false);

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    if (row?.status === "A") {
      setDisapprove(true);
    } else {
      setDisapprove(false);
    }
    handleIosPriceTable(row);
  };

  const handleApprove = async () => {
    if (!selectedRow) return;

    try {
      const response = await api.put(
        `/item_prices/approve/${selectedRow.price_id}`,
      );

      if (response.status === 200) {
        setRows((prevRows: any) =>
          prevRows.map((row: any) =>
            row.price_id === selectedRow.price_id
              ? { ...row, status: "A", id: row.price_id }
              : row,
          ),
        );
      }
      setDisapprove(true);

      mutate((key) => {
        return apiUtility(key, "item_price");
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    return () => {};
  }, [prices]);

  const handleDisapprove = async () => {
    if (!selectedRow) return;

    try {
      const response = await api.put(
        `/item_prices/disapprove/${selectedRow.price_id}`,
      );

      if (response.status === 200) {
        setRows((prevRows: any) =>
          prevRows.map((row: any) =>
            row.price_id === selectedRow.price_id
              ? { ...row, status: "D", id: row.price_id }
              : row,
          ),
        );
      }
      setDisapprove(false);

      mutate((key) => {
        return apiUtility(key, "item_price");
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDisapproveAll = async () => {
    if (!rows.length) return;

    setLoading(true);

    try {
      const updatedRows = rows.map((row: any) => ({
        ...row,
        status: "D",
      }));

      await api.post(`/item_prices/disapprove-all`, {
        items: updatedRows.map(({ price_id }: any) => price_id),
      });

      fetchData(page);
      mutate((key) => {
        return apiUtility(key, "item_price");
      });
      setDisapproveAll(false);
    } catch (error) {
      console.error("Error approving items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!rows.length) return;

    setLoading(true);

    try {
      const updatedRows = rows?.map((row: any) => ({
        ...row,
        status: "A",
      }));

      await api.post(`/item_prices/approve-all`, {
        items: updatedRows.map(({ price_id }: any) => price_id),
      });

      mutate((key) => {
        return apiUtility(key, "item_price");
      });
      setDisapproveAll(true);
    } catch (error) {
      console.error("Error approving items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndPrice = async () => {
    try {
      await api.put(`/item_prices/end-price/${openModalId?.price_id}`);

      mutate((key) => {
        return apiUtility(key, "item_price");
      });
      setForceRenderKey((prev) => prev + 1);
      handleClose();
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("End Date cannot be less than Start Date");
    }
  };

  const [iosHistory, setIosHistory] = useState<ItemPrice[]>([]);
  const [openIos, setOpenIos] = useState<boolean>(true);

  const handleIosPriceTable = async (row: any) => {
    if (!row) {
      // Reset all IDs when row is null
      setCurrRowItemId(null);
      setCurrRowPayerId(null);
      setCurrRowPriceListId(null);
      return;
    }

    setCurrRowItemId(row.item_id ? row.item_id : row.item_id);
    setCurrRowPayerId(row.payer_id ? row.payer_id : payerOption1?.payer_id);
    setCurrRowPriceListId(
      row.price_list_id ? row.price_list_id : payerOption2?.value,
    );
  };

  const [search, setSearch] = useState("");

  const handleSearchItem = async (e: any) => {
    setSearch(e.target.value);
  };

  const [openModalId, setOpenModalId] = useState<any | null>(null);

  const handleOpen = (row: any) => {
    setOpenModalId(row);
  };
  const handleClose = () => {
    setOpenModalId(null);
  };

  const fetchData = async (page: number) => {
    setLoading(true);
    setPage(page);
    try {
      let catValueString;
      if (selectedCategory?.value == "CategoryCode") {
        catValueString = `category_code=${selectedCategoryData || null}`;
      } else {
        catValueString = `sub_category_code=${selectedCategoryData || null}`;
      }

      const url = `item_prices?selectedType=${selectedType}&payer_id=${
        payerOption1?.payer_id || null
      }&price_list_id=${
        payerOption2?.value || null
      }&${catValueString}&price_option=${
        pricesOptions?.value
      }&filter_date=${selectedDate}&search=${search}&item_bk=${itemBkField}&item_desc=${itemDescField}&item_curr_price=${itemCurrPriceField}&item_cat_code=${itemCatCodeField}&item_status=${itemStatusField}&item_leg_code=${itemLegacyCodeField}&page=${page}&limit=${pageSize}`;

      const result = await api.get(url);

      const formattedRows = result.data.data.map(
        (itemPrice: any, index: any) => ({
          ...itemPrice,
          id: `${itemPrice.item_id}_${index}`,
        }),
      );

      setRows(formattedRows);
      setTotalRows(Number(result.data.total_count));
      setTotalPages(Number(result.data.totalPages));

      if (shouldClearCustomValuesRef.current) {
        setCustomValues({});
        shouldClearCustomValuesRef.current = false;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (rows.length === 0) {
      // Reset all selection states when no data
      setCurrRowItemId(null);
      setCurrRowPayerId(null);
      setCurrRowPriceListId(null);
      setSelectedRow(null);
      setIosHistory([]);
    }
  }, [rows]);

  const [openPriceListModal, setOpenPriceListModal] = useState(false);
  const handleOpenPriceListModal = () => setOpenPriceListModal(true);
  const handleClosePriceListModal = () => setOpenPriceListModal(false);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const [priceListValue, setPriceListValue] = useState<string>(" ");
  const handlePriceListValue = async () => {
    try {
      const result = await api.post(
        `/item_prices/add-price-list?price_list=${priceListValue}&payer_id=${payerOption1?.payer_id}`,
      );

      mutate((key) => apiUtility(key, "get-pricelist-based-on-payerid"));
      setPriceListValue(" ");
      setOpenPriceListModal(false);
      toast.success("Price List Added");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid input";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("handlePriceListValue error:", error.message);
    }
  };
  const [openApplyAndSave, setOpenApplyAndSave] = useState(false);
  const handleOpenApplyAndSave = () => setOpenApplyAndSave(true);
  const handleCloseApplyAndSave = () => setOpenApplyAndSave(false);

  const [openCopyPrice, setOpenCopyPrice] = useState(false);

  return (
    <>
      <Dialog
        open={openPriceListModal}
        onClose={handleClosePriceListModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="dialog-gradient"
      >
        <DialogContent sx={{ overflow: "visible" }}>
          <Box>
            <Secure.GLTypography2
              id="modal-modal-itle"
              variant="h6"
              component="h2"
              permission="item_prices_6_AddPriceListFor"
              fallBackText="Add Price List For "
            >
              {(t("item_prices_6_AddPriceListFor") ||
                "Add Price List For ") + " "}
              {payerOption1?.description}
            </Secure.GLTypography2>
            <Secure.GLSecureInputs.TextField
              permission={"item_prices_6_AddPriceListTextField"}
              type="text"
              value={priceListValue}
              onChange={(val: any) => {
                setPriceListValue(val);
              }}
              sx={{ mt: 1 }}
            />
            <Box
              id="modal-modal-description"
              sx={{
                mt: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                gap: 2,
              }}
              component="div"
            >
              <Secure.GLButton2
                uiText="generic_0_add"
                permission="item-prices_6__addPriceList"
                fallBackText="Add"
                onClick={handlePriceListValue}
                variant="contained"
              />
              <Secure.GLButton2
                uiText="generic_0_cancel"
                permission="item-prices_6_cancelPriceList"
                fallBackText="Cancel"
                onClick={handleClosePriceListModal}
                variant="contained"
                color="error"
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <DisplayMsgDialog
        onClose={handleClose}
        open={!!openModalId}
        status="WARNING"
        getResource={false}
        onAction={handleEndPrice}
        actionLabel={t("item-prices_6__endPrice") || "End Price"}
      >
        {t("item-prices_6_areYouSureYouWantEndPrices") ||
          "Are You Sure you want to End Price?"}
      </DisplayMsgDialog>
      <DisplayMsgDialog
        open={openApplyAndSave}
        onClose={handleCloseApplyAndSave}
        status="INFO"
        getResource={false}
        onAction={handleApplyPrices}
        actionLabel={t("item_prices_6_Confirm") || "Confirm"}
      >
        {selectedChangeDate <= new Date().toISOString().split("T")[0] ? (
          <Secure.GLTypography2
            permission="item_prices_6_ApplyPriceBackDate"
            id="modal-modal-title"
            variant="h6"
            component="h2"
            fallBackText=" Apply Price For Back Date?"
          >
            {t("item_prices_6_ApplyPriceBackDate") ||
              " Apply Price For Back Date?"}
          </Secure.GLTypography2>
        ) : (
          <Secure.GLTypography2
            permission="item_prices_6_ApplyPriceFutureDate"
            fallBackText="Apply Price For Future Date?"
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            {t("item_prices_6_ApplyPriceFutureDate") ||
              "Apply Price For Future Date?"}
          </Secure.GLTypography2>
        )}
      </DisplayMsgDialog>
      <Box
        sx={{
          minHeight: 500,
          width: "100%",
          placeItems: "start",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 1,
            flexWrap: "wrap",
            width: "100%",
            p: 0,
          }}
        >
          {/* amer is here */}
          <Box sx={{ width: "10%", flexGrow: "1" }}>
            <GlStaticAutoComplete
              name="standard_payer"
              options={optionsStandardPayer}
              idKey="value"
              labelKeys={["label"]}
              inputLabel={t("item_prices_6_Select") || "Select..."}
              value={selectedType?.value || ""}
              onChange={handleSelectedType}
              separator=" - "
            />
          </Box>

          {selectedType?.value === "Payer" && (
            <>
              <Box sx={{ width: "10%", flexGrow: "1" }}>
                <GlAutoComplete
                  name="payer_id"
                  url="/item_prices/get-all-payers"
                  labelKeys={["payer_id", "description"]}
                  separator=" - "
                  idKey="payer_id"
                  inputLabel="Select Payer "
                  value={payerOption1}
                  onChange={(value) => {
                    // setPayerOption2(null);
                    handlePayerDropdown(value as any);
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "10%",
                  flexGrow: "1",
                }}
              >
                {/* {JSON.stringify(payerOption1)} */}
                <Box sx={{ width: "50%", flexGrow: "1" }}>
                  <GlCustomAutoSuggest
                    name="price_list_id"
                    url={`/item_prices/get-pricelist-based-on-payerid/${
                      payerOption1?.payer_id || "-11"
                    }`}
                    labelKeys={["description"]}
                    idKey="price_list_id"
                    inputLabel="Select Price List "
                    value={payerOption2?.value || ""}
                    onChange={(value) => {
                      handlePriceListDropdown(value as any);
                    }}
                  />
                </Box>

                {payerOption1 && (
                  <IconButton onClick={handleOpenPriceListModal}>
                    <img
                      src={publicUrl(`themes/${mode}/icons/plus.png`)}
                      width="16px"
                      alt="filter"
                    />
                  </IconButton>
                )}
              </Box>
            </>
          )}
          <Box sx={{ width: "10%", flexGrow: "1" }}>
            <GlStaticAutoComplete
              name="category"
              inputLabel={
                t("item_prices_6_SelectCategory") || "Select Category"
              }
              options={optionsForCategory}
              idKey="value"
              labelKeys={["label"]}
              value={selectedCategory?.value || ""}
              onChange={(value) => {
                handleCategoryDropdown(value as any);
              }}
              separator=" - "
            />
          </Box>

          {selectedCategory?.value === "CategoryCode" ? (
            <Box sx={{ width: "10%", flexGrow: "1" }}>
              <GlCustomAutoSuggest
                name="category_data"
                url={`/item_prices/get-category?category=${selectedCategory.value}`}
                inputLabel={t("item_prices_6_Select") || "Select..."}
                value={selectedCategoryData || ""}
                onChange={(selectedOption) => {
                  setSelectedCategoryData(
                    (selectedOption as any)?.category_code || "",
                  );
                }}
                idKey="category_code"
                labelKeys={["category_code", "description"]}
                separator=" - "
              />
            </Box>
          ) : selectedCategory?.value === "SubCategoryCode" ? (
            <Box sx={{ width: "10%", flexGrow: "1" }}>
              <GlCustomAutoSuggest
                name="category_data"
                url={`/item_prices/get-category?category=${selectedCategory.value}`}
                inputLabel={t("item_prices_6_Select") || "Select..."}
                value={selectedCategoryData || ""}
                onChange={(selectedOption) => {
                  setSelectedCategoryData(
                    (selectedOption as any)?.sub_category_code || "",
                  );
                }}
                idKey="sub_category_code"
                labelKeys={["sub_category_code"]}
              />
            </Box>
          ) : (
            <Box sx={{ width: "10%", flexGrow: "1" }}>
              <GlCustomAutoSuggest
                name="category_data"
                url=""
                inputLabel={t("item_prices_6_Select") || "Select..."}
                value={selectedCategoryData || ""}
                onChange={(selectedOption) => {
                  setSelectedCategoryData("");
                }}
                idKey=""
                labelKeys={[]}
              />
            </Box>
          )}

          {/* <Box sx={{ display: "flex", gap: 3, width: "25%", flexGrow: "1" }}> */}
          <Box sx={{ width: "13%", flexGrow: "1" }}>
            <GlStaticAutoComplete
              inputLabel={t("item_prices_6_All") || "Select Price Option"}
              name="price_option"
              options={optionsForPrices}
              idKey="value"
              labelKeys={["label"]}
              value={pricesOptions?.value || ""}
              onChange={(value) => {
                setPricesOptions(value?.original as any);
              }}
              separator=" - "
            />
          </Box>

          <Box>
            <DatePicker
              format={dateFormat ? dateFormat : "dd/MM/yyyy"}
              value={selectedDateTwo}
              onChange={(newValue: any) => {
                const localDate = new Date(
                  newValue.getTime() - newValue.getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .split("T")[0];

                setSelectedDate(localDate);
                setSelectedDateTwo(newValue);
              }}
              sx={{
                "&": {
                  width: "100%",
                  height: "100% ",
                },
                "& .MuiPickersInputBase-sectionsContainer": {
                  padding: "0 !important",
                },
                "& .MuiPickersInputBase-root": {
                  height: "100%",
                },
              }}
            />
          </Box>
          {/* </Box> */}

          {/* <Box sx={{ width: "10%" }}>
            <Box sx={{ display: "flex", gap: 2, flex: 1 }}> */}
          <Box sx={{ alignSelf: "center" }}>
            <IconButton onClick={handleSearch}>
              {/* <SearchIcon /> */}
              <img
                src={publicUrl(`themes/${mode}/icons/search.png`)}
                width="16px"
                alt="filter"
              />
            </IconButton>
            <IconButton
              // variant="contained"
              // color="error"
              onClick={clearFilter}
            >
              {/* <ClearIcon /> */}
              <img
                src={publicUrl(`themes/${mode}/icons/clear.png`)}
                width="16px"
                alt="filter"
              />
            </IconButton>
          </Box>
          {/* </Box>
          </Box> */}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            width: "100%",
            mb: 1,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <div>
              <Secure.GLButton
                resource_key="item_prices_6_ApplySave"
                variant="contained"
                color="primary"
                sx={{ borderRadius: 0, whiteSpace: "nowrap" }}
                onClick={handleOpenApplyAndSave}
                startIcon={<DoneIcon />}
              >
                {t("item_prices_6_ApplySave") || "Apply & Save"}
              </Secure.GLButton>
            </div>

            <Box>
              <DatePicker
                label={t("item_prices_6_ChangeDate") || "Change Date:"}
                format={dateFormat ? dateFormat : "dd/MM/yyyy"}
                value={selectedChangeDateTwo}
                onChange={(e: any) => {
                  const localDate = new Date(
                    e.getTime() - e.getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .split("T")[0];

                  setSelectedChangeDate(localDate);
                  setSelectedChangeDateTwo(e);

                  setPrices((prev) => {
                    const updatedPrices = { ...prev };
                    for (const itemId in updatedPrices) {
                      if (updatedPrices.hasOwnProperty(itemId)) {
                        updatedPrices[itemId] = {
                          ...updatedPrices[itemId],
                          start_date: localDate,
                        };
                      }
                    }
                    return updatedPrices;
                  });
                }}
                // sx={{
                //   "&": {
                //     width: "100%",
                //     height: "100% ",
                //   },
                //   "& .MuiPickersInputBase-sectionsContainer": {
                //     padding: "0 !important",
                //   },
                //   "& .MuiPickersInputBase-root": {
                //     height: "100%",
                //   },
                // }}
              />
            </Box>
          </Box>

          {!disapprove && (
            <Secure.GLButton
              resource_key="item_prices_6_Approve"
              variant="text"
              color="primary"
              disabled={!selectedRow}
              onClick={handleApprove}
              sx={{ whiteSpace: "nowrap" }}
            >
              {t("item_prices_6_Approve") || "Approve"}
            </Secure.GLButton>
          )}

          {disapprove && (
            <Secure.GLButton
              resource_key="item_prices_6_Disapprove"
              variant="text"
              color="primary"
              disabled={!selectedRow}
              onClick={handleDisapprove}
              sx={{ whiteSpace: "nowrap" }}
            >
              {t("item_prices_6_Disapprove") || "Disapprove"}
            </Secure.GLButton>
          )}

          {!disapproveAll && (
            <Secure.GLButton
              resource_key="item_prices_6_ApproveAll"
              variant="text"
              color="primary"
              onClick={handleApproveAll}
              sx={{ whiteSpace: "nowrap" }}
            >
              {t("item_prices_6_ApproveAll") || "Approve All"}
            </Secure.GLButton>
          )}

          {disapproveAll && (
            <Secure.GLButton
              resource_key="item_prices_6_DisapproveAll"
              variant="text"
              color="primary"
              onClick={handleDisapproveAll}
              sx={{ whiteSpace: "nowrap" }}
            >
              {t("item_prices_6_DisapproveAll") || "Disapprove All"}
            </Secure.GLButton>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* <Secure.GLButton
            resource_key="item_prices_6_BatchEdit" startIcon={<ModeIcon />} variant="outlined" color="primary">
            {t("item_prices_6_BatchEdit") || "Batch Edit"}
          </Secure.GLButton> */}

            <Secure.GLButton
              resource_key="item_prices_6_CopyPrice"
              startIcon={<ContentCopyIcon />}
              variant="outlined"
              color="primary"
              onClick={() => setOpenCopyPrice(true)}
              sx={{ whiteSpace: "nowrap" }}
            >
              {t("item_prices_6_CopyPrice") || "Copy Price"}
            </Secure.GLButton>
            <CopyPriceModal
              page={page}
              openCopyPrice={openCopyPrice}
              handleClose={() => setOpenCopyPrice(false)}
              fetchData={fetchData}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Import
              page={page}
              selectedChangeDate={selectedChangeDate}
              fetchData={fetchData}
              currentPayerOption1={payerOption1?.payer_id || null}
              currentPriceListId={payerOption2?.value || null}
              label={t("item_prices_6_Import") || "Import"}
            />
            <Export
              rows={rows}
              currentPayerOption1={payerOption1?.payer_id || null}
              currentPayerOption2={payerOption2?.value || null}
              selectedCategoryData={selectedCategoryData}
              selectedType={selectedType}
              pricesOptions={pricesOptions}
              selectedDate={selectedDate}
              currentPriceListId={payerOption2?.value || null}
              catValueString={
                selectedCategory?.value == "CategoryCode"
                  ? `category_code=${selectedCategoryData || null}`
                  : `sub_category_code=${selectedCategoryData || null}`
              }
              search={search}
              label={t("item_prices_6_Export") || "Export"}
              itemBkField={itemBkField}
              itemDescField={itemDescField}
              itemCurrPriceField={itemCurrPriceField}
              itemCatCodeField={itemCatCodeField}
              itemStatusField={itemStatusField}
              itemLegacyCodeField={itemLegacyCodeField}
            />
            <PrintReport
              currentPayerOption1={payerOption1?.payer_id || null}
              currentPriceListId={payerOption2?.value || null}
              selectedType={selectedType}
              pricesOptions={pricesOptions}
              selectedDate={selectedDate}
              catValueString={
                selectedCategory?.value == "CategoryCode"
                  ? `category_code=${selectedCategoryData || null}`
                  : `sub_category_code=${selectedCategoryData || null}`
              }
              search={search}
              itemBkField={itemBkField}
              itemDescField={itemDescField}
              itemCurrPriceField={itemCurrPriceField}
              itemCatCodeField={itemCatCodeField}
              itemStatusField={itemStatusField}
              itemLegacyCodeField={itemLegacyCodeField}
            />
            <Secure.GLTextField
              resource_key="item_prices_6_SearchItem"
              type="text"
              value={search}
              placeholder={t("item_prices_6_SearchItem") || "Search Item"}
              onChange={(e) => {
                handleSearchItem(e);
              }}
              sx={{
                borderRadius: 2,
                alignSelf: "center",
                flexShrink: 0,
                width: "250px",
                "& input": { padding: "7px 10px !important" },
              }}
            />
            <Secure.GLIconButton
              resource_key=""
              onClick={() => {
                setShowFilter(!showFilter);
                setItemBkField("");
                setItemDescField("");
                setItemCurrPriceField("");
                setItemCatCodeField("");
                setItemStatusField("");
                setItemLegacyCodeField("");
              }}
              sx={{ whiteSpace: "nowrap" }}
            >
              <img
                src={publicUrl(`themes/${mode}/icons/filter.png`)}
                width="16px"
                alt="filter"
              />
            </Secure.GLIconButton>
          </Box>
        </Box>

        {/* {currentPriceListId} */}
        <Box sx={{ width: "100%" }}>
          <PageWithSideContent
            MainComp={
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <GlPanelTable>
                  {/* <GlCustomTable
                    limit={20}
                    smallSize
                    autoHeight
                    sx={{
                      "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiDataGrid-row": {
                        alignItems: "center",
                      },
                    }}
                    pageSizeOptions={[5, 10, 15, 20, 25, 50]}
                    handleDataChange={setRows}
                    getRowId={(row: any) => row.item_id + row.price_id}
                    params={{
                      selectedType: selectedType?.value,
                      payer_id: payerOption1?.payer_id || null,
                      price_list_id: payerOption2?.value || null,
                      price_option: pricesOptions?.value,
                      filter_date: selectedDate,
                      search,
                      item_bk: itemBkField,
                      item_desc: itemDescField,
                      item_curr_price: itemCurrPriceField,
                      item_cat_code: itemCatCodeField,
                      item_status: itemStatusField,
                      item_leg_code: itemLegacyCodeField,
                      ...(selectedCategory?.value == "CategoryCode"
                        ? { category_code: selectedCategoryData || null }
                        : { sub_category_code: selectedCategoryData || null }),
                    }}
                    url="/item_prices"
                    columns={columns}
                    onRowSelected={handleRowClick}
                    className="exact-40px-rows"
                  />  */}
                  <Secure.GLCustomTable2
                    permission="item_prices_6_ItemPriceTable"
                    fetcher={fetcher}
                    limit={25}
                    smallSize
                    sx={{
                      "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                      },
                      "& .MuiDataGrid-row": {
                        alignItems: "center",
                      },
                    }}
                    handleDataChange={setRows}
                    getRowId={(row: any) => row.item_id + row.price_id}
                    params={{
                      selectedType: selectedType?.value,
                      payer_id: payerOption1?.payer_id || null,
                      price_list_id: payerOption2?.value || null,
                      price_option: pricesOptions?.value,
                      filter_date: selectedDate,
                      search,
                      item_bk: itemBkField,
                      item_desc: itemDescField,
                      item_curr_price: itemCurrPriceField,
                      item_cat_code: itemCatCodeField,
                      item_status: itemStatusField,
                      item_leg_code: itemLegacyCodeField,
                      ...(selectedCategory?.value == "CategoryCode"
                        ? { category_code: selectedCategoryData || null }
                        : { sub_category_code: selectedCategoryData || null }),
                    }}
                    url="/item_prices"
                    columns={columns as any}
                    onRowSelected={handleRowClick}
                  />
                </GlPanelTable>
              </Box>
            }
            SubComp={
              <PriceHistoryTable
                openIos={openIos}
                setOpenIos={setOpenIos}
                iosHistory={iosHistory}
                setIosHistory={setIosHistory}
                currRowItemId={currRowItemId}
                currRowPayerId={currRowPayerId}
                currRowPriceListId={currRowPriceListId}
                key={forceRenderKey}
              />
            }
            collapseBarWidth={20}
            subWidth={23}
            barBg={theme.palette.background.obvious}
            borderRadius={4}
          />
        </Box>
      </Box>
    </>
  );
};

export default ItemPriceDG;
