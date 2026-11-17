import LaunchIcon from "@mui/icons-material/Launch";
import { getIconByName } from "./iconRegistry";

const transformMenuData = (backendData: any[], language: string) => {
  if (!backendData || backendData.length === 0) return [];
  
  const itemMap = new Map();
  const rootItems: any[] = [];
  
  backendData.forEach((item: any) => {
    itemMap.set(item.menu_id, {
      ...item,
      text: item[`${language}_text`] || item.display_text || "[NO TEXT]",
      path: item.url || "#",
      renderCell: () => {
        const IconComponent = getIconByName(item.icon) || null;
        return item.icon ? (
          <IconComponent sx={{ color: "primary.main" }} />
        ) : (
          <LaunchIcon sx={{ color: "primary.main" }} />
        );
      },
      pageId: item.function_id,
      en_text: item.en_text,
      children: [],
    });
  });

  backendData.forEach((item: any) => {
    const menuItem = itemMap.get(item.menu_id);
    
    if (!item.parent_id) {
      rootItems.push(menuItem);
    } else {
      const parentItem = itemMap.get(item.parent_id);
      if (parentItem) {
        parentItem.children.push(menuItem);
      } else {
        console.warn(`Parent not found for item ${item.menu_id} with parent_id ${item.parent_id}`);
        rootItems.push(menuItem);
      }
    }
  });
  
  return rootItems;
};