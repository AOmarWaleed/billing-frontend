
import themeReducer from "./redux/slices/themeSlice";
import authReducer from "./redux/slices/authSlice";
import itemsReducer from "./redux/slices/ItemsSlice";
import codeTypeReducer from "./redux/slices/CodeTypeSlice";
import codeDataReducer from "./redux/slices/CodeDataSlice";
import usersReducer from "./redux/slices/userSlice";
import groupsReducer from "./redux/slices/groupsSlice";
import transReducer from "./redux/slices/transSlice";
import systemRules from "./redux/slices/systemSlice";
import payerReducer from "./redux/slices/payerSlice";
import patientReducer from "./redux/slices/patientSlice";
import employeeReducer from "./redux/slices/employeeSlice";
import breadCrumbReducer from "./redux/slices/breadCrumb";
import configReducer from "./redux/slices/configSlice";
import feedbackReducer from "./redux/slices/feedbackSlice";
import facilityReducer from "./redux/slices/facilitySlice";
import payerPolicyReducer from "./redux/slices/payerPolicySlice";
import patientPolicyReducer from "./redux/slices/patientPolicySlice";
import codeMappingReducer from "./redux/slices/codeMappingSlice";
import itemGroupReducer from "./redux/slices/itemGroupSlice";
import snackbarReducer from "./redux/slices/snackbarSlice";
import orderReducer from "./redux/slices/orderSlice";
import invoiceReducer from "./redux/slices/invoiceSlice";
import packageSetupReducer from "./redux/slices/packageSetupSlice";
import { default as Home } from "./pages/home/Home";
import { default as PrivateRoute } from "./components/auth/PrivateRoute";
import { default as Item } from "./pages/item/Item";
import { default as Payer } from "./pages/payer/Payer";
import { default as ItemMaster } from "./pages/item/ItemsMaster";
import { default as CodeMaster } from "./pages/code/CodeMaster";
import { UsersMaster } from "./pages/users/UsersMaster";
import { default as ItemPrice } from "./pages/item_price/ItemPrice";
import { default as Settings } from "./pages/Settings/Settings";
import { default as Patient } from "./pages/patient/Patient";
import { default as Employee } from "./pages/employee/Employee";
import { default as MappingCode } from "./pages/mappingCode/MappingCode";
import { default as ItemGroupMaster } from "./pages/itemGroups/ItemGroupMaster";
import { default as ResourceManagement } from "./pages/resources/Resources";
import { default as SinglePatient } from "./pages/SinglePatient/PatientAccount";
import { default as PackageSetupMaster } from "./pages/package_setup/PackageSetupMaster";
import { default as Invoices } from "./pages/Invoice/Invoices";
import { default as Order } from "./pages/Order/Order";
import { default as Payment } from "./pages/payment/PaymentMaster";
import { default as SendFeedback } from "./pages/send_feedback/SendFeedback";
import { default as FeedbackAdmin } from "./pages/feedback_admin/FeedbackAdmin";
import { default as Facility } from "./pages/facility/Facility";
import { default as HelpManagement } from "./pages/help_management/HelpManagement";
import { default as Help } from "./pages/help/HelpPage";
import { default as ForgotPassword } from "./pages/forgot_password/ForgotPassword";
import { default as ResetPassword } from "./pages/reset_password/ResetPassword";
import { default as ChangePassword } from "./pages/change_password/ChangePassword";
import { default as PatientEpisode } from "./pages/patient_episode/PatientEpisode";
import { withNeededDependencies } from "./utils/withNeededDependencies";
import { PatientAccountProvider } from "./pages/SinglePatient/context/PatientAccountContext";
import { BedClassProvider } from "./pages/bedClass/context/BedClassContext";
import BedClass from "./pages/bedClass/BedClass";
// import { Provider } from "react-redux";
// import { store } from "./redux/store";
// import React from "react";

export const slices: Record<string, any> = {
  theme: themeReducer,
  auth: authReducer,
  items: itemsReducer,
  codetypes: codeTypeReducer,
  codedata: codeDataReducer,
  users: usersReducer,
  systemRules: systemRules,
  groups: groupsReducer,
  trans: transReducer,
  payer: payerReducer,
  patient: patientReducer,
  employee: employeeReducer,
  breadCrumb: breadCrumbReducer,
  config: configReducer,
  payerPolicy: payerPolicyReducer,
  patientPolicies: patientPolicyReducer,
  codeMapping: codeMappingReducer,
  itemGroup: itemGroupReducer,
  snackbar: snackbarReducer,
  order: orderReducer,
  invoice: invoiceReducer,
  package: packageSetupReducer,
  feedback: feedbackReducer,
  facility: facilityReducer,
} as const;

// export function MyModuleProvider({ children }: { children: React.ReactNode }) {
//   return <Provider store={store}>{children}</Provider>;
// }

// Export wrapped components with needed dependencies

const SinglePatientPageWithContext = (props: any) => {
  return (
    <PatientAccountProvider>
      <SinglePatient {...props} />
    </PatientAccountProvider>
  );
};

const BedClassPageWithContext = (props: any) => {
  return (
    <BedClassProvider>
      <BedClass {...props} />
    </BedClassProvider>
  );
};

export const HomePage = withNeededDependencies(Home);
export const ItemPage = withNeededDependencies(Item);
export const PayerPage = withNeededDependencies(Payer);
export const ItemMasterPage = withNeededDependencies(ItemMaster);
export const CodeMasterPage = withNeededDependencies(CodeMaster);
export const UsersMasterPage = withNeededDependencies(UsersMaster);
export const ItemPricePage = withNeededDependencies(ItemPrice);
export const SettingsPage = withNeededDependencies(Settings);
export const PatientPage = withNeededDependencies(Patient);
export const EmployeePage = withNeededDependencies(Employee);
export const MappingCodePage = withNeededDependencies(MappingCode);
export const ItemGroupMasterPage = withNeededDependencies(ItemGroupMaster);
export const ResourceManagementPage =
  withNeededDependencies(ResourceManagement);
export const OrderPage = withNeededDependencies(Order);
export const SinglePatientPage = withNeededDependencies(SinglePatientPageWithContext);
export const PackageSetupMasterPage =
  withNeededDependencies(PackageSetupMaster);
export const InvoicesPage = withNeededDependencies(Invoices);
export const PaymentPage = withNeededDependencies(Payment);
export const BedClassPage = withNeededDependencies(BedClassPageWithContext);
export const SendFeedbackPage = withNeededDependencies(SendFeedback);
export const FeedbackAdminPage = withNeededDependencies(FeedbackAdmin);
export const FacilityPage = withNeededDependencies(Facility);
export const HelpManagementPage = withNeededDependencies(HelpManagement);
export const HelpPage = withNeededDependencies(Help);
export const ForgotPasswordPage = withNeededDependencies(ForgotPassword);
export const ResetPasswordPage = withNeededDependencies(ResetPassword);
export const ChangePasswordPage = withNeededDependencies(ChangePassword);
export const PatientEpisodePage = withNeededDependencies(PatientEpisode);

// Also export raw components if needed
export { default as PrivateRoute } from "./components/auth/PrivateRoute";
export { default as AuthGuard } from "./shared/core/AuthGuard";
export { default as Home } from "./pages/home/Home";
export { default as Item } from "./pages/item/Item";
export { default as Payer } from "./pages/payer/Payer";
export { default as ItemMaster } from "./pages/item/ItemsMaster";
export { default as CodeMaster } from "./pages/code/CodeMaster";
export { UsersMaster } from "./pages/users/UsersMaster";
export { default as ItemPrice } from "./pages/item_price/ItemPrice";
export { default as Settings } from "./pages/Settings/Settings";
export { default as Patient } from "./pages/patient/Patient";
export { default as Employee } from "./pages/employee/Employee";
export { default as MappingCode } from "./pages/mappingCode/MappingCode";
export { default as ItemGroupMaster } from "./pages/itemGroups/ItemGroupMaster";
export { default as ResourceManagement } from "./pages/resources/Resources";
export { default as Order } from "./pages/Order/Order";
export { default as Payment } from "./pages/payment/PaymentMaster";
export { default as SendFeedback } from "./pages/send_feedback/SendFeedback";
export { default as FeedbackAdmin } from "./pages/feedback_admin/FeedbackAdmin";
export { default as NewFeedbackDialog } from "./pages/send_feedback/NewFeedbackDialog";
export { default as Help } from "./pages/help/HelpPage";
export { default as ForgotPassword } from "./pages/forgot_password/ForgotPassword";
export { default as ResetPassword } from "./pages/reset_password/ResetPassword";
export { default as ChangePassword } from "./pages/change_password/ChangePassword";

export { default as GlCustomTable } from "./shared/tables/GlCustomTable";
export { default as GlPanelTable } from "./shared/tables/GlCustomTable";

export { getCurrentPageName, getCurrentFunctionId } from "./utils/trans";


 
