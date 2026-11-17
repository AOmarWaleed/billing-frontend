import axios from 'axios';
//const BASE_URL ='http://172.22.27.235:8080/api';
//const BASE_URL ='http://localhost:3001/';
const BASE_URL ='http://172.16.4.150:3001/';

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-type": "application/json"
      }
});
