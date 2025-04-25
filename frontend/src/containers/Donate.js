import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { getProjects } from '../actions/projects';
import axiosInstance from '../utils/axiosConfig'; 
import '../styles/Donate.css';

const Donate = ({ getProjects, projects: { projects, loading }, isAuthenticated }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialProjectId = searchParams.get('project');
    
    const [step, setStep] = useState('amount'); // 'amount' or 'payment'
    const [formData, setFormData] = useState({
        amount: '',
        projectId: initialProjectId || '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        saveCard: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const presetAmounts = [50, 100, 150, 200];

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
        getProjects();
    }, [isAuthenticated, getProjects, navigate]);

    const handleAmountSelect = (amount) => {
        setFormData({ ...formData, amount: amount.toString() });
    };

    const handleCustomAmount = (e) => {
        setFormData({ ...formData, amount: e.target.value });
    };

    const handleNext = () => {
        if (!formData.amount) {
            setError('Please select or enter an amount');
            return;
        }
        setError('');
        setStep('payment');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || !formData.projectId) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!validateCard(formData)) {
            setError('Please enter valid card details');
            return;
        }

        setSuccess('Processing payment...');
        
        try {
            await axiosInstance.post('/api/charities/donations/', {
                amount: formData.amount,
                project: formData.projectId
            });

            setSuccess('Donation successful! Thank you for your contribution.');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                navigate(`/projects/${formData.projectId}`);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };


       // Add card validation helper
    const validateCard = (card) => {
        const cardNumber = card.cardNumber.replace(/\s/g, '');
        const expiry = card.expiryDate.split('/');
        
        return (
            cardNumber.length === 16 &&
            /^\d+$/.test(cardNumber) &&
            card.cardName.length > 0 &&
            expiry.length === 2 &&
            card.cvv.length === 3
        );
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card donation-card">
                        <div className="card-body">
                            {step === 'amount' ? (
                                <>
                                    <h2 className="card-title text-center mb-4">Choose an amount to give</h2>
                                    <div className="amount-grid">
                                        {presetAmounts.map((amount) => (
                                            <button
                                                key={amount}
                                                className={`amount-button ${formData.amount === amount.toString() ? 'active' : ''}`}
                                                onClick={() => handleAmountSelect(amount)}
                                            >
                                                ${amount}
                                            </button>
                                        ))}
                                        <div className="custom-amount">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Custom amount"
                                                value={formData.amount}
                                                onChange={handleCustomAmount}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                                    <button 
                                        className="btn btn-primary w-100 mt-4"
                                        onClick={handleNext}
                                    >
                                        Continue to Payment
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h2 className="card-title text-center mb-4">Enter Payment Details</h2>
                                    <div className="mb-3">
                                        <label className="form-label">Card Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.cardNumber}
                                            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="16"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Name on Card</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.cardName}
                                            onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col">
                                            <label className="form-label">Expiry Date</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.expiryDate}
                                                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                required
                                            />
                                        </div>
                                        <div className="col">
                                            <label className="form-label">CVV</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.cvv}
                                                onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                                                maxLength="3"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="saveCard"
                                            checked={formData.saveCard}
                                            onChange={(e) => setFormData({...formData, saveCard: e.target.checked})}
                                        />
                                        <label className="form-check-label" htmlFor="saveCard">
                                            Save card for future use
                                        </label>
                                    </div>
                                    {success && <div className="alert alert-success">{success}</div>}
                                    <button type="submit" className="btn btn-primary w-100">
                                        Donate ${formData.amount}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-link w-100"
                                        onClick={() => setStep('amount')}
                                    >
                                        Back to amount selection
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    projects: state.projects
});

export default connect(mapStateToProps, { getProjects })(Donate);