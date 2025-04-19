// src/actions/projects.js
import axios from 'axios';
import {
    GET_PROJECTS,
    GET_PROJECT,
    CREATE_PROJECT,
    UPDATE_PROJECT,
    DELETE_PROJECT,
    PROJECT_ERROR
} from './types';

// Get all projects
export const getProjects = () => async dispatch => {
    try {
        const res = await axios.get('/api/charities/projects/');

        dispatch({
            type: GET_PROJECTS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROJECT_ERROR,
            payload: { msg: err.response.data, status: err.response.status }
        });
    }
};

// Get project by ID
export const getProject = id => async dispatch => {
    try {
        const res = await axios.get(`/api/charities/projects/${id}/`);

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
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const res = await axios.post('/api/charities/projects/', formData, config);

        dispatch({
            type: CREATE_PROJECT,
            payload: res.data
        });

        // Redirect to project page
        navigate(`/projects`);
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
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const res = await axios.patch(`/api/charities/projects/${id}/`, formData, config);

        dispatch({
            type: UPDATE_PROJECT,
            payload: res.data
        });

        // Redirect to project page
        navigate(`/projects/${res.data.id}`);
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
            await axios.delete(`/api/charities/projects/${id}/`);

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