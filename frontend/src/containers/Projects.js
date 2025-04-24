import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProjects } from '../actions/projects';
import ProjectsMap from './ProjectsMap';
import '../styles/Projects.css'; // Import your CSS file

const Projects = ({ getProjects, projects: { projects, loading }, isAuthenticated }) => {

    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        getProjects();
    }, [getProjects]);

    useEffect(() => {
        console.log('Projects updated:', projects);
    }, [projects]); // This will log whenever projects change

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Charity Projects</h1>
                <div className="d-flex gap-2">
                    <div className="btn-group me-2" role="group">
                        <button 
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('list')}
                        >
                            List View
                        </button>
                        <button 
                            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('map')}
                        >
                            Map View
                        </button>
                    </div>
                    {isAuthenticated && (
                        <Link to="/projects/create" className="btn btn-primary">
                            Create New Project
                        </Link>
                    )}
                </div>
            </div>

            {viewMode === 'map' ? (
                <div className="map-wrapper" style={{ height: '600px', width: '100%' }}>
                    <ProjectsMap projects={projects} />
                </div>
            ) : (
                <div className="row">
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <div className="col-md-4 mb-4" key={project.id}>
                                <div className="card h-100">
                                    {project.image && (
                                        <img 
                                            src={project.image} 
                                            className="card-img-top" 
                                            alt={project.title}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{project.title}</h5>
                                        <p className="card-text">
                                            {project.description.length > 100
                                                ? `${project.description.substring(0, 100)}...`
                                                : project.description}
                                        </p>
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
                                                aria-valuenow={(project.amount_raised / project.goal_amount) * 100}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                {Math.round((project.amount_raised / project.goal_amount) * 100)}%
                                            </div>
                                        </div>
                                        <p>
                                            ${project.amount_raised} raised of ${project.goal_amount} goal
                                        </p>
                                    </div>
                                    <div className="card-footer">
                                        <Link to={`/projects/${project.id}`} className="btn btn-info btn-sm">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <p>No projects found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const mapStateToProps = state => ({
    projects: state.projects,
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { getProjects })(Projects);