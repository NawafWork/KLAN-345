import {
    GET_PROJECTS,
    GET_PROJECT,
    CREATE_PROJECT,
    UPDATE_PROJECT,
    DELETE_PROJECT,
    PROJECT_ERROR,
    GET_USER_PROJECTS,
    GET_USER_PROJECTS_ERROR
} from '../actions/types';

const initialState = {
    projects: [],
    project: null,
    loading: true,
    error: {}
};

// Named function instead of anonymous function
const projectReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case GET_PROJECTS:
            return {
                ...state,
                projects: payload,
                loading: false
            };
        case GET_PROJECT:
            return {
                ...state,
                project: payload,
                loading: false
            };
        case CREATE_PROJECT:
            return {
                ...state,
                projects: [payload, ...state.projects],
                loading: false
            };
        case UPDATE_PROJECT:
            return {
                ...state,
                projects: state.projects.map(project =>
                    project.id === payload.id ? payload : project
                ),
                project: payload,
                loading: false
            };
        case DELETE_PROJECT:
            return {
                ...state,
                projects: state.projects.filter(project => project.id !== payload),
                loading: false
            };
        case PROJECT_ERROR:
            return {
                ...state,
                error: payload,
                loading: false
            };
        case GET_USER_PROJECTS:
            return {
                ...state,
                userProjects: payload,
                loading: false
            };
        case GET_USER_PROJECTS_ERROR:
            return {
                ...state,
                error: payload,
                loading: false
            };
        default:
            return state;
    }
};

export default projectReducer;