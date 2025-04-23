import axios from 'axios';
import { 
    GET_USER_DONATIONS,
    DONATION_ERROR
} from './types';

export const getUserDonations = (userId) => async dispatch => {
    try {
        const res = await axios.get(`/api/charities/donations/user/${userId}/`);

        dispatch({
            type: GET_USER_DONATIONS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: DONATION_ERROR,
            payload: { msg: err.response.data, status: err.response.status }
        });
    }
};
