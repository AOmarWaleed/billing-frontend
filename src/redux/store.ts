
console.log({rcmStore : "hiiiiiiiiiiiiii"});

import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import itemsReducer from "./slices/ItemsSlice";
import codeTypeReducer from "./slices/CodeTypeSlice";
import codeDataReducer from "./slices/CodeDataSlice";
import usersReducer from "./slices/userSlice";
import groupsReducer from "./slices/groupsSlice";
import transReducer from "./slices/transSlice";
import systemRules from "./slices/systemSlice";
import payerReducer from "./slices/payerSlice";
import patientReducer from "./slices/patientSlice";
import employeeReducer from "./slices/employeeSlice";
import breadCrumbReducer from "./slices/breadCrumb";
import configReducer from "./slices/configSlice";
import payerPolicyReducer from "./slices/payerPolicySlice";
import patientPolicyReducer from "./slices/patientPolicySlice";
import codeMappingReducer from "./slices/codeMappingSlice";
import itemGroupReducer from "./slices/itemGroupSlice";
import snackbarReducer from "./slices/snackbarSlice";
import packageSetupReducer from "./slices/packageSetupSlice";
import orderReducer from "./slices/orderSlice";
import invoiceReducer from "./slices/invoiceSlice";
import feedbackReducer from "./slices/feedbackSlice";
import facilityReducer from "./slices/facilitySlice";

// Define the types for your sanitizers
const actionSanitizer = (action: any): any => {
  if (action.type === "YOUR_ACTION_TYPE") {
    return { ...action, payload: "<<LONG_BLOB>>" };
  }
  return action;
};

const stateSanitizer = (state: any): any => {
  return state.someLargeState ? { ...state, someLargeState: "<<LONG_BLOB>>" } : state;
};

export const store = configureStore({
  reducer: {
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
    package: packageSetupReducer,
    order: orderReducer,
    invoice: invoiceReducer,
    feedback: feedbackReducer,
    facility: facilityReducer,
  },
  devTools: {
    actionSanitizer,
    stateSanitizer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// Get the type of our store variable
export type AppStore = typeof store;
