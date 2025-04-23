import { combineReducers } from 'redux';
import authReducer from './auth';
import projects from './projects';
import donations from './donations';

export default combineReducers({
    auth: authReducer,
    projects,
    donations
});