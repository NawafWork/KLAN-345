import React from 'react';  
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './containers/Home';
import Login from './containers/Login';
import ResetPassword from './containers/ResetPassword';
import Signup from './containers/Signup';
import ResetPasswordConfirm from './containers/ResetPasswordConfirm';
import About from './containers/About';
import Activate from './containers/Activate';
import Layout from './hocs/Layout';

import Projects from './containers/Projects';
import ProjectDetail from './containers/ProjectDetail';
import ProjectCreate from './containers/ProjectCreate';
import ProjectEdit from './containers/ProjectEdit';

import Donate from './containers/Donate';
import UserProfile from './containers/UserProfile';
import './styles/custom.css';

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
                        <Route path="/about" element={<About />} />

                        {/* Project Routes */}
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/projects/create" element={<ProjectCreate />} />
                        <Route path="/projects/edit/:id" element={<ProjectEdit />} />


                        {/* Donation Route */}
                        <Route path="/donate" element={<Donate />} />
                        <Route path="/profile" element={<UserProfile />} />
                        
                        {/* 404 Not Found */}
                        <Route path="*" element={<h1>404 Not Found</h1>} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </Provider>
    );
    
};

export default App;