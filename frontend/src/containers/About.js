import React from 'react';
import '../styles/About.css';

import executiveTeam1 from '../images/executiveimage1.jpg';
import executiveTeam2 from '../images/executiveimage3.jpeg';
import executiveTeam3 from '../images/executiveimage2.jpeg';
import executiveTeam4 from '../images/executiveimage.png';

const About = () => {
    const teamMembers = [
        {
            name: "Hengkim Seng",
            role: "CEO",
            image: executiveTeam1
        },
        {
            name: "Thanh An Lu",
            role: "CEO",
            image: executiveTeam2
        },
        {
            name: "Alan Serfaty",
            role: "CEO",
            image: executiveTeam3
        },
        {
            name: "Nawaf Alshahrani",
            role: "CEO",
            image: executiveTeam4
        }
    ];
    return (
        <div className="about-container">
            <div className="about-header">
                <h1>About Us</h1>
            </div>
            <div className="about-content">
                <section className="mission-section">
                    <h2>Our Mission</h2>
                    <p>
                    At Water Charity, our mission is to bring clean, safe, and sustainable water to communities in need.
                    We believe that access to clean water is a basic human right — one that empowers health, education, and economic opportunity.
                    Through local partnerships, innovative solutions, and the power of community, we are committed to creating lasting change, one drop at a time.
                    </p>
                </section>

                <section className="impact-section">
                    <h2>Our Impact</h2>
                    <div className="impact-stats">
                        <div className="stat-item">
                            <h3>Communities Served</h3>
                            <p className="stat-number">100+</p>
                        </div>
                        <div className="stat-item">
                            <h3>Projects Completed</h3>
                            <p className="stat-number">50+</p>
                        </div>
                        <div className="stat-item">
                            <h3>Lives Impacted</h3>
                            <p className="stat-number">10,000+</p>
                        </div>
                    </div>
                </section>

                <section className="team-section">
                    <h2>Our Team</h2>
                    <p className="team-intro">
                        We are a dedicated team of professionals committed to making clean water accessible 
                        to everyone. Our platform connects donors directly with water projects, ensuring 
                        transparency and maximizing impact.
                    </p>
                    
                    <div className="executive-team">
                        <h3 className="team-title">The Executive Team</h3>
                        <div className="team-grid">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="team-member">
                                    <div className="member-photo-wrapper">
                                        <img 
                                            src={member.image} 
                                            alt={member.name} 
                                            className="member-photo"
                                        />
                                    </div>
                                    <div className="member-info">
                                        <h4 className="member-role">{member.role}</h4>
                                        <h3 className="member-name">{member.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="contact-section">
                    <h2>Contact Us</h2>
                    <p>
                        Have questions about our mission or how you can help? 
                        Reach out to us at: <a href="mailto:contact@watercharity.org">contact@watercharity.org</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;