// import React from 'react';
// import emailjs from '@emailjs/browser';
// import 'bootstrap/dist/css/bootstrap.min.css';

// function ForgotPassword({ email, setEmail, backToLogin }) {
//   const handleForgotPassword = (e) => {
//     e.preventDefault();

//     const resetPasswordLink = `https://yourwebsite.com/reset-password?email=${encodeURIComponent(email)}`;

//     const templateParams = {
//       user_email: email,
//       reset_link: resetPasswordLink,
//     };

//     emailjs
//       .send(
//         process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_zpy2zgi',
//         process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_k8lm489',
//         templateParams,
//         process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '0uWDtjAcTEivfd7UT'
//       )
//       .then((response) => {
//         console.log('SUCCESS!', response.status, response.text);
//         alert('Password reset instructions sent to your email.');
//         setEmail('');
//         backToLogin();
//       })
//       .catch((err) => {
//         console.error('FAILED...', err);
//         alert('Something went wrong. Please try again.');
//       });
//   };

//   return (
//     <div
//       className="container-fluid"
//       style={{
//         minHeight: '100vh',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         background: 'linear-gradient(135deg, #e0eafc, #cfdef3)',
//         padding: '20px',
//       }}
//     >
//       <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
//         <div className="card shadow border-0 rounded-4">
//           <div className="card-body p-5">
//             <h3 className="text-center fw-bold text-primary mb-3">
//               Forgot Password
//             </h3>
//             <p className="text-center text-muted mb-4">
//               Enter your email address and we'll send you a link to reset your password.
//             </p>

//             <form onSubmit={handleForgotPassword}>
//               <div className="form-group mb-3">
//                 <label htmlFor="email" className="form-label fw-semibold">
//                   Email Address
//                 </label>
//                 <input
//                   id="email"
//                   type="email"
//                   className="form-control form-control-lg rounded-3 shadow-sm"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="d-grid mt-4">
//                 <button
//                   type="submit"
//                   className="btn btn-primary btn-lg rounded-pill"
//                 >
//                   Send Reset Link
//                 </button>
//               </div>

//               <div className="text-center mt-4">
//                 <button
//                   type="button"
//                   className="btn btn-link text-decoration-none text-primary fw-medium"
//                   onClick={backToLogin}
//                 >
//                   ← Back to Login
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // export default ForgotPassword;
