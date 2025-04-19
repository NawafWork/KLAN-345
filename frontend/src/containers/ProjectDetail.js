// src/containers/ProjectDetail.js
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProject, deleteProject } from '../actions/projects';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';

const ProjectDetail = ({ 
    getProject, 
    deleteProject, 
    projects: { project, loading },
    auth: { isAuthenticated, user } 
}) => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getProject(id);
    }, [getProject, id]);

    if (loading || project === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-8">
                    {project.image && (
                        <img 
                            src={project.image} 
                            alt={project.title} 
                            className="img-fluid mb-4"
                            style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                        />
                    )}
                    <h1>{project.title}</h1>
                    <p className="lead">{project.description}</p>
                    
                    <div className="my-4">
                        <h5>Project Details</h5>
                        <p><strong>Location:</strong> {project.location}</p>
                        <p><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString()}</p>
                        <p><strong>Created By:</strong> {project.created_by.first_name} {project.created_by.last_name}</p>
                    </div>
                    
                    {isAuthenticated && user && project.created_by && user.id === project.created_by.id && (
                        <div className="mb-4">
                            <Link to={`/projects/edit/${project.id}`} className="btn btn-primary me-2">
                                Edit Project
                            </Link>
                            <button 
                                onClick={() => deleteProject(project.id, navigate)}
                                className="btn btn-danger"
                            >
                                Delete Project
                            </button>
                        </div>
                    )}
                    
                    <Link to="/projects" className="btn btn-secondary">
                        Back to Projects
                    </Link>
                </div>
                
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Funding Progress</h5>
                            <h2>${project.amount_raised} <small className="text-muted">of ${project.goal_amount}</small></h2>
                            <div className="progress mb-3">
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                        width: `${Math.min(
                                            (project.amount_raised / project.goal_amount) * 100,
                                            100
                                        )}%`
                                    }}
                                >
                                    {Math.round((project.amount_raised / project.goal_amount) * 100)}%
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/donate?project=${project.id}`)} 
                                className="btn donate-button w-100"
                            >
                                <span>Donate Now</span>
                                <FontAwesomeIcon icon={faDroplet} className="water-icon" />
                            </button>
                        </div>
                    </div>
                    
                    {project.latitude && project.longitude && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Project Location</h5>
                                <div style={{ height: '200px', backgroundColor: '#eee' }}>
                                    {/* Map component would go here */}
                                    <p className="text-center pt-5">Map Placeholder</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    projects: state.projects,
    auth: state.auth
});

export default connect(mapStateToProps, { getProject, deleteProject })(ProjectDetail);