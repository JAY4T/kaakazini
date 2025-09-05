// TermsConditionsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsConditionPage = () => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleCheckbox = () => setAccepted(!accepted);

  const handleAccept = () => {
    if (accepted) {
      // ✅ Redirect to HireSignup page
      navigate('/HireSignup');
    } else {
      alert('You must accept the Terms & Conditions to continue.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Terms and Conditions</h2>
      <div className="card p-4 mb-3" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
        <p>
          Welcome to Kaakazini! By using our services, you agree to the following terms...
        </p>
        <p>
          {/* 1. You consent to the use of your information for service purposes.<br/> */}
          2. Payment must be completed before job execution.<br/>
          3. You accept responsibility for providing accurate details.<br/>
          4. Kaakazini is not liable for damages caused by third-party contractors.<br/>
          5. All disputes will be handled according to local law.
        </p>
        <p>
          Please read all terms carefully before proceeding.
        </p>
      </div>
      <div className="form-check mb-3">
        <input 
          type="checkbox" 
          className="form-check-input" 
          id="acceptTerms" 
          checked={accepted} 
          onChange={handleCheckbox} 
        />
        <label className="form-check-label" htmlFor="acceptTerms">
          I have read and accept the Terms & Conditions
        </label>
      </div>
      <button className="btn btn-primary" onClick={handleAccept}>
        Continue
      </button>
    </div>
  );
};

export default TermsConditionPage;
