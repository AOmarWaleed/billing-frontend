import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  Box,
  CircularProgress,
  createTheme,
  Direction,
  Theme,
  ThemeProvider,
  PaletteMode,
  alpha,
  lighten,
  colors,
} from "@mui/material";
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store";
// import { lightModeTheme } from "./theme/theme";
// import <Logi</Logi>n from "./pages/login/Login";
import Home from "./pages/home/Home";
import PrivateRoute from "./components/auth/PrivateRoute";
import MainLayout from "./layouts/MainLayout";
import Item from "./pages/item/Item";
import Payer from "./pages/payer/Payer";
import Facility from "./pages/facility/Facility";
import "bootstrap/dist/css/bootstrap.min.css";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import ItemMaster from "./pages/item/ItemsMaster";

import CodeMaster from "../src/pages/code/CodeMaster";
import { UsersMaster } from "./pages/users/UsersMaster";
import ItemPrice from "./pages/item_price/ItemPrice";
import Settings from "./pages/Settings/Settings";
import {
  getGroups,
  getPagesTrans,
  getResourceTypes,
  useTransSlice,
} from "./redux/slices/transSlice";
import Patient from "./pages/patient/Patient";
import Employee from "./pages/employee/Employee";
import LoginPage from "./pages/login/LoginPage";
import ForgotPassword from "./pages/forgot_password/ForgotPassword";
import ResetPassword from "./pages/reset_password/ResetPassword";
import ChangePassword from "./pages/change_password/ChangePassword";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import { jwtDecode } from "jwt-decode";
import api from "./utils/Api";
import SessionTimeout from "./components/auth/SessionTimeout";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { SplashScreen } from "./components/SplachVideo/SplachVideo";
import { FormatDataEx } from "./samples/FormatDataEx";
import { fetchAllFormats } from "./redux/slices/configSlice";
// import Permission from "./samples/Permission";
// import MuiPermission from "./samples/MuiPermission";
// import MuiPermission2 from "./samples/MuiPermission2";
import Example from "../src/common/codeList/Example";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import SinglePatient from "./pages/SinglePatient/PatientAccount";
import { PatientAccountProvider } from "./pages/SinglePatient/context/PatientAccountContext";
import MappingCode from "./pages/mappingCode/MappingCode";
import { initializeAuth } from "./redux/services/authService";
import ItemGroupMaster from "./pages/itemGroups/ItemGroupMaster";

import ResourceManagement from "./pages/resources/Resources";

import "./shared/core/i18n";
// import PackageSetupMaster from "./pages/package_setup/PackageSetupMaster";
import Order from "./pages/Order/Order";
import PackageSetupMaster from "./pages/package_setup/PackageSetupMaster";
import Invoices from "./pages/Invoice/Invoices";
import Payment from "./pages/payment/PaymentMaster";
import { createAppTheme, createEmotionCache } from "./theme/theme";
import AuthGuard from "./shared/core/AuthGuard";
import {
  GlThemeProvider,
  useGlTheme,
} from "./components/GlThmeProvider/GlThmeProvider";
import BedClass from "./pages/bedClass/BedClass";
import { BedClassProvider } from "./pages/bedClass/context/BedClassContext";
import SendFeedback from "./pages/send_feedback/SendFeedback";
import FeedbackAdmin from "./pages/feedback_admin/FeedbackAdmin";
import HelpPage from "./pages/help/HelpPage";
import HelpManagement from "./pages/help_management/HelpManagement";
import PatientEpisode from "./pages/patient_episode/PatientEpisode";
import {
  OldAuthGuardProvider,
  AuthGuardProvider,
} from "@givc/shared-components";

export const cacheLTR = createEmotionCache("ltr");
export const cacheRTL = createEmotionCache("rtl");

// const parentFormat = AdapterDateFns.prototype.format;

// export class MySpecialAdapter extends AdapterDateFns {
//   // Override the format method using an arrow function property
//   // This syntax matches how AdapterDateFns defines the property.
//   public format = (date: Date, formatKey: string): string => {
//     if (formatKey === 'keyboardDate') {
//       return this.formatByString(date, 'dd-MM-yyyy');
//     }

//     // Call the parent's format method directly with the correct context.
//     return parentFormat.call(this, date, formatKey);
//   };
// }

const AppContent: React.FC = () => {
  const [theme, setTheme] = useState<any>(null);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { mode, density, direction } = useAppSelector((state) => state.theme);
  const [isLoading, setIsLoading] = useState(true);
  const { getPages, getPageContent, pages } = useTransSlice();
  const location = useLocation();

  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    // check if there is direction to start with
    dispatch(initializeAuth());
    const initializeApp = async () => {
      try {
        // First load essential data if authenticated
        if (isAuthenticated && !(pages.length > 0)) {
          getPages();
          //getPageContent(1);
          //getPageContent(0);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch(fetchAllFormats());
  }, []);

  // Get theme overrides from context
  const themeOverrides = useGlTheme();

  useEffect(() => {
    let active = true;

    (async () => {
      const loaded = await createAppTheme(
        mode,
        density,
        direction,
        themeOverrides,
      );

      if (active) setTheme(loaded);
    })();

    return () => {
      active = false;
    };
  }, [mode, density, direction, themeOverrides]);

  if (isLoading || !theme) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      {/* <ThemeProvider theme={createTheme({})}> */}
      <CacheProvider value={direction === "rtl" ? cacheRTL : cacheLTR}>
        <div dir={direction}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <SessionTimeout />
              {/* Other components */}
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route path="/sample/formatdata" element={<FormatDataEx />} />
                {/* <Route path="/sample/permission" element={<Permission />} />
          <Route path="/sample/muipermission" element={<MuiPermission />} />
          <Route path="/sample/muipermission2" element={<MuiPermission2 />} /> */}
                <Route path="/sample/codelist" element={<Example />} />
                <Route
                  path="/"
                  element={<PrivateRoute element={<MainLayout />} />}
                >
                  <Route index element={<PrivateRoute element={<Home />} />} />
                  {/* <Route path="/items" element={<PrivateRoute element={<Item />} />} /> */}
                  <Route
                    path="/items"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="5">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="5" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="5" api={api}>
                                <ItemMaster />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/item-group"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="14">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="14" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="14" api={api}>
                                <ItemGroupMaster />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />

                  <Route
                    path="/items/:id"
                    element={<PrivateRoute element={<Item />} />}
                  />
                  <Route
                    path="/payers"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="7">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="7" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="7" api={api}>
                                <Payer />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />

                  <Route
                    path="/facility"
                    element={
                      <PrivateRoute
                        element={
                          <AuthGuardProvider functionID="49" api={api}>
                            <Facility />
                          </AuthGuardProvider>
                        }
                      />
                    }
                  />

                  <Route
                    path="/bed-class"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="43">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="43" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="43" api={api}>
                                <BedClassProvider>
                                  <BedClass />
                                </BedClassProvider>
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/patients"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="20">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="20" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="20" api={api}>
                                <Patient />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/employee"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="21">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="21" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="21" api={api}>
                                <Employee />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/item_prices"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="6">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="6" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="6" api={api}>
                                <ItemPrice />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/code"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="8">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="8" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="8" api={api}>
                                <CodeMaster />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />

                  <Route
                    path="/package-setup"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="15">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="15" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="15" api={api}>
                                <PackageSetupMaster />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />

                  <Route
                    path="/users"
                    element={
                      <PrivateRoute
                        element={
                          <AuthGuard functionID="9">
                            <OldAuthGuardProvider functionID="9" api={api}>
                              <AuthGuardProvider functionID="9" api={api}>
                                <UsersMaster />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="3">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="3" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="3" api={api}>
                                <Settings />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/resource"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="10">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="10" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="10" api={api}>
                                <ResourceManagement />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/code-mapping"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="13">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="13" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="13" api={api}>
                                <MappingCode />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/system-rules"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="3">
                            {/* // old resource_key */}
                            <OldAuthGuardProvider functionID="3" api={api}>
                              {/* // shared provider (permission , ui text)  */}
                              <AuthGuardProvider functionID="3" api={api}>
                                <Settings />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  {/* <Route
                    path="/resource"
                    element={<PrivateRoute element={<ResourceManagement />} />}
                  />
                  <Route
                    path="/code-mapping"
                    element={<PrivateRoute element={<MappingCode />} />}
                  /> */}

                  <Route
                    path="/order"
                    element={
                      <PrivateRoute
                        element={
                          <AuthGuard functionID="24">
                            <OldAuthGuardProvider functionID="24" api={api}>
                              <AuthGuardProvider functionID="24" api={api}>
                                <Order />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/invoices"
                    element={
                      <PrivateRoute
                        element={
                          <AuthGuard functionID="22">
                            <OldAuthGuardProvider functionID="22" api={api}>
                              <AuthGuardProvider functionID="22" api={api}>
                                <Invoices />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/patient-account"
                    element={
                      <PrivateRoute
                        element={
                          <AuthGuard functionID="11">
                            <PatientAccountProvider>
                              <SinglePatient />
                            </PatientAccountProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/payment"
                    element={
                      <PrivateRoute
                        element={
                          // local billing
                          <AuthGuard functionID="23">
                            <OldAuthGuardProvider functionID="23" api={api}>
                              <AuthGuardProvider functionID="23" api={api}>
                                <Payment />
                              </AuthGuardProvider>
                            </OldAuthGuardProvider>
                          </AuthGuard>
                        }
                      />
                    }
                  />
                  <Route
                    path="/send-feedback"
                    element={
                      <AuthGuardProvider functionID="46" api={api}>
                        <SendFeedback />
                      </AuthGuardProvider>
                    }
                  />
                  <Route
                    path="/feedback-admin"
                    element={
                      <AuthGuardProvider functionID="45" api={api}>
                        <FeedbackAdmin />
                      </AuthGuardProvider>
                    }
                  />
                  <Route
                    path="/help/:functionId"
                    element={
                      <AuthGuardProvider functionID="47" api={api}>
                        <HelpPage />
                      </AuthGuardProvider>
                    }
                  />
                  <Route
                    path="/help-management"
                    element={
                      <AuthGuardProvider functionID="50" api={api}>
                        <HelpManagement />
                      </AuthGuardProvider>
                    }
                  />
                  <Route
                    path="/patient-episode"
                    element={
                      <AuthGuardProvider functionID="51" api={api}>
                        <PatientEpisode />
                      </AuthGuardProvider>
                    }
                  />
                  <Route
                    path="/change-password"
                    element={
                      <AuthGuardProvider functionID="48" api={api}>
                        <ChangePassword />
                      </AuthGuardProvider>
                    }
                  />
                </Route>
              </Routes>
            </LocalizationProvider>
          </ThemeProvider>
        </div>
      </CacheProvider>
      {/* </ThemeProvider> */}
    </>
  );
};

const App: React.FC = () => {
  // const {
  //   isAuthenticated,

  // } = useAppSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  useLayoutEffect(() => {
    const splashPreference = localStorage.getItem("showSplash");
    const authenticated = sessionStorage.getItem("Authenticated");
    if (splashPreference === "false" || authenticated == "true") {
      setShowSplash(false);
    }
  }, []);

  const handleSkip = () => {
    setShowSplash(false);
  };

  const handleDisableFuture = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          onSkip={handleSkip}
          onDisableFuture={handleDisableFuture}
        />
      )}
      {!showSplash && (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {/* <LanguageProvider> */}
          <Provider store={store}>
            <GlThemeProvider>
              {/* <BrowserRouter basename={location.pathname.split("/")[1]}>
                <AppContent />
              </BrowserRouter> */}

              <BrowserRouter basename="/">
                <LanguageProvider>
                  <AppContent />
                </LanguageProvider>
              </BrowserRouter>
            </GlThemeProvider>
            {/* <ThemeProvider> */}
            {/* <PersistGate loading={null} persistor={persistor}> */}
            {/* </PersistGate> */}
            {/* </ThemeProvider> */}
          </Provider>
          {/* </LanguageProvider> */}
        </LocalizationProvider>
      )}
    </>
  );
};
export default App;
