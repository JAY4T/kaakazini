import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://staging.kaakazini.com/api';

const HireSignup = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    subscription: 'free',
    role: 'client',
    agree: false,
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) {
      setMessage({ text: 'You must agree to the terms.', type: 'danger' });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/client-signup/`, {
  full_name: form.full_name,
  email: form.email,
  phone_number: form.phone_number,
  password: form.password,
});


      setMessage({ text: 'Signup successful! Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/HireLogin'), 1500);
    } catch (error) {
      setMessage({ text: 'Signup failed. ' + (error.response?.data?.error || 'Check your input.'), type: 'danger' });
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h3 className="text-center">Client Sign Up</h3>
            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
            <form onSubmit={handleSubmit}>
              <input id="full_name" type="text" placeholder="Full Name" className="form-control mb-3" value={form.full_name} onChange={handleChange} required />
              <input id="email" type="email" placeholder="Email" className="form-control mb-3" value={form.email} onChange={handleChange} required />
              <input id="phone_number" type="tel" placeholder="Phone Number" className="form-control mb-3" value={form.phone_number} onChange={handleChange} required />
              <input id="password" type="password" placeholder="Password" className="form-control mb-3" value={form.password} onChange={handleChange} required />
              <div className="form-check mb-3">
                <input id="agree" type="checkbox" className="form-check-input" checked={form.agree} onChange={handleChange} />
                <label className="form-check-label" htmlFor="agree">
                  I agree to the <Link to="/terms">terms and conditions</Link>
                </label>
              </div>
              <button className="btn btn-primary w-100" type="submit">Sign Up</button>
            </form>
            <p className="mt-3 text-center">Already have an account? <Link to="/HireLogin">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireSignup;
