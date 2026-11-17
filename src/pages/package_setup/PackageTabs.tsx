import {
  Box,
  Button,
  Stack,
  Typography,
  Tooltip,
  Paper,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  alpha,
  Tabs,
  Tab,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import CategoryIcon from "@mui/icons-material/Category";
import BlockIcon from "@mui/icons-material/Block";
import LimitIcon from "@mui/icons-material/LocalOffer";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import {
  clearError,
  createPackage,
  addItemToPackage,
  excludeItemFromPackage,
  deleteParentPackage,
  deleteChildPackage,
  limitCategoryInPackage,
  updateItem,
} from "../../redux/slices/packageSetupSlice";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useContext, useEffect, useState } from "react";
import LimitCategoryForm from "./LimitCategoryForm";
import LimitItemsForm from "./LimitItemsForm ";
import ExcludeItemsForm from "./ExcludeItemsForm";
import { PackageItem } from "../../types/PackageSetup";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { publicUrl } from "../../utils/publicUrl";
import { Secure } from "@givc/shared-components";
import { DisplayMsgDialog } from "@givc/shared-components";
interface PackageTabsProps {
  limited: PackageItem[];
  excluded: PackageItem[];
  category: PackageItem[];
  onAdd: (
    type: "limited" | "excluded" | "category" | string,
    item: PackageItem,
  ) => void;
  onEdit: (
    type: "limited" | "excluded" | "category" | string,
    item: PackageItem,
  ) => void;
  onDelete: (
    type: "limited" | "excluded" | "category" | string,
    id: number,
  ) => void;
  packageId: number;
}

// Separate component for each tab section
interface TabSectionProps {
  title: string;
  type: "limited" | "excluded" | "category" | string | string;
  data: PackageItem[];
  icon: React.ReactNode;
  description: string;
  withCategory: boolean;
  color: string;
  selectedItem: PackageItem | null;
  onSelectItem: (item: PackageItem | null) => void;
  // onAdd: () => void;
  // onEdit: () => void;
  // onDelete: () => void;
  onOpenDialog: (
    type: "limited" | "excluded" | "category" | string | string,
    item: PackageItem | null,
  ) => void;
  makeColumns: (withCategory?: boolean, excluded?: boolean) => GridColDef[];
  packageId: number;
}

const TabSection: React.FC<TabSectionProps> = ({
  title,
  type,
  data,
  icon,
  description,
  withCategory,
  color,
  selectedItem,
  onSelectItem,
  // onAdd,
  // onEdit,
  // onDelete,
  onOpenDialog,
  makeColumns,
  packageId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;
  console.log("look here", makeColumns(withCategory, type === "excluded"));
  console.log(data);
  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        mb: 2,
        borderRadius: 1.5,
        borderTop: `3px solid ${alpha(color, 0.7)}`,
        height: "100%",
      }}
    >
      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "stretch" : "center"}
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            {icon}
            <Box component="span" sx={{ ml: 0.5 }}>
              {title}
            </Box>
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.7rem",
            }}
          >
            <InfoIcon sx={{ fontSize: 14, mr: 0.3 }} /> {description}
          </Typography>
        </Box>

        {/* <Stack direction="row" spacing={0.5} sx={{ mt: isMobile ? 1 : 0 }}>
          <Tooltip title={t("packageSetup_15_Add")}>
            <span>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon sx={{ fontSize: "1rem" }} />}
                onClick={onAdd}
                disabled={!packageId}
                sx={{
                  borderRadius: 1,
                  fontSize: "0.7rem",
                  py: 0.25,
                  px: 1,
                }}
              >
                {t("packageSetup_15_Add")}
              </Button>
            </span>
          </Tooltip>
          {type !== "excluded" && (
            <Tooltip title={t("packageSetup_15_Edit")}>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon sx={{ fontSize: "0.9rem" }} />}
                  onClick={onEdit}
                  disabled={!selectedItem}
                  sx={{
                    borderRadius: 1,
                    fontSize: "0.7rem",
                    py: 0.25,
                    px: 1,
                    minWidth: "auto",
                  }}
                >
                  {t("packageSetup_15_Edit")}
                </Button>
              </span>
            </Tooltip>
          )}

          <Tooltip title={t("packageSetup_15_Remove")}>
            <span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon sx={{ fontSize: "0.9rem" }} />}
                onClick={onDelete}
                disabled={!selectedItem}
                sx={{
                  borderRadius: 1,
                  fontSize: "0.7rem",
                  py: 0.25,
                  px: 1,
                  minWidth: "auto",
                }}
              >
                {t("packageSetup_15_Remove")}
              </Button>
            </span>
          </Tooltip>
        </Stack> */}
      </Stack>

      {data?.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            textAlign: "center",
            py: 2,
            backgroundColor: alpha(theme.palette.grey[50], 0.5),
          }}
        >
          <CardContent
            sx={{
              p: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <CategoryIcon color="disabled" sx={{ fontSize: 30, mb: 0.5 }} />
            <Typography variant="caption" color="textSecondary">
              {t("packageSetup_15_No")} {title.toLowerCase()}{" "}
              {t("packageSetup_15_AddedYet")}
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<AddCircleOutlineIcon sx={{ fontSize: "0.9rem" }} />}
              onClick={() => onOpenDialog(type, null)}
              disabled={!packageId}
              sx={{ mt: 0.5, fontSize: "0.7rem" }}
            >
              {t("packageSetup_15_AddFirstItem")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ height: 220, width: "100%" }}>
          <DataGrid
            rows={data}
            columns={makeColumns(withCategory, type === "excluded")}
            getRowId={(row) => row.item_id || row.item_category}
            pageSizeOptions={[5]}
            pagination
            onRowClick={(params) => onSelectItem(params.row)}
            disableColumnMenu
            disableColumnSorting
          />
        </Box>
      )}
    </Paper>
  );
};

const PackageTabs: React.FC<PackageTabsProps> = ({
  limited,
  excluded,
  category,
  onAdd,
  onEdit,
  onDelete,
  packageId,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currType, setCurrType] = useState<
    "limited" | "excluded" | "category" | string
  >("limited");
  const [currItem, setCurrItem] = useState<PackageItem | null>(null);
  const [selectedLimited, setSelectedLimited] = useState<PackageItem | null>(
    null,
  );
  const [selectedExcluded, setSelectedExcluded] = useState<PackageItem | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<PackageItem | null>(
    null,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const dispatch = useAppDispatch();
  const { error, selectedPackage, selectedItem } = useAppSelector(
    (state) => state.package,
  );

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  useEffect(() => {
    if (selectedLimited) {
      const updated = limited.find(
        (d) => d.item_id === selectedLimited.item_id,
      );
      if (updated) setSelectedLimited(updated);
    }
  }, [limited]);
  useEffect(() => {
    if (selectedExcluded) {
      const updated = excluded.find(
        (d) => d.item_id === selectedExcluded.item_id,
      );
      if (updated) setSelectedExcluded(updated);
    }
  }, [excluded]);
  useEffect(() => {
    if (selectedCategory) {
      const updated = category.find(
        (d) => d.item_category === selectedCategory.item_category,
      );
      if (updated) setSelectedCategory(updated);
    }
  }, [category]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (
    type: "limited" | "excluded" | "category" | string,
    item: PackageItem | null = null,
  ) => {
    console.log({ item });

    setCurrType(type);

    // Set default values based on the type
    const defaultValues: PackageItem = {
      description: "",
      package_item_id: "",
      limit_quantity: null,
      limit_day_amount: null,
      item_category: null,
      item_id: "",
      relation: type === "excluded" ? "EXCLUDE" : "INCLUDE",
      limit_amount: null,

      limit_amount_exclude: 0,
      facility_id: 1,
      status: "ACTIVE",
      payer_id: "",
      created_by: null,
      creation_date: null,
      package_conf_id: "",
    };

    setCurrItem(item || defaultValues);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrItem(null);
    dispatch(clearError());
  };

  // 2. Limit Item in Package

  const handleSaveLimitedItem = async (
    values: any,
    isUpdate: boolean = false,
  ) => {
    console.log({ values });

    if (isUpdate) {
      await dispatch(updateItem(values))
        .unwrap()
        .then(() => setOpenDialog(false))
        .catch((error) => {
          throw error;
        });
    } else {
      await dispatch(addItemToPackage(values))
        .unwrap()
        .then(() => setOpenDialog(false))
        .catch((error) => {
          throw error;
        });
    }
  };

  // 3. Exclude Item in Package
  const handleSaveExcludedItem = async (
    values: any,
    isUpdate: boolean = false,
  ) => {
    console.log({ isUpdate });

    if (isUpdate) {
      await dispatch(updateItem(values))
        .unwrap()
        .then(() => setOpenDialog(false))
        .catch((error) => {
          throw error;
        });
    } else {
      await dispatch(excludeItemFromPackage(values))
        .unwrap()
        .then(() => setOpenDialog(false))
        .catch((error) => {
          throw error;
        });
    }
  };

  // 4. Limit Category in Package
  const handleSaveCategory = async (values: any, isUpdate: boolean = false) => {
    if (isUpdate) {
      await dispatch(updateItem(values))
        .unwrap()
        .then(() => setOpenDialog(false))
        .catch((error) => {
          throw error;
        });
    } else {
      await dispatch(limitCategoryInPackage(values))
        .unwrap()
        .then(() => setOpenDialog(false))
        .catch((error) => {
          throw error;
        });
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "limited" | "excluded" | "category" | string;
    item: PackageItem;
  } | null>(null);

  // Open confirm dialog
  const handleDeleteClick = (
    type: "limited" | "excluded" | "category" | string,
    item: PackageItem | null,
  ) => {
    if (item) {
      dispatch(clearError());
      setDeleteTarget({ type, item });
      setOpenDeleteDialog(true);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      try {
        await dispatch(
          deleteChildPackage(deleteTarget.item.package_conf_id.toString()),
        ).unwrap();
        if (deleteTarget.type === "limited") setSelectedLimited(null);
        if (deleteTarget.type === "excluded") setSelectedExcluded(null);

        setOpenDeleteDialog(false);
        setDeleteTarget(null);
      } catch (error) {
        console.error("Delete failed:", error);
        throw error;
      }
    }
  };

  const makeColumns = (
    withCategory = false,
    excluded = false,
  ): GridColDef[] => {
    const base: GridColDef[] = [
      {
        field: "item_description",
        headerName: t("packageSetup_15_Description"),
        // flex: 3,
        width: excluded ? 1080 : 600,
        minWidth: 120,
        renderCell: (params) => (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {params.value}
            </Typography>
            <Chip
              label={params.row.item_id}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ height: 20, fontSize: "0.8rem" }}
            />
          </Stack>
        ),
      },
      {
        field: "limit_quantity",
        headerName: t("packageSetup_15_QtyLimit"),
        // flex: 1,
        width: 155,
        minWidth: 80,
        renderCell: (params: any) =>
          params.value ? (
            <Chip
              label={params.value}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.8rem" }}
            />
          ) : (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ fontSize: "0.7rem" }}
            >
              -
            </Typography>
          ),
      },
      {
        field: "limit_day_amount",
        headerName: t("packageSetup_15_DailyLimit"),
        // flex: 1,
        width: 155,
        minWidth: 80,
        renderCell: (params: any) =>
          params.value ? (
            <Chip
              label={params.value}
              size="small"
              color="info"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.8rem" }}
            />
          ) : (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ fontSize: "0.7rem" }}
            >
              -
            </Typography>
          ),
      },
      {
        field: "limit_amount",
        headerName: t("packageSetup_15_LimitAmount"),
        // flex: 1,
        width: 155,
        minWidth: 80,
        renderCell: (params: any) =>
          params.value ? (
            <Chip
              label={params.value}
              size="small"
              color="info"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.8rem" }}
            />
          ) : (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ fontSize: "0.7rem" }}
            >
              -
            </Typography>
          ),
      },
    ];
    const actionCol: GridColDef = {
      field: "Actions",
      type: "actions",
      headerName: t("generic_0_actions"),
      //
      width: 155,
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "space-between",
          }}
        >
          <span>
            <strong>Actions</strong>
          </span>
          <Secure.GLIconButton2
            permission="packageSetup_15_addIcon"
            uiText="generic_0_add"
            fallBackText="Add"
            onClick={() => handleOpenDialog(sectionData[activeTab].type)}
            size="small"
          >
            <img
              src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
            />
          </Secure.GLIconButton2>
        </Box>
      ),
      renderCell: (p: any) => (
        <Stack
          direction="row"
          justifyContent="center"
          marginLeft="auto"
          alignItems="center"
          spacing={1}
          sx={{ height: "100%" }}
        >
          {!excluded && (
            <Secure.GLIconButton2
              permission="packageSetup_15_editIcon"
              uiText="generic_0_edit"
              fallBackText="Edit"
              onClick={() =>
                handleOpenDialog(sectionData[activeTab].type, p.row)
              }
              size="small"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/pen.png`)}
                alt="Edit"
              />
            </Secure.GLIconButton2>
          )}

          <Secure.GLIconButton2
            permission="packageSetup_15_deleteIcon"
            uiText="generic_0_delete"
            fallBackText="Delete"
            onClick={() =>
              handleDeleteClick(sectionData[activeTab].type, p.row)
            }
            size="small"
          >
            <img
              src={publicUrl(`themes/${theme.palette.mode}/icons/delete.png`)}
              alt="Delete"
            />
          </Secure.GLIconButton2>
        </Stack>
      ),
    };

    if (excluded) {
      return [base[0], actionCol];
    }

    if (withCategory) {
      const categoryCol: GridColDef = {
        field: "category_description",
        headerName: t("packageSetup_15_Description"),
        // flex: 3,
        width: 615,
        minWidth: 120,
        renderCell: (params) => (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {params.value}
            </Typography>
            <Chip
              label={params.row.item_category}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ height: 20, fontSize: "0.8rem" }}
            />
          </Stack>
        ),
      };

      return [
        categoryCol,
        {
          field: "limit_amount_exclude",
          headerName: t("packageSetup_15_LimitAmountExclude"),
          // flex: 1,
          width: 155,
          minWidth: 80,
        },
        ...base.slice(2),
        actionCol,
      ];
    }
    base.push(actionCol);
    return base;
  };

  const sectionData = [
    {
      title: t("packageSetup_15_LimitedItems"),
      type: "limited",
      data: limited,
      icon: <LimitIcon fontSize="small" />,
      description: t("packageSetup_15_ItemsWithRestrictions"),
      withCategory: false,
      color: theme.palette.primary.main,
      selectedItem: selectedLimited,
      setSelectedItem: setSelectedLimited,
    },
    {
      title: t("packageSetup_15_ExcludedItems"),
      type: "excluded",
      data: excluded,
      icon: <BlockIcon fontSize="small" />,
      description: t("packageSetup_15_ItemsNotAvailable"),
      withCategory: false,
      color: theme.palette.error.main,
      selectedItem: selectedExcluded,
      setSelectedItem: setSelectedExcluded,
    },
    {
      title: t("packageSetup_15_Category"),
      type: "category",
      data: category,
      icon: <CategoryIcon fontSize="small" />,
      description: t("packageSetup_15_ListLimitedCategories"),
      withCategory: true,
      color: theme.palette.success.main,
      selectedItem: selectedCategory,
      setSelectedItem: setSelectedCategory,
    },
  ];

  return (
    <Box sx={{ p: 1.5 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="package items tabs"
        >
          <Tab
            icon={<LimitIcon />}
            iconPosition="start"
            label={t("packageSetup_15_LimitedItems")}
          />
          <Tab
            icon={<BlockIcon />}
            iconPosition="start"
            label={t("packageSetup_15_ExcludedItems")}
          />
          <Tab
            icon={<CategoryIcon />}
            iconPosition="start"
            label={t("packageSetup_15_Categories")}
          />
        </Tabs>
      </Box>

      {sectionData.map((section, index) => (
        <Box key={index} hidden={activeTab !== index}>
          <TabSection
            title={section.title}
            type={section.type}
            data={section.data}
            icon={section.icon}
            description={section.description}
            withCategory={section.withCategory}
            color={section.color}
            selectedItem={section.selectedItem}
            onSelectItem={section.setSelectedItem}
            // onAdd={() => handleOpenDialog(section.type)}
            // onEdit={() => handleOpenDialog(section.type, section.selectedItem)}
            // onDelete={() =>
            //   handleDeleteClick(section.type, section.selectedItem)
            // }
            onOpenDialog={handleOpenDialog}
            makeColumns={makeColumns}
            packageId={packageId}
          />
        </Box>
      ))}

      <GenericDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={
          (currItem?.item_id && currItem.item_id != "0") ||
          currItem?.item_category
            ? `${t("packageSetup_15_Update")} ${
                currType === "limited"
                  ? t("packageSetup_15_LimitedItems")
                  : currType === "excluded"
                    ? t("packageSetup_15_ExcludedItems")
                    : t("packageSetup_15_Category")
              }`
            : `${
                currType === "limited"
                  ? t("packageSetup_15_LimitedItems")
                  : currType === "excluded"
                    ? t("packageSetup_15_ExcludedItems")
                    : t("packageSetup_15_Category")
              }`
        }
        icon={<CategoryIcon />}
        content={
          currItem && (
            <>
              {currType === "limited" && (
                <LimitItemsForm
                  initialValues={currItem}
                  onSubmit={(values) => {
                    const payload = {
                      ...values,
                      package_item_id: selectedPackage
                        ? selectedPackage?.package_item_id
                        : selectedItem?.id,
                      mode: currType,
                    };
                    handleSaveLimitedItem(
                      payload,
                      currItem?.item_id && currItem.item_id != "0",
                    );
                    mutate((e) => apiUtility(e, "package/new"));
                  }}
                  onClose={handleCloseDialog}
                  error={error || ""}
                  isUpdate={!!(currItem?.item_id && currItem.item_id != "0")}
                  parentPackageId={packageId}
                />
              )}
              {currType === "excluded" && (
                <ExcludeItemsForm
                  initialValues={currItem}
                  onSubmit={(values) => {
                    const payload = {
                      ...values,
                      package_item_id: selectedPackage
                        ? selectedPackage?.package_item_id
                        : selectedItem?.id,
                    };
                    console.log("payload" + JSON.stringify(payload));
                    handleSaveExcludedItem(
                      payload,
                      currItem?.item_id && currItem.item_id != "0",
                    );
                    mutate((e) => apiUtility(e, "package/new"));
                  }}
                  onClose={handleCloseDialog}
                  error={error || ""}
                  isUpdate={!!(currItem?.item_id && currItem.item_id != "0")}
                  parentPackageId={packageId}
                />
              )}
              {currType === "category" && (
                <LimitCategoryForm
                  initialValues={currItem}
                  onSubmit={(values) => {
                    const payload = {
                      ...values,
                      package_item_id: selectedPackage
                        ? selectedPackage?.package_item_id
                        : selectedItem?.id,
                      mode: currType,
                    };
                    handleSaveCategory(
                      payload,
                      (currItem?.item_id && currItem.item_id != "0") ||
                        currItem?.item_category,
                    );
                    mutate((e) => apiUtility(e, "package/new"));
                  }}
                  onClose={handleCloseDialog}
                  error={error || ""}
                  isUpdate={
                    !!(
                      (currItem?.item_id && currItem.item_id != "0") ||
                      currItem?.item_category
                    )
                  }
                  parentPackageId={packageId}
                />
              )}
            </>
          )
        }
      />

      {/* Delete Confirmation Dialog */}
      <DisplayMsgDialog
        onClose={() => setOpenDeleteDialog(false)}
        open={openDeleteDialog}
        actionColor="error"
        description={
          t("packageSetup_15_DeleteItemConfirmation") ||
          "Are you sure you want to delete this item?"
        }
        onAction={handleDeleteConfirm}
        getResource={false}
        status="DELETE"
        actionLabel="Delete"
      ></DisplayMsgDialog>
      {/* <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onConfirm={handleDeleteConfirm}
        title={t("packageSetup_15_ConfirmToDelete")}
        message={t("packageSetup_15_DeleteItemConfirmation")}
        errorMsg={error || null}
      /> */}
    </Box>
  );
};

export default PackageTabs;
