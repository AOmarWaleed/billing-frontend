import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import GroupsIcon from "@mui/icons-material/Groups";
import RouteIcon from "@mui/icons-material/Route";
import AddCircleRounded from "@mui/icons-material/AddCircleRounded";
import LaunchIcon from "@mui/icons-material/Launch";
import CollectionsIcon from "@mui/icons-material/Collections";

const ICONS_MAP: Record<string, React.ElementType> = {
  HomeIcon: HomeIcon,
  CategoryIcon: CategoryIcon,
  SupervisorAccountIcon: SupervisorAccountIcon,
  QrCodeIcon: QrCodeIcon,
  PriceChangeIcon: PriceChangeIcon,
  ManageAccountsIcon: ManageAccountsIcon,
  SettingsSuggestIcon: SettingsSuggestIcon,
  GroupsIcon: GroupsIcon,
  RouteIcon: RouteIcon,
  AddCircleRoundedIcon: AddCircleRounded,
  CollectionsIcon: CollectionsIcon,
};

export const getIconByName = (iconName?: string): React.ElementType => {
  return iconName && ICONS_MAP[iconName] ? ICONS_MAP[iconName] : LaunchIcon;
};
