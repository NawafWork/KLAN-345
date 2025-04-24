// src/containers/ProjectCreate.js
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../actions/projects';

const ProjectCreate = ({ createProject, isAuthenticated }) => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal_amount: '',
        start_date: '',
        end_date: '',
        location: '',
        latitude: '',
        longitude: '',
        image: null
    });
    
    const { 
        title, 
        description, 
        goal_amount, 
        start_date, 
        end_date, 
        location, 
        latitude, 
        longitude 
    } = formData;
    
    const [imagePreview, setImagePreview] = useState(null);
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
    }
    
    const onChange = e => {
        if (e.target.name === 'image') {
            const file = e.target.files[0];
            console.log('Selected file:', file); // Debug: log selected file
            
            setFormData({ ...formData, image: file });
            
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log('Image preview created'); // Debug: confirm preview creation
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };
    
    const onSubmit = e => {
        e.preventDefault();
        
        const projectData = new FormData();

            // Debug logging
        console.log('Form Data before submission:', formData);
        console.log('Image file:', formData.image);

        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                projectData.append(key, formData[key]);
                // Debug: log each field being added to FormData
                console.log(`Adding to FormData - ${key}:`, formData[key]);
            }
        });
        
        // Debug: inspect the FormData contents
        for (let pair of projectData.entries()) {
            console.log('FormData entry:', pair[0], pair[1]);
        }

        createProject(projectData, navigate);
    };
    
    return (
        <div className="container mt-5">
            <h1>Create New Charity Project</h1>
            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <label className="form-label">Project Title</label>
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={title}
                        onChange={onChange}
                        required
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={description}
                        onChange={onChange}
                        rows="5"
                        required
                    ></textarea>
                </div>
                
                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label">Goal Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            name="goal_amount"
                            value={goal_amount}
                            onChange={onChange}
                            required
                        />
                    </div>
                </div>
                
                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            name="start_date"
                            value={start_date}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            name="end_date"
                            value={end_date}
                            onChange={onChange}
                            required
                        />
                    </div>
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={location}
                        onChange={onChange}
                    />
                </div>
                
                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label">Latitude (optional)</label>
                        <input
                            type="number"
                            step="any"
                            className="form-control"
                            name="latitude"
                            value={latitude}
                            onChange={onChange}
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">Longitude (optional)</label>
                        <input
                            type="number"
                            step="any"
                            className="form-control"
                            name="longitude"
                            value={longitude}
                            onChange={onChange}
                        />
                    </div>
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Project Image</label>
                    <input
                        type="file"
                        className="form-control"
                        name="image"
                        onChange={onChange}
                        accept="image/*"
                    />
                </div>
                
                {imagePreview && (
                    <div className="mb-3">
                        <label className="form-label">Image Preview</label>
                        <div>
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                style={{ maxHeight: '200px' }} 
                                className="img-thumbnail"
                            />
                        </div>
                    </div>
                )}
                
                <button type="submit" className="btn btn-primary">Create Project</button>
            </form>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { createProject })(ProjectCreate);