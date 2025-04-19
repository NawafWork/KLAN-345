import React from 'react';
import { useSearchParams } from 'react-router-dom';

const Donate = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('project');

    return (
        <div className="container mt-5">
            <h1>Donate</h1>
            {projectId && (
                <p>Donation for Project ID: {projectId}</p>
            )}
            <div className="alert alert-info">
                Donation functionality coming soon!
            </div>
        </div>
    );
};

export default Donate;