import axios from 'axios';

// IMPORTANT: Replace with Hansika's IPv4 Address for the final demo
const BASE_URL = "http://10.50.3.159:8080/api"; 

export const api = {
  getDevices: () => axios.get(`${BASE_URL}/logs/list-devices`),
  getStats: (id) => axios.get(`${BASE_URL}/logs/stats/${id}`),
  getHistory: (id) => axios.get(`${BASE_URL}/logs/history/${id}`),
  getDiagnosis: (id) => axios.get(`${BASE_URL}/ai/diagnosis/${id}`)
};