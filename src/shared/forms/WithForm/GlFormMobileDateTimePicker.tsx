import { useField, useFormikContext } from 'formik';
import { GlMobileDateTimePicker, GlMobileDateTimePickerProps } from '../StandAlone/GlMobileDateTimePicker';

// ----------------------------------------------------------------------

type GlFormMobileDateTimePickerProps = Omit<
  GlMobileDateTimePickerProps,
  'value' | 'onChange' | 'error' | 'errorMessage' | 'onBlur'
>;

export function GlFormMobileDateTimePicker({ name, label, helperText, ...other }: GlFormMobileDateTimePickerProps) {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(name);

  return (
    <GlMobileDateTimePicker
      name={name}
      label={label}
      helperText={helperText}
      value={field.value}
      onChange={(date: Date | null) => {
        setFieldValue(name, date);
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