import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from './api';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {success ? (
        <p>Password reset successfully! You can now login with your new password.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Reset Password</h2>
          {error && <p className="error">{error}</p>}
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default PasswordResetPage;