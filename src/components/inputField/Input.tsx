
import TextField from '@mui/material/TextField';
import { Checkbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

interface InputProps { 
  objValue: { 
    id: string;
    name: string; 
    label: string; 
    type: string; 
    value: string | number; 
    comtype: string;
  // helperText?: string; 
  // isdisabled?: boolean; 
  // isrequired?: boolean;
 }; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) =>
   void; index: number; }

const Input: React.FC<InputProps>= ({ objValue, onChange, index}) => {
    const { id, name,label,type,value,comtype} = objValue;

    const formatDate = (dateString: string) => { 
      const date = new Date(dateString); 
      return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB'); 
      
    };


if (comtype === 'label'){
  return <>
          <div className="col-sm-2" style={{color : 'rgb(160, 158, 158)'}}>
          {name} 
          </div>
         <div className="col-sm-2">
         {type === 'datetime-local' ? formatDate(value.toString()) : value}
          </div>
  </> ;
}
if (comtype === 'checkbox'){
  const isChecked = value === 'Y' || value === 'y';
  return ( 
    <div className="col-sm-2">
             
            <FormControlLabel value={name} control={<Checkbox checked={isChecked} disabled size='small' />}
             label={name} labelPlacement="end" />
       
        </div>);
  
}
return (
   
    <>
 
      
          <label htmlFor={label} className=' title col-sm-2 col-form-label' >{label}</label>
          <div className="col-sm-2">
   
        <TextField 
        id={id}
        // label={id === "incidentDateTime"? "" : label} 
        variant="outlined"
        type={type || "text"}
        // value={ovr[`${id}`]}
        value={value}
        size="small"
        autoComplete="off"
       
         style = {{width: "100%"}}
        onChange={(e) => onChange(e, index)}
        
        required 
        //required = { isrequired || false}
        sx={{
          width: '300px', // Set the width
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'lightgray', // Set the border color
              borderWidth: '2px', // Set the border width
             
            },
            '&:hover fieldset': {
              borderColor: 'green', // Change border color on hover
              borderRadius: '4px',
            }, 
            '&.Mui-focused fieldset': {
              borderColor: 'red', // Change border color when focused
              borderRadius: '4px',
            },
          },
          '& .MuiInputBase-input': {
            resize: 'both', // Allow resizing
            overflow: 'auto', // Handle overflow
          },
        }}
        />

        
    </div>
   </>
   
  )
}

export default Input

