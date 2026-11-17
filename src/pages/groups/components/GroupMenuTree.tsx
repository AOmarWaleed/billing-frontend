import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Page } from "../../../redux/slices/transSlice";
import { useLanguage } from "../../../context/LanguageContext";

interface GroupMenuTreeProps {
  selectedFunctionId: number | null;
  onMenuSelect: (functionId: number | null) => void;
}

interface MenuItemProps {
  item: Page;
  selectedId: number | null;
  onItemSelect: (item: Page) => void;
}

const MenuTreeItem = memo(function MenuTreeItem({
  item,
  selectedId,
  onItemSelect,
}: MenuItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const itemId = item.menu_id?.toString() || "";
  const isSelected = selectedId !== null && item.function_id === selectedId;
  const { language } = useLanguage();

  const displayText =
    language === "ar"
      ? item.ar_text || item.display_text || item.en_text || ""
      : item.en_text || item.display_text || item.ar_text || "";

  return (
    <TreeItem
      itemId={itemId}
      sx={{
        "& .MuiTreeItem-content": {
          borderRadius: 1,
          px: 1,
          py: 0.3,
          cursor: "pointer",
          backgroundColor: isSelected ? "action.selected" : "transparent",
          "&:hover": {
            backgroundColor: isSelected ? "action.selected" : "action.hover",
          },
        },
      }}
      label={
        <Box
          onClick={(e) => {
            // e.stopPropagation();
            onItemSelect(item);
          }}
        >
          {displayText}
        </Box>
      }
    >
      {hasChildren &&
        item.children.map((child) => (
          <MenuTreeItem
            key={child.menu_id}
            item={child}
            selectedId={selectedId}
            onItemSelect={onItemSelect}
          />
        ))}
    </TreeItem>
  );
});

const GroupMenuTree = memo(function GroupMenuTree({
  selectedFunctionId,
  onMenuSelect,
}: GroupMenuTreeProps) {
  const menuPages = useSelector((state: RootState) => state.trans.pages);
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleExpandedItemsChange = useCallback(
    (_event: React.SyntheticEvent | null, itemIds: string[]) => {
      setExpandedItems(itemIds);
    },
    []
  );

  const handleItemSelect = useCallback(
    (item: Page) => {
      const clickedId = item.function_id ?? null;
      if (selectedFunctionId === clickedId) {
        onMenuSelect(null);
      } else {
        onMenuSelect(clickedId);
      }
    },
    [selectedFunctionId, onMenuSelect]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onMenuSelect(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onMenuSelect]);

  return (
    <Box
      ref={containerRef}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        maxHeight: 400,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          backgroundColor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Menu
        </Typography>
      </Box>
      <Box sx={{ p: 1, overflow: "auto", maxHeight: 360 }}>
        <SimpleTreeView
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
        >
          {menuPages.map((item) => (
            <MenuTreeItem
              key={item.menu_id}
              item={item}
              selectedId={selectedFunctionId}
              onItemSelect={handleItemSelect}
            />
          ))}
        </SimpleTreeView>
      </Box>
    </Box>
  );
});

export default GroupMenuTree;
