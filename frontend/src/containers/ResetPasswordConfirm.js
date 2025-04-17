import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password_confirm } from '../actions/auth';

const ResetPasswordConfirm = ({ reset_password_confirm }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        new_password: '',
        re_new_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { uid, token } = useParams();
    const { new_password, re_new_password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (new_password !== re_new_password) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await reset_password_confirm(uid, token, new_password, re_new_password);
            setRequestSent(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    if (requestSent) {
        return <Navigate to='/login' />;
    }

    return (
        <div className='container mt-5'>
            <h1>Reset Password</h1>
            <p>Enter your new password</p>
            {error && (
                <div className='alert alert-danger' role='alert'>
                    {error}
                </div>
            )}
            <form onSubmit={e => onSubmit(e)}>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='New Password'
                        name='new_password'
                        value={new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        disabled={loading}
                        required
                    />
                </div>
                <div className='form-group mt-3'>
                    <input
                        className='form-control'
                        type='password'
                        placeholder='Confirm New Password'
                        name='re_new_password'
                        value={re_new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        disabled={loading}
                        required
                    />
                </div>
                <button 
                    className='btn btn-primary mt-3' 
                    type='submit'
                    disabled={loading}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default connect(null, { reset_password_confirm })(ResetPasswordConfirm);