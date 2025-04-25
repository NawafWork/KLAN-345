import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { verify } from '../actions/auth';

const Activate = ({ verify }) => {
    const [verified, setVerified] = useState(false);
    const { uid, token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const activateAccount = async () => {
            try {
                await verify(uid, token);
                setVerified(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                navigate('/login');
            }
        };

        activateAccount();
    }, [verify, uid, token, navigate]);

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-center align-items-center">
                <div className="card">
                    <div className="card-body text-center">
                        {verified ? (
                            <>
                                <h1>Account Verified Successfully!</h1>
                                <p>Redirecting to login page...</p>
                            </>
                        ) : (
                            <h1>Verifying your account...</h1>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default connect(null, { verify })(Activate);