import {
    GET_USER_DONATIONS,
    DONATION_ERROR
} from '../actions/types';

const initialState = {
    donations: [],
    loading: true,
    error: {}
};

const donationReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch(type) {
        case GET_USER_DONATIONS:
            return {
                ...state,
                donations: payload,
                loading: false
            };
        case DONATION_ERROR:
            return {
                ...state,
                error: payload,
                loading: false
            };
        default:
            return state;
    }
};

export default donationReducer;