import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password } from '../actions/auth';

const ResetPassword = ({ reset_password }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { email } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await reset_password(email);
            setRequestSent(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (requestSent) {
        return <Navigate to='/login' />;
    }

    return (
        <div className='container mt-5'>
            <h1>Request Password Reset</h1>
            <p>Enter your email to receive a password reset link</p>
            {error && (
                <div className='alert alert-danger' role='alert'>
                    {error}
                </div>
            )}
            <form onSubmit={e => onSubmit(e)}>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='email'
                        placeholder='Email'
                        name='email'
                        value={email}
                        onChange={e => onChange(e)}
                        disabled={loading}
                        required
                    />
                </div>
                <button 
                    className='btn btn-primary mt-3' 
                    type='submit'
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
};

export default connect(null, { reset_password })(ResetPassword);