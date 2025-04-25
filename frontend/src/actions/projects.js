// src/actions/projects.js
import axiosInstance from '../utils/axiosConfig';
import {
    GET_PROJECT,
    CREATE_PROJECT,
    UPDATE_PROJECT,
    DELETE_PROJECT,
    PROJECT_ERROR,
    GET_USER_PROJECTS,
    GET_USER_PROJECTS_ERROR,
    GET_PROJECTS_SUCCESS, 
    GET_PROJECTS_FAIL
} from './types';

// Get all projects
export const getProjects = () => async dispatch => {
    try {
        const res = await axiosInstance.get('/api/charities/projects/');
        
        dispatch({
            type: GET_PROJECTS_SUCCESS,
            payload: res.data || [] 
        });
    } catch (err) {
        dispatch({
            type: GET_PROJECTS_FAIL,
            payload: {
                msg: err.response?.data?.message || err.message || 'Error loading projects'
            }
        });
    }
};

// Get project by ID
export const getProject = id => async dispatch => {
    try {
        const res = await axiosInstance.get(`/api/charities/projects/${id}/`);

        dispatch({
            type: GET_PROJECT,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROJECT_ERROR,
            payload: { msg: err.response.data, status: err.response.status }
        });
    }
};

// Create project
export const createProject = (formData, navigate) => async dispatch => {
    try {
        const res = await axiosInstance.post('/api/charities/projects/', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        dispatch({
            type: CREATE_PROJECT,
            payload: res.data
        });

        navigate('/projects');
    } catch (err) {
        dispatch({
            type: PROJECT_ERROR,
            payload: { msg: err.response.data, status: err.response.status }
        });
    }
};

// Update project
export const updateProject = (id, formData, navigate) => async dispatch => {
    try {
        const res = await axiosInstance.patch(`/api/charities/projects/${id}/`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        dispatch({
            type: UPDATE_PROJECT,
            payload: res.data
        });

        navigate(`/projects/${id}`);
    } catch (err) {
        dispatch({
            type: PROJECT_ERROR,
            payload: { msg: err.response.data, status: err.response.status }
        });
    }
};

// Delete project
export const deleteProject = (id, navigate) => async dispatch => {
    if (window.confirm('Are you sure you want to delete this project?')) {
        try {
            await axiosInstance.delete(`/api/charities/projects/${id}/`);

            dispatch({
                type: DELETE_PROJECT,
                payload: id
            });

            navigate('/projects');
        } catch (err) {
            dispatch({
                type: PROJECT_ERROR,
                payload: { msg: err.response.data, status: err.response.status }
            });
        }
    }
};

export const getUserProjects = (userId) => async dispatch => {
    try {
        const res = await axiosInstance.get(`/api/charities/projects/user/${userId}/`);

        dispatch({
            type: GET_USER_PROJECTS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: GET_USER_PROJECTS_ERROR,
            payload: { msg: err.response?.data, status: err.response?.status }
        });
    }
};