import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { DesktopDatePicker as DatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { useAppSelector } from "../../../hooks/hooks";
import api from "../../../utils/Api";
import { apiUtility } from "../../../utils/apiUtility";
import { mutate } from "swr";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import AutoCompleteCell from "../../resources/components/AutoCompleteCell";

interface CopyPricesModalProps {
  handleClose(): void;
  fetchData(page: number): void;
  openCopyPrice: boolean;
  page: number;
}

const CopyPriceModal: React.FC<CopyPricesModalProps> = ({
  openCopyPrice,
  fetchData,
  handleClose,
  page,
}) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    background: "linear-gradient(#2764AF , #55C5D6)",
    p: 4,
  };

  const [openCancel, setOpenCancel] = useState(false);
  const handleOpenCancel = () => setOpenCancel(true);
  const handleCloseCancel = () => setOpenCancel(false);
  const dateFormat = useAppSelector((state) => {
    return state.config.values.DATE_FORMAT;
  });

  const [priceType, setPriceType] = useState("standard");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedDateMUI, setSelectedDateMUI] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);

  const isPurchaserPrice = priceType === "purchaser";

  const [payerDropdownOptions, setPayerDropdownOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "null", label: "" }]);

  const [payerOption1, setPayerOption1] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [payerOption2, setPayerOption2] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [payerOption3, setPayerOption3] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [payerOption4, setPayerOption4] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [priceListDropdownOptions1, setPriceListDropdownOptions1] = useState<
    { value: string; label: string }[]
  >([{ value: "null", label: "" }]);

  const [priceListDropdownOptions2, setPriceListDropdownOptions2] = useState<
    { value: string; label: string }[]
  >([{ value: "null", label: "" }]);

  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    return null;
  }

  const { resourcesData, t, userLang } = ctx;

  useEffect(() => {
    fetchPayers();
  }, [payerOption1, payerOption2, payerOption3, payerOption4]);

  const fetchPayers = async () => {
    try {
      setLoading(true);
      const getAllPayers = await api.get(`item_prices/get-all-payers`);

      setPayerDropdownOptions([
        ...getAllPayers?.data?.data?.map((payer: any) => ({
          value: payer.payer_id,
          label: payer.payer_id + " - " + payer.description,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching payers", error);
    } finally {
      setLoading(false);
      // fetchData(page);
      mutate((key) => {
        return apiUtility(key, "item_price");
      });
    }
  };

  const handleCopyPriceSubmit = async () => {
    if (controller) {
      controller.abort();
    }

    const abortController = new AbortController();
    setController(abortController);

    try {
      if (priceType === "standard" && payerOption3 === null) {
        toast.error("Please select a Purchaser!");
        return;
      }

      if (
        isPurchaserPrice &&
        (payerOption1 === null || payerOption3 === null)
      ) {
        toast.error("Please select a Purchaser!");
        return;
      }

      setLoading(true);

      const response = await api.post(
        `item_prices/copy-price`,
        {},
        {
          params: {
            date: selectedDate,
            payerOption1: payerOption1?.value,
            payerOption2: payerOption2?.value,
            payerOption3: payerOption3?.value,
            payerOption4: payerOption4?.value,
          },
          signal: abortController.signal,
        },
      );

      toast.success("Copy Price Completed!");
      toast.success(`updated Items:${response.data.updatedItems} `);
      toast.success(`skipped Items:${response.data.skippedItems} `);

      setPayerOption1(null);
      setPayerOption2(null);
      setPayerOption3(null);
      setPayerOption4(null);
      handleClose();
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request was cancelled");
      } else {
        toast.error(
          `Error copying prices: ${
            error.response?.data?.message || error.message
          }`,
        );
      }
    } finally {
      setLoading(false);
      setController(null);
    }
  };

  const handleCancel = async () => {
    if (controller) {
      controller.abort(); // Abort the request
      setLoading(false);
      setController(null);
      setOpenCancel(false);
    }

    try {
      await api.post(
        `item_prices/abort-copy-price?payerOption3=${payerOption3?.value}`,
      );
      toast.error("Cancelled Copying Prices");
    } catch (error) {
      console.error("Error Aborting copy process with this message:");
    }
  };

  return (
    <Dialog open={openCopyPrice} onClose={handleClose}>
      <Box
        sx={{
          width: 400,
          p: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        {loading && <LinearProgress />}
        <Typography
          variant="h6"
          mb={2}
          sx={{
            color: (theme) =>
              theme.palette.mode === "light" ? "text.obs" : "text.obs",
          }}
        >
          {t("item_prices_6_CopyPrices") || "Copy Prices"}
        </Typography>
        <RadioGroup
          row
          value={priceType}
          onChange={(e) => {
            setPriceType(e.target.value);
            if (isPurchaserPrice) {
              setPayerOption1(null);
              setPayerOption2(null);
            }
          }}
        >
          <FormControlLabel
            value="standard"
            control={<Radio />}
            label={t("item_prices_6_StandardPrice") || "Standard Price"}
            // sx={{
            //   color: (theme) =>
            //     theme.palette.mode === "light" ? "text.obs" : "text.obs",
            // }}
          />

          <FormControlLabel
            value="purchaser"
            control={<Radio />}
            label={t("item_prices_6_PurchaserPrice") || "Purchaser Price"}
            // sx={{
            //   color: (theme) =>
            //     theme.palette.mode === "light" ? "text.obs" : "text.obs",
            // }}
          />
        </RadioGroup>
        {/* <Typography
          mt={2}
          sx={{
            color: (theme) =>
              theme.palette.mode === "light" ? "text.obs" : "text.obs",
          }}
        >
          {t("item_prices_6_FromPurchaser") || "From Purchaser"}
        </Typography> */}
        <Autocomplete
          sx={{ m: 1, width: "100%" }}
          disabled={!isPurchaserPrice}
          options={payerDropdownOptions}
          value={payerOption1}
          onChange={async (_, selectedOption) => {
            setPayerOption1(selectedOption);
            try {
              const resultOfPriceList = await api.get(
                `item_prices/get-pricelist-based-on-payerid/${
                  selectedOption?.value
                }`,
              );
              setPriceListDropdownOptions1([
                // { value: "null", label: "" },
                ...resultOfPriceList.data?.data?.map((priceList: any) => ({
                  value: priceList.price_list_id,
                  label: priceList.description,
                })),
              ]);
            } catch (error: any) {
              console.log("error for handlePayerDropdown", error.message);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("item_prices_6_FromPurchaser") || "From Purchaser"}
            />
          )}
        />
        {/* <Select
          value={payerOption1}
          options={payerDropdownOptions}
          isDisabled={!isPurchaserPrice}
          onChange={async (
            selectedOption: { value: string; label: string } | null,
          ) => {
            try {
              setPayerOption1(selectedOption);
              const resultOfPriceList = await api.get(
                `item_prices/get-pricelist-based-on-payerid/${
                  selectedOption?.value
                }`,
              );
              setPriceListDropdownOptions1([
                { value: "null", label: "" },
                ...resultOfPriceList.data?.data?.map((priceList: any) => ({
                  value: priceList.price_list_id,
                  label: priceList.description,
                })),
              ]);
            } catch (error: any) {
              console.log("error for handlePayerDropdown", error.message);
            }
          }}
          placeholder="Select..."
          isSearchable
        /> */}
        {/* <Typography
          mt={2}
          sx={{
            color: (theme) =>
              theme.palette.mode === "light" ? "text.obs" : "text.obs",
          }}
        >
          {t("item_prices_6_FromPurchaserPriceList") ||
            "From Purchaser Price List"}
        </Typography> */}

        <Autocomplete
          sx={{ m: 1, width: "100%" }}
          disabled={!isPurchaserPrice}
          options={priceListDropdownOptions1}
          value={payerOption2}
          onChange={(e, selectedOption) => {
            setPayerOption2(selectedOption);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                t("item_prices_6_FromPurchaserPriceList") ||
                "From Purchaser Price List"
              }
            />
          )}
        />
        {/* <Select
          value={payerOption2}
          options={priceListDropdownOptions1}
          isDisabled={!isPurchaserPrice}
          onChange={setPayerOption2}
          placeholder="Select..."
          isSearchable
        /> */}
        {/* <Typography
          mt={2}
          sx={{
            color: (theme) =>
              theme.palette.mode === "light" ? "text.obs" : "text.obs",
          }}
        >
          {t("item_prices_6_ToPurchaser") || "To Purchaser"}
        </Typography> */}
        <Autocomplete
          sx={{ m: 1, width: "100%" }}
          options={payerDropdownOptions}
          value={payerOption3}
          onChange={async (
            e,
            selectedOption: { value: string; label: string } | null,
          ) => {
            try {
              setPayerOption3(selectedOption);
              const resultOfPriceList = await api.get(
                `item_prices/get-pricelist-based-on-payerid/${
                  selectedOption?.value
                }`,
              );
              setPriceListDropdownOptions2([
                // { value: "null", label: "" },
                ...resultOfPriceList?.data?.data.map((priceList: any) => ({
                  value: priceList.price_list_id,
                  label: priceList.description,
                })),
              ]);
            } catch (error: any) {
              console.log("error for handlePayerDropdown", error.message);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("item_prices_6_ToPurchaser") || "To Purchaser"}
            />
          )}
        />
        {/* <Select
          value={payerOption3}
          options={payerDropdownOptions}
          onChange={async (
            selectedOption: { value: string; label: string } | null,
          ) => {
            try {
              setPayerOption3(selectedOption);
              const resultOfPriceList = await api.get(
                `item_prices/get-pricelist-based-on-payerid/${
                  selectedOption?.value
                }`,
              );
              setPriceListDropdownOptions2([
                { value: "null", label: "" },
                ...resultOfPriceList?.data?.data.map((priceList: any) => ({
                  value: priceList.price_list_id,
                  label: priceList.description,
                })),
              ]);
            } catch (error: any) {
              console.log("error for handlePayerDropdown", error.message);
            }
          }}
          placeholder="Select..."
          isSearchable
        /> */}
        {/* <Typography
          mt={2}
          sx={{
            color: (theme) =>
              theme.palette.mode === "light" ? "text.obs" : "text.obs",
          }}
        >
          {t("item_prices_6_ToPurchaserPriceList") || "To Purchaser Price List"}
        </Typography> */}
        <Autocomplete
          sx={{ m: 1, width: "100%" }}
          options={priceListDropdownOptions2}
          value={payerOption4}
          onChange={(e, selectedOption) => {
            setPayerOption4(selectedOption);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                t("item_prices_6_ToPurchaserPriceList") ||
                "To Purchaser Price List"
              }
            />
          )}
        />

        {/* <Select
          value={payerOption4}
          options={priceListDropdownOptions2}
          onChange={setPayerOption4}
          placeholder="Select..."
          isSearchable
        /> */}
        <Box sx={{ width: "100%", p: 0, m: 1 }}>
          {/* <DatePicker
              value={selectedDate}
              onChange={(e: any) => {
                const localDate = new Date(e.getTime() - e.getTimezoneOffset() * 60000)
                  .toISOString()
                  .split("T")[0];
                setSelectedDate(localDate);
              }}
              format="dd/MM/yyyy"
              clearIcon={null}
            /> */}

          <DatePicker
            sx={{ width: "100%" }}
            format={dateFormat ? dateFormat : "dd/MM/yyyy"}
            value={selectedDateMUI}
            onChange={(e: any) => {
              const localDate = new Date(
                e.getTime() - e.getTimezoneOffset() * 60000,
              )
                .toISOString()
                .split("T")[0];
              setSelectedDate(localDate);
              setSelectedDateMUI(e);
            }}
          />
        </Box>
        <Box
          sx={{
            width: "100%",
            mt: 2,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 4,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleCopyPriceSubmit}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : t("item_prices_6_ApplySave2") || "Apply & Save"}
          </Button>

          {loading ? (
            <div>
              <Button onClick={handleOpenCancel} color="error">
                Cancel Copy
              </Button>
              <Dialog
                open={openCancel}
                onClose={handleCloseCancel}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="dialog-gradient"
              >
                <DialogContent sx={{ overflow: "visible" }}>
                  <Box>
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h2"
                    >
                      Are you sure you want to cancel copy price operation?
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleCancel}
                      >
                        Yes, Cancel Copying
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleCloseCancel}
                      >
                        No, Don't Cancel
                      </Button>
                    </Box>
                  </Box>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Button
              variant="contained"
              color="error"
              // sx={{ backgroundColor: "text.obs", color: "primary.main" }}
              onClick={handleClose}
            >
              {t("item_prices_6_Close") || "Close"}
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default CopyPriceModal;
