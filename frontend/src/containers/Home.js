import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className='container'>
            <div className='jumbotron mt-5'>
                <h1 className='display-4'>Charity Web Application</h1>
                <p className='lead'>Authentication!</p>
                <hr className='my-4' />
                <p>Click the Log In button</p>
                <Link className='btn btn-primary btn-lg' to='/login' role='button'>Login</Link>
            </div>
        </div>
    );
};

export default Home;