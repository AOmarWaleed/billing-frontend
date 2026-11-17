import { useContext, ReactNode } from "react";
import { OldAuthGuardContext as SharedAuthGuardContext } from "@givc/shared-components";
import { useGetResources } from "./useGetResources";

export const AuthGuardContext = SharedAuthGuardContext;

export interface PermissionField {
  resource_id: string;
  show: boolean;
  disabled: boolean;
  required: boolean;
  resource_type: string;
  label_en: string | null;
  label_ar: string | null;
}

export interface PermissionsResponse {
  success: boolean;
  function_id: number;
  group_id: number;
  total_fields: number;
  visible_fields: number;
  resource_ids: string[];
  fields: Record<string, PermissionField>;
}

interface AuthGuardProps {
  children: ReactNode;
  functionID: string;
}

interface AuthGuardPermissionsProps {
  children: (props: {
    t: (key: string) => string;
    visible: boolean;
    disabled: boolean;
    required: boolean;
  }) => ReactNode;
  secureId: string;
}

const AuthGuard = ({ children, functionID }: AuthGuardProps) => {
  const userLang = sessionStorage.getItem("lang") as string;
  const { resourcesData: data } = useGetResources(userLang, functionID);
  console.log("resourcesData:", data);
  const resourcesData  : PermissionsResponse | Record<string, unknown> = data ?? {}; // Ensure resourcesData is never null
  const t = (key: string): string => {
    if (!resourcesData) return key;

    const field = (resourcesData as PermissionsResponse)?.fields?.[key];
    if (!field) return key;

    return userLang === "ar" ? field.label_ar || key : field.label_en || key;
  };
  const formatString = (template: string, values: Record<string, any> = {}) => {
    return template.replace(/{(\w+)}/g, (_, key) => values[key] ?? "");
  };
  function checkVisiblity(key: string) {
    return (resourcesData as PermissionsResponse)?.fields?.[key]?.show ?? true;
  }

  function checkDisabled(key: string) {
    return (resourcesData as PermissionsResponse)?.fields?.[key]?.disabled ?? false;
  }

  function checkRequiered(key: string) {
    return (resourcesData as PermissionsResponse)?.fields?.[key]?.required ?? false;
  }
  const contextValue = {
    resourcesData: resourcesData,
    userLang,
    t,
    formatString,
    checkVisiblity,
    checkDisabled,
    checkRequiered,
  };
  return (
    <AuthGuardContext.Provider value={contextValue}>
      {children}
    </AuthGuardContext.Provider>
  );
};

export const AuthGuardPermissions = ({
  children,
  secureId,
}: AuthGuardPermissionsProps) => {
  const ctx = useContext(AuthGuardContext);

  if (!ctx) return null;

  const { checkDisabled, checkRequiered, checkVisiblity, t } = ctx;

  const visible = checkVisiblity(secureId);
  const disabled = checkDisabled(secureId);
  const required = checkRequiered(secureId);
  if (!visible) return null;

  return <>{children({ visible, disabled, required, t })}</>;
};

export default AuthGuard;
