import { Box, Divider, TextField, InputAdornment } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { drawerWidth } from "../../utils/Constant";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";

import { useLocation, useNavigate } from "react-router-dom";
import { Page, useTransSlice } from "../../redux/slices/transSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  useEffect,
  useMemo,
  useState,
  SyntheticEvent,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";

import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useLanguage } from "../../context/LanguageContext";
import { publicUrl } from "../../utils/publicUrl";

interface RenderTreeItemsProps {
  items: Page[];
  level?: number;
  open: boolean;
  onNavigate: (path: string, pageId: number | null) => void;
  location: any;
  mode: string;
  searchTerm?: string;
}

// Helper function to filter menu items based on search term
const filterMenuItems = (items: Page[], searchTerm: string): Page[] => {
  if (!searchTerm.trim()) return items;

  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  return items.reduce<Page[]>((filtered, item) => {
    // Check if current item matches search
    const itemMatches =
      item.display_text?.toLowerCase().includes(lowerSearchTerm) ||
      item.ar_text?.toLowerCase().includes(lowerSearchTerm) ||
      item.en_text?.toLowerCase().includes(lowerSearchTerm);

    // Recursively filter children
    const filteredChildren = item.children
      ? filterMenuItems(item.children, searchTerm)
      : [];

    // Include item if it matches or has matching children
    if (itemMatches || filteredChildren.length > 0) {
      filtered.push({
        ...item,
        children: filteredChildren, // Use filtered children
      });
    }

    return filtered;
  }, []);
};

const RenderTreeItems = ({
  items,
  level = 0,
  open,
  onNavigate,
  location,
  mode,
  searchTerm = "",
}: RenderTreeItemsProps) => {
  const languageContext = useLanguage();
  const currentLanguage = languageContext.language; 

  const handleItemClick = (
    event: React.MouseEvent,
    itemId: string,
    item: Page,
  ) => {
    event.stopPropagation();
    if (!item.children || item.children.length === 0) {
      if (item.url && item.function_id) {
        onNavigate(item.url, item.function_id);
      }
    }
  };

  const getIconPath = (iconName: string | null) => {
    if (!iconName) return null;
    return publicUrl(`themes/${mode}/icons/${iconName}.svg`);
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: "yellow", color: "black" }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const getDisplayText = useCallback(
    (item: Page) => {
      
      if (currentLanguage === "ar") {
        return item.ar_text || item.display_text || item.en_text || "No Title";
      } else {
        return item.en_text || item.display_text || item.ar_text || "No Title";
      }
    },
    [currentLanguage],
  );

  return items?.map((item) => {
    const itemId = item.menu_id?.toString() || `item-${item.display_text}`;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.url;
    const iconPath = getIconPath(item.icon);

    const displayText = getDisplayText(item);

    return (
      <TreeItem
        key={itemId}
        itemId={itemId}
        label={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 0.5,
              backgroundColor: isActive ? "primary.light" : "transparent",
              borderRadius: 1,
              width: "100%",
              transition: "all 0.2s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 30,
              }}
            >
              {iconPath ? (
                <img
                  src={iconPath}
                  style={{
                    width: "25px",
                    height: "25px",
                    backgroundColor: "transparent",
                    filter: mode === "dark" ? "invert(1)" : "none",
                    transition: "all 0.2s ease",
                  }}
                  alt={displayText}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "25px",
                    height: "25px",
                    backgroundColor: "primary.main",
                    borderRadius: "4px",
                    opacity: 0.5,
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                opacity: open ? 1 : 0,
                visibility: open ? "visible" : "hidden",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "0.9rem",
                transition: "opacity 0.2s ease, visibility 0.2s ease",
                width: open ? "auto" : 0,
              }}
            >
              {searchTerm
                ? getHighlightedText(displayText, searchTerm)
                : displayText}
            </Box>
          </Box>
        }
        onClick={(event) => handleItemClick(event, itemId, item)}
        sx={{
          "& .MuiTreeItem-content": {
            py: 0.5,
            minHeight: 40,
            pl: open ? level * 2 : 1,
            pr: open ? 2 : 1,
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "action.hover",
            },
            transition: "padding 0.2s ease",
          },
          "& .MuiTreeItem-label": {
            width: "100%",
          },
          "& .Mui-selected": {
            backgroundColor: "primary.light",
          },
        }}
      >
        {hasChildren && (
          <RenderTreeItems
            items={item.children}
            level={level + 1}
            open={open}
            onNavigate={onNavigate}
            location={location}
            mode={mode}
            searchTerm={searchTerm}
          />
        )}
      </TreeItem>
    );
  });
};

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: "999",

  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

interface SideBarProps {
  open: boolean;
  setOpen: (nextS: boolean) => void;
  DrawerHeader: any;
}

export default function SideBar({ open, setOpen, DrawerHeader }: SideBarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMenuData, setFilteredMenuData] = useState<Page[]>([]);

  const navigateTo = useNavigate();
  const { pages, getPageContent } = useTransSlice();
  const location = useLocation();

  const { mode, direction } = useSelector((store: RootState) => store.theme);
  const { i18n } = useTranslation("");

  const menuData = useMemo(() => {
    if (!pages || pages.length === 0) return [];
    return pages;
  }, [pages]);

  // Filter menu items when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = filterMenuItems(menuData, searchTerm);
      setFilteredMenuData(filtered);

      // Auto-expand all items when searching to show matches
      if (filtered.length > 0) {
        const allIds = getAllItemIds(filtered);
        setExpandedItems(allIds);
      }
    } else {
      setFilteredMenuData(menuData);
      // Reset to default expanded state (only root items)
      const rootIds = menuData
        .map((item) => item.menu_id?.toString())
        .filter((id): id is string => id !== undefined);
      setExpandedItems(rootIds);
    }
  }, [searchTerm, menuData]);

  // Helper function to get all item IDs for expansion
  const getAllItemIds = (items: Page[]): string[] => {
    return items.reduce<string[]>((ids, item) => {
      if (item.menu_id) {
        ids.push(item.menu_id.toString());
      }
      if (item.children && item.children.length > 0) {
        ids.push(...getAllItemIds(item.children));
      }
      return ids;
    }, []);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleNavigate = (path: string, pageId: number | null) => {
    if (path && path !== "#" && path !== null) {
      navigateTo(path, { state: { pageId } });
      // Clear search after navigation
      setSearchTerm("");
    }
  };

  const handleExpandedItemsChange = (
    event: SyntheticEvent<Element, Event> | null,
    itemIds: string[],
  ) => {
    setExpandedItems(itemIds);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>

      <Divider />

      {/* Search Input - Only show when drawer is open */}
      {open && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      )}

      <Divider />

      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          "& .MuiTreeItem-root": {
            maxWidth: "100%",
          },
          "& .MuiTreeItem-content": {
            width: "100%",
          },
          "& .MuiTreeItem-group": {
            marginLeft: open ? 2 : 0,
            transition: "margin-left 0.2s ease",
          },
        }}
      >
        <SimpleTreeView
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
          sx={{
            width: "100%",
            py: 1,
            "& .MuiTreeItem-iconContainer": {
              display: "none",
            },
          }}
        >
          <RenderTreeItems
            items={filteredMenuData}
            level={0}
            open={open}
            onNavigate={handleNavigate}
            location={location}
            mode={mode}
            searchTerm={searchTerm}
          />
        </SimpleTreeView>

        {/* Show message when no results found */}
        {open && searchTerm && filteredMenuData.length === 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            No menu items found
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
