import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";

interface PageWithSideContentProps {
  MainComp: React.ReactNode;
  SubComp: React.ReactNode;
  subWidth: number;
  collapseBarWidth: number;
  mainBg?: string;
  barBg?: string;
  borderRadius?: number ;
  iconColor?: string;
  padding?: string;
}

export default function PageWithSideContent({
  MainComp,
  mainBg,
  barBg,
  SubComp,
  subWidth,
  collapseBarWidth,
  iconColor,
  borderRadius,
  padding
}: PageWithSideContentProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box display="flex" sx={{ minHeight: "100%" }}>
      <Box
        sx={{
          padding: padding,
          flexGrow: 1,
          transition: "width 0.3s ease-in-out",
          width: collapsed
            ? `calc(100% - ${collapseBarWidth}px)`
            : `calc(100% - ${subWidth}%)`,
          backgroundColor: mainBg,
        }}
      >
        {/* main box */}
        {MainComp}
      </Box>

      <Box
        sx={{
          width: collapsed ? `${collapseBarWidth}px` : `${subWidth}%`,
          transition: "width 0.3s ease-in-out",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: "100%",
          }}
        >
          <Box
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              width: `${collapseBarWidth}px`,
              backgroundColor: barBg,
              borderRadius : borderRadius ,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <IconButton
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50% , -50%)`,
                color: iconColor,
              }}
              size="small"
            >
              {collapsed ? (
                <ChevronLeft fontSize="medium" />
              ) : (
                <ChevronRight fontSize="medium" />
              )}
            </IconButton>
          </Box>

          <Box
            sx={{
              width: collapsed ? "0px" : `calc(100% - ${collapseBarWidth}px)`,
              overflow: "hidden",
              padding: collapsed ? "0px" : padding,
              backgroundColor: mainBg,
            }}
          >
            {/* subComp */}
            {SubComp}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


{/* <PageWithSideContent
MainComp={<SystemRules />}
SubComp={<CheckEligibility />}
subWidth={30}
collapseBarWidth={30}
padding="20px"
// mainBg="white"
barBg="white"
// iconColor="red"
/>
 */}