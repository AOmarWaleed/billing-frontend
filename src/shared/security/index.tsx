import GLAutocomplete from "./GLAutocomplete";
import GLButton from "./GLButton";
import GLGenericButton from "./GLGenericButton";
import GLIconButton from "./GLIconButton";
import GLTextField from "./GLTextField";
import GlCustomTable from "./GLCustomTable";
import GLLabelAndField from "./GLLabelAndField";
import GLTab from "./GLTab";
import GLFormControlLabel from "./GLFormControlLabel";
import GLExportButton from "./GLExportButton";
import GLTypography from "./GLTypography";
import GLDatePicker from "./GLDatePicker";
import GLTableCell from "./GLTableCell";
import GLGenericFormControlLabel from "./GLGenericFormControlLabel";
import GLTabPanel from "./GLTabPanel";
import GLFormControl from "./GLFormControl";
import GLGenericAutocomplete from "./GLGenericAutoComplete";
import GLTooltip from "./GLTooltip";
import {
  GlFormAutoCompleteSecure,
  GLFormDatePickerSecure,
  GLFormTextFieldSecure,
  GLFormDateTimePickerSecure,
  GLFormSelectSecure,
} from "./SecureFormController";
const Secure = {
  GLAutocomplete,
  GLButton,
  GLGenericButton,
  GLIconButton,
  GLTextField,
  GlCustomTable,
  GLLabelAndField,
  GLTab,
  GLFormControlLabel,
  GLExportButton,
  GLTypography,
  GLDatePicker,
  GLGenericAutocomplete,
  GLTableCell,
  GLTabPanel,
  GLGenericFormControlLabel,
  GLFormControl,
  GLTooltip,
  GlFormAutoComplete: GlFormAutoCompleteSecure,
  GLFormDatePicker: GLFormDatePickerSecure,
  GLFormTextField: GLFormTextFieldSecure,
  GLFormDateTimePicker: GLFormDateTimePickerSecure,
  GLFormSelect: GLFormSelectSecure,
};

export default Secure;
