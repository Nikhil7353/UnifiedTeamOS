import { useState } from 'react';
import { registerUser } from '../../services/authService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setMessage('✅ Success! User created in Database.');
    } catch (error) {
      setMessage('❌ Error: Could not create user.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="p-8 bg-white rounded-lg shadow-xl w-96">
        <h2 className="mb-6 text-2xl font-bold text-center text-slate-800">Join TeamOS</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button type="submit" className="w-full p-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">
            Create Account
          </button>
        </form>

        {message && <p className="mt-4 text-center font-medium">{message}</p>}
      </div>
    </div>
  );
}