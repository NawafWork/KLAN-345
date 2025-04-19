import { combineReducers } from 'redux';
import authReducer from './auth';
import projects from './projects';

export default combineReducers({
    auth: authReducer,
    projects
});