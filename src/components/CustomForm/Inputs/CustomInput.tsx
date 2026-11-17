import { CheckboxField } from "./CheckBoxField";
import SelectField from "./SelectField";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { RadioGroupField } from "./RadioGroupField";
import CustomAutoComplete from "./customAutocomplete";

type CustomInputProps = {
  name: string;
  label?: string;
  type?: string;
  options?: any[];
  optionsWithKeyAndValue?: {key : string , value : string}[];
  size?: "small" | "medium";
  withIcon?: boolean;
  icon?: React.ReactNode;
  position?: "start" | "end";
  margin?: "dense" | "normal" | "none";
  widthPercentage?: string;
  handleIconClick?: () => void;
  updateValue?: (newValue: any) => void;
  setter?: (x: any, y: any) => void;
  value?: any;
  keyOb1?: string;
  keyOb2?: string;
  keys?: { [key: string]: any };
};

export default function CustomInput({
  name,
  label,
  type = "text",
  options,
  size = "small",
  withIcon = false,
  icon,
  position = "start",
  margin = "none",
  widthPercentage,
  handleIconClick,
  value,
  updateValue,
  setter,
  keys,
  keyOb1 ,
  keyOb2,
  optionsWithKeyAndValue
}: CustomInputProps) {
  switch (type) {
    case "autocomplete":
      return (
        <CustomAutoComplete
          value={value}
          update={updateValue!}
          name={name}
          label={label!}
          options={options!}
          handleIconClick={handleIconClick!}
          icon={icon}
          {...keys}
          keyOb1={keyOb1!}
          keyOb2={keyOb2}
          setter={setter!}
        />
      );
    case "select":
      return (
        <SelectField
        optionsWithKeyAndValue={optionsWithKeyAndValue}
          widthPercentage={widthPercentage}
          name={name}
          label={label!}
          options={options!}
          size={size}
        />
      );
    case "checkbox":
      return <CheckboxField name={name} label={label!} size={size} value={value} />;
    case "password":
      return (
        <PasswordField
          widthPercentage={widthPercentage}
          name={name}
          label={label!}
          size={size}
        />
      );
    case "radio":
      return <RadioGroupField name={name} label={label!} options={options!} />;
    default:
      return (
        <TextField
          name={name}
          label={label!}
          widthPercentage={widthPercentage}
          type={type}
          size={size}
          margin={margin}
          withIcon={withIcon}
          icon={icon}
          position={position}
          handleIconClick={handleIconClick}
        />
      );
  }
}
