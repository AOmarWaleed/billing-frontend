import { UserDataGride } from "./components/UserDataGride";
import { Box, Button, Tab, Tabs } from "@mui/material";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { GroupDataGride } from "../groups/GroupDataGride";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { fetchGroups } from "../../redux/slices/userSlice";
import MyErrorBoundary from "./components/MyErrorBoundary";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
//import { collectTextFromPage, TextExtractor } from "../../utils/textExtractor/TextExtractor";
import { clearError } from "../../redux/slices/groupsSlice";
import TextExtractorTool from "../../utils/textExtractor/TextExtractorTool";
import { DisplayMsgDialog } from "@givc/shared-components";
import http from "../../utils/Api";
import {
  getPageContentWithoutGrouping,
  useTransSlice,
} from "../../redux/slices/transSlice";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import Secure from "../../shared/security";
import { Secure as GalaxySecure } from "@givc/shared-components";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const tabSx = {
  "&.Mui-selected": {
    backgroundImage: "linear-gradient(#2764AF, #55C5D6)",
    color: "white",
  },
  height: "30px",
  width: "100px",
  minHeight: "30px",
  minWidth: "100px",
  padding: 0,
  margin: 0,
  gap: 0,
  border: 1,
  borderColor: "#55C5D6",
};

const TABS_VALUES = {
  USERS: "users",
  GROUPS: "groups",
} as const;

type TabValue = (typeof TABS_VALUES)[keyof typeof TABS_VALUES];

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const UsersMaster = () => {
  const { getPageContent } = useTransSlice();
  const { resource } = useAppSelector((state) => state.trans);
  const { error: groupsError } = useAppSelector((state) => state.groups);
  const ctx = useContext(AuthGuardContext);
  if (!ctx) return null;
  const { resourcesData, t } = ctx;
  const [value, setValue] = useState<TabValue>(TABS_VALUES.USERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogResourceId, setDialogResourceId] = useState<
    number | undefined
  >();
  const dispatch = useAppDispatch();

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: TabValue,
  ) => {
    setValue(newValue);
  };

  // Watch for LDAP errors and show dialog
  useEffect(() => {
    if (groupsError) {
      // Extract actual error message from error object or string
      let errorMessage = groupsError;
      let resourceId: number | undefined;
      try {
        const parsed =
          typeof groupsError === "string"
            ? JSON.parse(groupsError)
            : groupsError;
        errorMessage = parsed.error || parsed.message || groupsError;
        resourceId = parsed.resourceId;
      } catch (e) {
        // If not JSON, use as is
        errorMessage = groupsError;
      }
      setDialogResourceId(resourceId);
      setDialogError(errorMessage);
      setDialogOpen(true);
    }
  }, [groupsError]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogResourceId(undefined);

    // Clear error from Redux state to prevent it showing elsewhere
    dispatch(clearError());
  };

  const handleSyncLdapGroups = async () => {
    try {
      await http.get("api/auth/ldap/groupsdesc", {
        headers: {
          "X-Suppress-Error-Toast": "true",
        },
      });
      setDialogOpen(false);
      setDialogError(null);
      setDialogResourceId(undefined);
    } catch (error: any) {
      const resourceId = error?.response?.data?.resourceId;
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch LDAP groups";

      setDialogResourceId(resourceId);
      setDialogError(message);
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    // dispatch(getPageContentWithoutGrouping({ pageId: 9 }));
    //console.log("Page" + JSON.stringify(content));
    // Fetch groups and wait for the result
    dispatch(fetchGroups());
  }, []);
  // useEffect(() => {
  //   dispatch(getPageContentWithoutGrouping({ pageId: 9 }));
  // }, []);
  return (
    <div style={{ padding: "10px" }}>
      <DisplayMsgDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        resource_key={dialogResourceId}
        description={dialogError || ""}
        status="ERROR"
        actionColor="primary"
      />
      {/* <TextExtractorTool function_id={9} /> */}
      <HandleTitle titleKey="USER" />
      <GalaxySecure.GLLab.TabContext
        value={value}
        permission="users_9_tabParent"
      >
        <GalaxySecure.GLLab.TabList
          onChange={handleChange}
          sx={{
            padding: 0,
            margin: 0,
            gap: 0,
            borderBottom: 1,
            borderColor: "#55c5d6",
          }}
          aria-label="users tabs"
        >
          <GalaxySecure.GLLab.Tab
            permission="users_9_tabUsers"
            uiText="users_9_tabUsers"
            fallBackText="Users"
            value={TABS_VALUES.USERS}
            sx={tabSx}
          />

          <GalaxySecure.GLLab.Tab
            permission="users_9_tabGroups"
            uiText="users_9_tabGroups"
            fallBackText="Groups"
            value={TABS_VALUES.GROUPS}
            sx={tabSx}
          />
          <Box sx={{ marginLeft: "auto" }}>
            <GalaxySecure.GLButton2
              permission="users_9_syncGroup"
              uiText="users_9_syncGroup"
              fallBackText="Sync Group"
              onClick={handleSyncLdapGroups}
              sx={{
                marginLeft: "auto",
                minWidth: "auto",
                px: 1,
                fontSize: "0.8rem",
                textTransform: "none",
                color: "white",

                "& .MuiButton-startIcon": {
                  marginRight: "4px",
                  marginLeft: 0,
                },
              }}
              variant="contained"
              color="primary"
            />
          </Box>
        </GalaxySecure.GLLab.TabList>

        <GalaxySecure.GLLab.TabPanel
          value={TABS_VALUES.USERS}
          permission="users_9_tabUsers"
          sx={{ padding: 0 }}
        >
          <UserDataGride />
        </GalaxySecure.GLLab.TabPanel>
        <GalaxySecure.GLLab.TabPanel
          value={TABS_VALUES.GROUPS}
          permission="users_9_tabGroups"
          sx={{ padding: 0 }}
        >
          <MyErrorBoundary children={<GroupDataGride />} />
        </GalaxySecure.GLLab.TabPanel>
      </GalaxySecure.GLLab.TabContext>

      {/* <Box
        sx={{
          borderBottom: 1,
          borderColor: "#55c5d6",
          padding: 0,
          margin: 0,
          gap: 0,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{
            padding: 0,
            margin: 0,
            gap: 0,
          }}
        >
          <Secure.GLTab
            resource_key="users_Tab_users"
            sx={{
              "&.Mui-selected": {
                backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
                color: "white",
              },
              height: "30px",
              width: "100px",
              minHeight: "30px",
              minWidth: "100px",
              padding: 0,
              margin: 0,
              gap: 0,
              border: 1,
              borderColor: "#55C5D6",
            }}
            label={t("usersetup_9_TabUsers") || "USERS"}
            {...a11yProps(0)}
          />
          <Secure.GLTab
            resource_key="users_Tab_groups"
            sx={{
              "&.Mui-selected": {
                backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
                color: "white",
              },
              height: "30px",
              width: "100px",
              minHeight: "30px",
              minWidth: "100px",
              padding: 0,
              margin: 0,
              gap: 0,
              border: 1,
              borderColor: "#55C5D6",
            }}
            label={t("usergroups_9_Tabgroups") || "GROUPS"}
            {...a11yProps(1)}
          />
        </Tabs>
      </Box> */}
      {/* <CustomTabPanel value={value} index={0}>
        <UserDataGride />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <MyErrorBoundary children={<GroupDataGride />} />
      </CustomTabPanel> */}
    </div>
  );
};
