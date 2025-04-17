import React from 'react';  
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './containers/Home';
import Login from './containers/Login';
import ResetPassword from './containers/ResetPassword';
import Signup from './containers/Signup';
import ResetPasswordConfirm from './containers/ResetPasswordConfirm';
import Activate from './containers/Activate';
import Layout from './hocs/Layout';

import { Provider } from 'react-redux';
import store from './store';

const App = () => {
    return(
        <Provider store={store}>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />
                        <Route path="/activate/:uid/:token" element={<Activate />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </Provider>
    );
    
};

export default App;