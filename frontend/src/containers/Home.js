import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import charityImage from '../images/charity.jpg';

const Home = () => {
    return (
        <div className="home-container">
            <div className="overlay">
                <div className="content">
                    <div className="quote-section">
                        <blockquote>
                            "Giving does not only precede receiving; it is the reason for it. 
                            It is in giving that we receive."
                        </blockquote>
                        <cite>— Israelmore Ayivor</cite>
                    </div>
                    
                    <div className="image-section">
                        <img 
                            src={charityImage} 
                            alt="Helping Hands" 
                            className="charity-image"
                        />
                    </div>

                    <div className="cta-section">
                        <Link 
                            className="btn donate-button" 
                            to="/donate" 
                            role="button"
                        >
                            Donation now!
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;