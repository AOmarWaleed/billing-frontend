import {AxiosError}  from 'axios'; 
export const handleAxiosError = (error: AxiosError): string => {
     if (error.response) { // Server responded with a status other than 200 range 
     return error.response.data?.message || 'An unknown server error occurred';
     } else if (error.request) { // Request was made but no response received
        return 'No response received from the server';
     } else { // Something happened in setting up the request 
             return error.message|| 'An unknown error occurred'; } };