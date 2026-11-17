import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  Popover,
  Tooltip,
  Slider,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { HexColorPicker } from "react-colorful";
import SettingsIcon from "@mui/icons-material/Settings";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TabContext, TabPanel } from "@mui/lab";
import { GlRadioGroup } from "../../shared/forms/StandAlone/GlRadioGroup";
import { useGlTheme } from "../GlThmeProvider/GlThmeProvider";

export const THEME_OBJ_TOKEN = "APP_THEME";

// Helper function to safely get nested values
const getNestedValue = (obj: any, path: string, defaultValue: any = undefined) => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
};

// Helper function to set nested values
const setNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  const newObj = JSON.parse(JSON.stringify(obj || {}));
  let current = newObj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return newObj;
};

const GlThemeEditor = () => {
  const theme = useTheme();
  const {
    setCustomPalette,
    font,
    setFont,
    customPalette,
    buttons,
    setButtonsProps,
    dataGrid,
    dataGridRowHeight,
    setDataGridRowHeight,
    setDataGridProps,
    dialog,
    setDialogProps,
    textField,
    setTextFieldProps,
  } = useGlTheme();
  
  const [tabValue, setTabValue] = useState("1");
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePath, setActivePath] = useState<string>("");



  const handleButtonChange = (key: string, value: any) => {
    const updated = { ...(buttons || {}), [key]: value };
    setButtonsProps(updated);
  };

  const handleChangeTab = (_: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLElement>, path: string) => {
      setAnchorEl(event.currentTarget);
      setActivePath(path);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
    setActivePath("");
  }, []);

  const handleChange = useCallback(
    (path: string, value: string) => {
      const updatedPalette = setNestedValue(customPalette, path, value);
      setCustomPalette(updatedPalette);
    },
    [customPalette, setCustomPalette]
  );

  const handleChangeFont = useCallback(
    (path: string, value: string) => {
      const updatedFont = { ...(font || {}) };
      
      if (path === 'fontFamily') {
        updatedFont.fontFamily = value;
      } else if (path === 'fontSize') {
        updatedFont.fontSize = value;
      }
      
      setFont(updatedFont);
    },
    [font, setFont]
  );

  const saveTheme = () => {
    const themeObj = {
      customPalette: customPalette || {},
      font: font || {},
      buttons: buttons || {},
      dataGrid: {
        ...(dataGrid || {}),
        rowHeight: dataGridRowHeight || 40,
        columnHeaderHeight: dataGridRowHeight || 40,
      },
      textField: textField || {},
      dialog: dialog || {},
    };

    sessionStorage.setItem(THEME_OBJ_TOKEN, JSON.stringify(themeObj));
    // alert('Theme saved successfully!');
  };

  // Color options - get from customPalette first, then fallback to theme
  const colorOptions = useMemo(() => {
    const getColor = (path: string) => {
      const customColor = getNestedValue(customPalette, path);
      if (customColor) return customColor;
      
      // Fallback to theme
      return getNestedValue(theme.palette, path, '#1976d2');
    };

    return [
      {
        label: "Primary",
        path: "primary.main",
        color: getColor('primary.main'),
      },
      {
        label: "Secondary",
        path: "primary.light",
        color: getColor('primary.light'),
      },
      {
        label: "Main BG",
        path: "background.default",
        color: getColor('background.default'),
      },
      {
        label: "SideBar BG",
        path: "background.paper",
        color: getColor('background.paper'),
      },
    ];
  }, [customPalette, theme.palette]);

  const textColorOptions = useMemo(() => {
    const getColor = (path: string) => {
      const customColor = getNestedValue(customPalette, path);
      if (customColor) return customColor;
      
      // Fallback to theme
      return getNestedValue(theme.palette, path, '#000000');
    };

    return [
      {
        label: "Main Text",
        path: "text.primary",
        color: getColor('text.primary'),
      },
      {
        label: "Contrast Text",
        path: "primary.contrastText",
        color: getColor('primary.contrastText'),
      },
      { 
        label: "Error", 
        path: "error.main", 
        color: getColor('error.main') 
      },
    ];
  }, [customPalette, theme.palette]);

  const fontsOption = useMemo(() => [
    { label: "Segoe UI", value: "Segoe UI" },
    { label: "Arial", value: "Arial" },
    { label: "Tahoma", value: "Tahoma" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Georgia", value: "Georgia" },
    { label: "Lucida Sans Unicode", value: "Lucida Sans Unicode" },
    { label: "Impact", value: "Impact" },
    { label: "Roboto", value: "Roboto" },
  ], []);

  const getActiveColor = useCallback(() => {
    const allOptions = [...colorOptions, ...textColorOptions];
    const option = allOptions.find(opt => opt.path === activePath);
    return option ? option.color : '#000000';
  }, [activePath, colorOptions, textColorOptions]);

  const popoverOpen = Boolean(anchorEl);
  const currentFontFamily = font?.fontFamily || theme.typography.fontFamily;
  const currentFontSize = font?.fontSize || theme.typography.fontSize || 14;

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(!open)}>
        <SettingsIcon />
      </IconButton>

      <Drawer
        sx={{ zIndex: 9999 }}
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box
          sx={{
            width: 320,
            p: 2,
            pt: 10,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" gutterBottom>
            🎨 Theme Editor
          </Typography>

          <TabContext value={tabValue}>
            <Tabs 
              value={tabValue} 
              onChange={handleChangeTab}
              sx={{ mb: 2 }}
            >
              <Tab label="Main" value="1" />
              <Tab label="Components" value="2" />
            </Tabs>

            <TabPanel value="1" sx={{ p: 0, overflow: 'auto', flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Background Colors
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                {colorOptions.map((option) => (
                  <Box
                    key={option.path}
                    sx={{ display: "flex", flexDirection: "column", alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ mb: 0.5 }}>
                      {option.label}
                    </Typography>
                    <Tooltip title={`${option.label}: ${option.color}`} followCursor>
                      <Box
                        onClick={(e) => handleOpenPopover(e, option.path)}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: option.color,
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: 'pointer',
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&:hover': {
                            border: `2px solid ${theme.palette.primary.main}`,
                          }
                        }}
                      >
                        <FormatPaintIcon 
                          sx={{ 
                            color: theme.palette.getContrastText(option.color),
                            fontSize: 20 
                          }} 
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Text Colors
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
                {textColorOptions.map((option) => (
                  <Box
                    key={option.path}
                    sx={{ display: "flex", flexDirection: "column", alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ mb: 0.5 }}>
                      {option.label}
                    </Typography>
                    <Tooltip title={`${option.label}: ${option.color}`} followCursor>
                      <Box
                        onClick={(e) => handleOpenPopover(e, option.path)}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: option.color,
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: 'pointer',
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&:hover': {
                            border: `2px solid ${theme.palette.primary.main}`,
                          }
                        }}
                      >
                        <FormatPaintIcon 
                          sx={{ 
                            color: theme.palette.getContrastText(option.color),
                            fontSize: 20 
                          }} 
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                ))}
              </Box>

              <Popover
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{ zIndex: 99999 }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                    Editing: {activePath}
                  </Typography>
                  <HexColorPicker
                    color={getActiveColor()}
                    onChange={(val) => handleChange(activePath, val)}
                  />
                </Box>
              </Popover>

              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Typography
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                  Font Size: {currentFontSize}px
                </Typography>
                <Slider
                  value={currentFontSize}
                  onChange={(_, value) => handleChangeFont('fontSize', value.toString() )}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={8}
                  max={24}
                  sx={{ mb: 3 }}
                />
              </Box>

              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                Font Family
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 3 }}>
                {fontsOption.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentFontFamily === option.value ? "contained" : "outlined"}
                    onClick={() => handleChangeFont('fontFamily', option.value)}
                    sx={{
                      py: 1,
                      fontSize: '0.75rem',
                      fontFamily: option.value,
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                    }}
                    startIcon={currentFontFamily === option.value ? <SpellcheckIcon /> : undefined}
                  >
                    {option.label}
                  </Button>
                ))}
              </Box>
            </TabPanel>

            <TabPanel value={"2"} sx={{ p: 0, overflow: 'auto', flex: 1 }}>
              <Accordion defaultExpanded sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Button Properties</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                  <GlRadioGroup
                    label="Variant"
                    name="variant"
                    options={[
                      { label: "Text", value: "text" },
                      { label: "Outlined", value: "outlined" },
                      { label: "Contained", value: "contained" },
                    ]}
                    value={buttons?.variant || 'contained'}
                    onChange={(value) => handleButtonChange("variant", value)}
                   
                    
                  />

                  <GlRadioGroup
                    label="Color"
                    name="color"
                    options={[
                      { label: "Primary", value: "primary" },
                      { label: "Secondary", value: "secondary" },
                      { label: "Error", value: "error" },
                      { label: "Success", value: "success" },
                      { label: "Warning", value: "warning" },
                    ]}
                    value={buttons?.color || 'primary'}
                    onChange={(value) => handleButtonChange("color", value)}
                   
                  />

                  <GlRadioGroup
                    label="Size"
                    name="size"
                    options={[
                      { label: "Small", value: "small" },
                      { label: "Medium", value: "medium" },
                      { label: "Large", value: "large" },
                    ]}
                    value={buttons?.size || 'medium'}
                    onChange={(value) => handleButtonChange("size", value)}
                
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={buttons?.fullWidth || false}
                        onChange={(e) =>
                          handleButtonChange("fullWidth", e.target.checked)
                        }
                      />
                    }
                    label="Full Width"
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">DataGrid Properties</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    Row Height: {dataGridRowHeight}px
                  </Typography>
                  <Slider
                    value={dataGridRowHeight}
                    onChange={(_, value) => setDataGridRowHeight(value as number)}
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={30}
                    max={80}
                    sx={{ mb: 3 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={dataGrid?.disableColumnFilter || false}
                        onChange={(e) =>
                          setDataGridProps({
                            ...(dataGrid || {}),
                            disableColumnFilter: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Disable Column Filter"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={dataGrid?.disableColumnMenu || false}
                        onChange={(e) =>
                          setDataGridProps({
                            ...(dataGrid || {}),
                            disableColumnMenu: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Disable Column Menu"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={dataGrid?.hideFooter || false}
                        onChange={(e) =>
                          setDataGridProps({
                            ...(dataGrid || {}),
                            hideFooter: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Hide Footer"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={dataGrid?.disableColumnSorting || false}
                        onChange={(e) =>
                          setDataGridProps({
                            ...(dataGrid || {}),
                            disableColumnSorting: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Disable Column Sorting"
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Dialog Properties</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={dialog?.fullWidth || false}
                        onChange={(e) =>
                          setDialogProps({
                            ...(dialog || {}),
                            fullWidth: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Full Width"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={dialog?.fullScreen || false}
                        onChange={(e) =>
                          setDialogProps({
                            ...(dialog || {}),
                            fullScreen: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Full Screen"
                  />

                  <GlRadioGroup
                    label="Max Width"
                    name="maxWidth"
                    options={[
                      { label: "xs", value: "xs" },
                      { label: "sm", value: "sm" },
                      { label: "md", value: "md" },
                      { label: "lg", value: "lg" },
                      { label: "xl", value: "xl" },
                      { label: "false", value: 'false' },
                    ]}
                    value={dialog?.maxWidth || 'md'}
                    onChange={(value) =>
                      setDialogProps({
                        ...(dialog || {}),
                        maxWidth: value  == 'false' ? false : value,
                      })
                    }
                    
                   
                  />

                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    Transition Duration: {dialog?.transitionDuration || 300}ms
                  </Typography>
                  <Slider
                    value={dialog?.transitionDuration || 300}
                    onChange={(_, value) =>
                      setDialogProps({
                        ...(dialog || {}),
                        transitionDuration: value as number,
                      })
                    }
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={50}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">TextField Properties</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                  <GlRadioGroup
                    label="Variant"
                    name="variant"
                    options={[
                      { label: "Outlined", value: "outlined" },
                      { label: "Filled", value: "filled" },
                      { label: "Standard", value: "standard" },
                    ]}
                    value={textField?.variant || 'outlined'}
                    onChange={(value) =>
                      setTextFieldProps({ ...(textField || {}), variant: value })
                    }
                   
                  />

                  <GlRadioGroup
                    label="Size"
                    name="size"
                    options={[
                      { label: "Small", value: "small" },
                      { label: "Medium", value: "medium" },
                    ]}
                    value={textField?.size || 'medium'}
                    onChange={(value) =>
                      setTextFieldProps({ ...(textField || {}), size: value })
                    }
                    
                  />

                  <GlRadioGroup
                    label="Color"
                    name="color"
                    options={[
                      { label: "Primary", value: "primary" },
                      { label: "Secondary", value: "secondary" },
                      { label: "Error", value: "error" },
                      { label: "Info", value: "info" },
                      { label: "Success", value: "success" },
                      { label: "Warning", value: "warning" },
                    ]}
                    value={textField?.color || 'primary'}
                    onChange={(value) =>
                      setTextFieldProps({ ...(textField || {}), color: value })
                    }
                    
                    
                  />

                  <GlRadioGroup
                    label="Margin"
                    name="margin"
                    options={[
                      { label: "None", value: "none" },
                      { label: "Dense", value: "dense" },
                      { label: "Normal", value: "normal" },
                    ]}
                    value={textField?.margin || 'normal'}
                    onChange={(value) =>
                      setTextFieldProps({ ...(textField || {}), margin: value })
                    }
                    
                    
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={textField?.fullWidth || true}
                        onChange={(e) =>
                          setTextFieldProps({
                            ...(textField || {}),
                            fullWidth: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Full Width"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={textField?.disabled || false}
                        onChange={(e) =>
                          setTextFieldProps({
                            ...(textField || {}),
                            disabled: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Disabled"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={textField?.required || false}
                        onChange={(e) =>
                          setTextFieldProps({
                            ...(textField || {}),
                            required: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Required"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={textField?.error || false}
                        onChange={(e) =>
                          setTextFieldProps({
                            ...(textField || {}),
                            error: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Error"
                  />
                </AccordionDetails>
              </Accordion>
            </TabPanel>
          </TabContext>

          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button 
              variant="contained" 
              onClick={saveTheme}
              fullWidth
            >
              Save Theme
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setOpen(false)}
              fullWidth
              sx={{ mt: 1 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default GlThemeEditor;