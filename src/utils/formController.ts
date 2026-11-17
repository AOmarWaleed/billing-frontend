import { GlFormAutoComplete } from "../shared/forms/WithForm/GlFormAutoComplete";
import { GlFormCheckbox } from "../shared/forms/WithForm/GlFormCheckbox";
import { GlFormDatePicker } from "../shared/forms/WithForm/GlFormDatePicker";
import { GLFormDateTimePicker } from "../shared/forms/WithForm/GLFormDateTimePicker";
import { GlFormMobileDateTimePicker } from "../shared/forms/WithForm/GlFormMobileDateTimePicker";
import { GlFormMultiCheckbox } from "../shared/forms/WithForm/GlFormMultiCheckbox";
import { GlFormRadioGroup } from "../shared/forms/WithForm/GlFormRadioGroup";
import { GlFormSelect } from "../shared/forms/WithForm/GlFormSelect";
import { GlFormTextField } from "../shared/forms/WithForm/GlFormTextField";


export const Field = {
  Text: GlFormTextField,
  Select: GlFormSelect,
  MobileDateTimePicker: GlFormMobileDateTimePicker,
  DateTimePicker: GLFormDateTimePicker,
  DatePicker: GlFormDatePicker,
  RadioGroup: GlFormRadioGroup,
  Checkbox: GlFormCheckbox,
  MultiCheckBox :GlFormMultiCheckbox,
  AutoComplete : GlFormAutoComplete
  //   Code: RHFCode,
  //   Editor: RHFEditor,
  //   Select: RHFSelect,
  //   Upload: RHFUpload,
  //   Switch: RHFSwitch,
  //   Slider: RHFSlider,
  //   Rating: RHFRating,
  //   Phone: RHFPhoneInput,
  //   Checkbox: RHFCheckbox,
  //   UploadBox: RHFUploadBox,
  //   RadioGroup: RHFRadioGroup,
  //   DatePicker: RHFDatePicker,
  //   MultiSelect: RHFMultiSelect,
  //   MultiSwitch: RHFMultiSwitch,
  //   UploadAvatar: RHFUploadAvatar,
  //   Autocomplete: RHFAutocomplete,
  //   MultiCheckbox: RHFMultiCheckbox,
  //   CountrySelect: RHFCountrySelect,
  //   MobileDateTimePicker: RHFMobileDateTimePicker,
};
