import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ logout, isAuthenticated }) => {
    const navigate = useNavigate();

    const logout_user = () => {
        logout();
        navigate('/');
    };

    const guestLinks = (
        <>
            <li className='nav-item'>
                <Link className='nav-link' to='/projects'>Projects</Link>
            </li>
            <li className='nav-item'>
                <Link className='nav-link' to='/login'>Login</Link>
            </li>
            
            <li className='nav-item'>
                <Link className='nav-link' to='/signup'>Sign Up</Link>
            </li>
        </>
    );

    const authLinks = (
        <>
            <li className='nav-item'>
                <Link className='nav-link' to='/projects'>Projects</Link>
            </li>
            <li className='nav-item'>
                <button 
                    className='nav-link btn btn-link' 
                    onClick={logout_user}
                >
                    Logout
                </button>
            </li>
        </>
    );

    return (
        <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
            <div className='container'>
                <Link className='navbar-brand' to='/'>CharityWeb</Link>
                <button 
                    className='navbar-toggler' 
                    type='button' 
                    data-bs-toggle='collapse' 
                    data-bs-target='#navbarNav' 
                    aria-controls='navbarNav' 
                    aria-expanded='false' 
                    aria-label='Toggle navigation'
                >
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className='collapse navbar-collapse' id='navbarNav'>
                    <ul className='navbar-nav me-auto'>
                        <li className='nav-item'>
                            <Link className='nav-link' to='/'>Home</Link>
                        </li>
                    </ul>
                    <ul className='navbar-nav'>

                        {/* Add Donate link here - available to all users */}
                        <li className='nav-item me-2'>
                            <Link 
                                to='/donate' 
                                className='nav-link donate-button'
                            >
                                DONATE
                                <FontAwesomeIcon icon={faDroplet} className="water-icon" />
                            </Link>
                        </li>
                        {isAuthenticated ? authLinks : guestLinks}
                    </ul>
                </div>
            </div>
        </nav>
    );
};
const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { logout })(Navbar);