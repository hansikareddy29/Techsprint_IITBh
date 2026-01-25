import axios from 'axios';


const BASE_URL = "https://voltguardai-f0g0.onrender.com/api"; 

export const api = {
  getDevices: () => axios.get(`${BASE_URL}/logs/list-devices`),
  getStats: (id) => axios.get(`${BASE_URL}/logs/stats/${id}`),
  getHistory: (id) => axios.get(`${BASE_URL}/logs/history/${id}`),
  getDiagnosis: (id) => axios.get(`${BASE_URL}/ai/diagnosis/${id}`)
};
