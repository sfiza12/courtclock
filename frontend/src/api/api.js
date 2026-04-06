import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const fetchStats = async () => {
  try {
    const res = await axios.get(`${BASE}/stats`);
    return res.data.data;
  } catch (error) {
    console.error("fetchStats Error:", error);
    return null;
  }
};

export const fetchPriorityCases = async () => {
  try {
    const res = await axios.get(`${BASE}/cases/priority`);
    return res.data.data;
  } catch (error) {
    console.error("fetchPriorityCases Error:", error);
    return null;
  }
};

export const fetchDateCases = async () => {
  try {
    const res = await axios.get(`${BASE}/cases`);
    return res.data.data;
  } catch (error) {
    console.error("fetchDateCases Error:", error);
    return null;
  }
};

export const fetchCase = async (id) => {
  try {
    const res = await axios.get(`${BASE}/cases/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`fetchCase(${id}) Error:`, error);
    return null;
  }
};

export const fetchAlerts = async () => {
  try {
    const res = await axios.get(`${BASE}/alerts/436a`);
    return res.data.data;
  } catch (error) {
    console.error("fetchAlerts Error:", error);
    return null;
  }
};

export const fetchExplanation = async (id) => {
  try {
    const res = await axios.get(`${BASE}/ai/explain/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`fetchExplanation(${id}) Error:`, error);
    return null;
  }
};

export const judgeLogin = async (email, password) => {
  try {
    const res = await axios.post(`${BASE}/auth/judge-login`, { email, password });
    return res.data;
  } catch (error) {
    throw error.response?.data?.error || "Login failed.";
  }
};

export const judgeSignup = async (email, password) => {
  try {
    const res = await axios.post(`${BASE}/auth/judge-signup`, { email, password });
    return res.data;
  } catch (error) {
    throw error.response?.data?.error || "Signup failed.";
  }
};

