import { useField, useFormikContext } from 'formik';
import { GlRadioGroup, GlRadioGroupProps } from '../StandAlone/GlRadioGroup';

export function GlFormRadioGroup({ 
  name, 
  label, 
  options, 
  helperText, 
  row = false, 
  ...other 
}: Omit<GlRadioGroupProps, 'value' | 'onChange' | 'error' | 'errorMessage' | 'onBlur'>) {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(name);

  return (
    <GlRadioGroup
      name={name}
      label={label}
      options={options}
      helperText={helperText}
      row={row}
      value={field.value}
      onChange={(value: any) => {
        setFieldValue(name, value);
      }}
      onBlur={() => {
        setFieldTouched(name, true);
      }}
      error={meta.touched && !!meta.error}
      errorMessage={meta.touched && meta.error ? meta.error : undefined}
      {...other}
    />
  );
}