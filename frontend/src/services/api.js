import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getTeams = () => api.get('/meta/teams').then(r => r.data.teams);
export const getVenues = () => api.get('/meta/venues').then(r => r.data.venues);
export const getModelAccuracies = () => api.get('/meta/model-accuracies').then(r => r.data);

export const predict = (payload) => api.post('/predict', payload).then(r => r.data);
export const getCommentary = (payload) => api.post('/meta/commentary', payload).then(r => r.data);
export const getPredictionHistory = () => api.get('/predict/history').then(r => r.data);
