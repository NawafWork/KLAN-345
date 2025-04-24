import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, updateProject } from '../actions/projects';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const ProjectEdit = ({ 
    getProject, 
    updateProject, 
    isAuthenticated, 
    projects: { project, loading } 
}) => {
    const navigate = useNavigate();
    const { id } = useParams();
    
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
    
    
    const [imagePreview, setImagePreview] = useState(null);
    
    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);
    
    useEffect(() => {
        getProject(id);
    }, [getProject, id]);
    
    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || '',
                description: project.description || '',
                goal_amount: project.goal_amount || '',
                start_date: project.start_date || '',
                end_date: project.end_date || '',
                location: project.location || '',
                latitude: project.latitude || '',
                longitude: project.longitude || '',
                image: null
            });
            if (project.image) {
                setImagePreview(project.image);
            }
        }
    }, [project]);
    
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
    
    const onChange = e => {
        if (e.target.name === 'image') {
            const file = e.target.files[0];

            if (!file) {
                console.log('No file selected');
                return;
            }
            
            // Validate file type
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                alert('Please upload a valid image file (JPEG, PNG, or GIF)');
                e.target.value = ''; // Clear the input
                return;
            }
            
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                alert('File is too large. Maximum size is 5MB');
                e.target.value = ''; // Clear the input
                return;
            }
    
            console.log('Valid image file selected:', file);
            setFormData({ ...formData, image: file });
            
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };
    
    const onSubmit = async (e) => {
        e.preventDefault();
        
        const projectData = new FormData();

        // Debug logging
        console.log('Form Data before submission:', formData);
        console.log('Current image file:', formData.image);

        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && 
                formData[key] !== undefined && 
                (formData[key] !== '' || typeof formData[key] === 'number')) {
                
                // Special handling for image
                if (key === 'image') {
                    if (formData[key] instanceof File) {
                        console.log('Adding image file to FormData:', formData[key]);
                        projectData.append(key, formData[key]);
                    }
                } else {
                    console.log(`Adding ${key} to FormData:`, formData[key]);
                    projectData.append(key, formData[key]);
                }
            }
        });

        // Debug: inspect the FormData contents
        for (let pair of projectData.entries()) {
            console.log('FormData entry:', pair[0], pair[1]);
        }

        try {
            await updateProject(id, projectData, navigate);
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project. Please try again.');
        }
    };
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="container mt-5">
            <h1>Edit Charity Project</h1>
            <form onSubmit={onSubmit} encType="multipart/form-data">
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
                        onChange={(e) => {
                            console.log('File input change event:', e.target.files[0]);
                            onChange(e);
                        }}
                        accept="image/*"
                        
                    />
                    {formData.image && (
                        <small className="text-muted">
                            Selected file: {formData.image.name}
                        </small>
                    )}
                </div>
                
                {imagePreview && (
                    <div className="mb-3">
                        <label className="form-label">Current Image</label>
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
                
                <button type="submit" className="btn btn-primary">Update Project</button>
            </form>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    projects: state.projects
});

export default connect(mapStateToProps, { getProject, updateProject })(ProjectEdit);