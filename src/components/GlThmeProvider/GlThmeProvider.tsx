import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { THEME_OBJ_TOKEN } from "../GlThemeEditor/GlThemeEditor";
import { useAppSelector } from "../../hooks/hooks";

const GlThemeContext = createContext<any>(null);

export const GlThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Get theme options from Redux store or context
  const { mode, density, direction } = useAppSelector((state) => state.theme);

  const [customPalette, setCustomPalette] = useState({});
  const [font, setFont] = useState({
    fontSize: 12,
    fontFamily: "Segoe UI",
  });
  const [buttons, setButtonsProps] = useState({});
  const [dataGrid, setDataGridProps] = useState({});
  const [dataGridRowHeight, setDataGridRowHeight] = useState(40);
  const [dialog, setDialogProps] = useState({});
  const [textField, setTextFieldProps] = useState({});

  // Load saved theme from sessionStorage
  useEffect(() => {
    const savedTheme = sessionStorage.getItem(THEME_OBJ_TOKEN);
    if (savedTheme) {
      const themeObj = JSON.parse(savedTheme);
      setCustomPalette(themeObj.customPalette || {});
      setFont(themeObj.font || { fontSize: 12, fontFamily: "Segoe UI" });
      setButtonsProps(themeObj.buttons || {});
      setDataGridProps(themeObj.dataGrid || {});
      setDataGridRowHeight(themeObj.dataGrid?.rowHeight || 40);
      setDialogProps(themeObj.dialog || {});
      setTextFieldProps(themeObj.textField || {});
    }
  }, []);

  const themeOverrides = useMemo(
    () => ({
      customPalette,
      font,
      buttons,
      dataGrid: {
        ...dataGrid,
        rowHeight: dataGridRowHeight,
        columnHeaderHeight: dataGridRowHeight,
      },
      dialog,
      textField,
      mode,
      density,
      direction,
    }),
    [
      customPalette,
      font,
      buttons,
      dataGrid,
      dataGridRowHeight,
      dialog,
      textField,
      mode,
      density,
      direction,
    ]
  );

  return (
    <GlThemeContext.Provider
      value={{
        ...themeOverrides,
        setCustomPalette,
        setFont,
        setButtonsProps,
        setDataGridProps,
        setDataGridRowHeight,
        setDialogProps,
        setTextFieldProps,
      }}
    >
      {children}
    </GlThemeContext.Provider>
  );
};

export const useGlTheme = () => {
  const ctx = useContext(GlThemeContext);
  if (!ctx) throw new Error("useGlTheme must be used inside GlThemeProvider");
  return ctx;
};
