import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserDonations } from '../actions/donations';
import { getUserProjects } from '../actions/projects';
import '../styles/UserProfile.css';

const UserProfile = ({ 
    auth: { user }, 
    donations, 
    projects,
    getUserDonations,
    getUserProjects 
}) => {
    useEffect(() => {
        if (user) {
            getUserDonations(user.id);
            getUserProjects(user.id);
        }
    }, [user, getUserDonations, getUserProjects]);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>User Profile</h1>
                <div className="user-info">
                    <p><strong>First Name: </strong>{user?.first_name}</p>
                    <p><strong>Last Name: </strong>{user?.last_name}</p>
                    <p><strong>Email: </strong>{user?.email}</p>
                </div>
            </div>

            <div className="profile-content">
                <div className="donations-section">
                    <h3>Donation History</h3>
                    <div className="donations-list">
                        {donations?.map(donation => (
                            <div key={donation.id} className="donation-card">
                                <div className="donation-info">
                                    <h4>{donation.project.title}</h4>
                                    <p className="amount">${donation.amount}</p>
                                    <p className="date">{new Date(donation.date).toLocaleDateString()}</p>
                                </div>
                                <Link to={`/projects/${donation.project.id}`} className="view-project">
                                    View Project
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="projects-section">
                    <h3>My Projects</h3>
                    <div className="projects-list">
                        {projects?.map(project => (
                            <div key={project.id} className="project-card">
                                <h4>{project.title}</h4>
                                <div className="project-stats">
                                    <p>Goal: ${project.goal_amount}</p>
                                    <p>Raised: ${project.amount_raised}</p>
                                </div>
                                <Link to={`/projects/${project.id}`} className="view-project">
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    auth: state.auth,
    donations: state.donations.donations,
    projects: state.projects.userProjects
});

export default connect(mapStateToProps, { getUserDonations, getUserProjects })(UserProfile);