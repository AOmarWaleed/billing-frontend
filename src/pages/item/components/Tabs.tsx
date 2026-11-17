import { useState } from "react";
import { Box } from "@mui/material";
import { Secure as GalaxySecure } from "@givc/shared-components";
import useItemSlice from "../../../redux/hooks/useItemSlice";
import HisDataTable from "./HisDataTable";

const tabSx = {
  "&.Mui-selected": {
    backgroundImage: "linear-gradient(#2764AF, #55C5D6)",
    color: "white",
  },
  height: "30px",
  width: "140px",
  minHeight: "30px",
  minWidth: "140px",
  padding: 0,
  margin: 0,
  gap: 0,
  border: 1,
  borderColor: "#55C5D6",
};

const TABS_VALUES = {
  HIS_DATA: "hisData",
} as const;

type TabValue = (typeof TABS_VALUES)[keyof typeof TABS_VALUES];

const Tabs = () => {
  const [value, setValue] = useState<TabValue>(TABS_VALUES.HIS_DATA);
  const { selectedItem } = useItemSlice();
  const itemId = selectedItem?.item_id;

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: TabValue,
  ) => {
    setValue(newValue);
  };

  // The tab depends on the selected item, so it stays unmounted until the
  // items grid has rendered and auto-selected a row. Mounting earlier would
  // request HIS data with an undefined item id.
  if (!itemId) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <GalaxySecure.GLLab.TabContext
        value={value}
        permission="items_5_tabParent"
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
          aria-label="item tabs"
        >
          <GalaxySecure.GLLab.Tab
            permission="items_5_tabHisData"
            uiText="items_5_tabHisData"
            fallBackText="HIS DATA"
            value={TABS_VALUES.HIS_DATA}
            sx={tabSx}
          />
        </GalaxySecure.GLLab.TabList>

        <GalaxySecure.GLLab.TabPanel
          value={TABS_VALUES.HIS_DATA}
          permission="items_5_tabHisData"
          sx={{ padding: 0 }}
        >
          <HisDataTable />
        </GalaxySecure.GLLab.TabPanel>
      </GalaxySecure.GLLab.TabContext>
    </Box>
  );
};

export default Tabs;
