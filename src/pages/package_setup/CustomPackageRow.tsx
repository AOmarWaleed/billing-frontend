import React from "react";
import { Stack, Tooltip, Typography, Chip } from "@mui/material";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutline from "@mui/icons-material/RemoveCircleOutline";
import { Package } from "../../types/PackageSetup";



const CustomPackageRow: React.FC<Package> = ({

  category,
  excluded,
  limited,
  package_item_id,
  parent_description,
}) => {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0, py: .2 }}>
      {/* top line: name (truncated) + code */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Tooltip title={`${parent_description} (${'package_code'})`}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ minWidth: 0, maxWidth: "100%" }}
          >
            {parent_description}
          </Typography>
        </Tooltip>
        {/* <Typography variant="caption" color="text.secondary" noWrap>
          ({package_code})
        </Typography> */}
      </Stack>

      {/* meta row: days + counts + id */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {/* <Chip
          size="small"
          variant="outlined"
          icon={<CalendarTodayOutlined fontSize="small" />}
          label={`${days ?? 0} days`}
        /> */}
        <Chip
          size="small"
          variant="outlined"
          icon={<AddCircleOutline fontSize="small" />}
          label={`+${limited.length ?? 0}`}
        />
        <Chip
          size="small"
          variant="outlined"
          icon={<RemoveCircleOutline fontSize="small" />}
          label={`-${excluded.length ?? 0}`}
        />
        <Typography variant="caption" color="text.secondary" noWrap>
          ID: {package_item_id}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default React.memo(CustomPackageRow);
