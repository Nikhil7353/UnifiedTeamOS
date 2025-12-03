import { useState } from 'react';
import { loginUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom'; // To redirect after login

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(formData);
      
      // 1. Save user to Browser Memory (LocalStorage)
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // 2. Go to Dashboard
      navigate('/dashboard'); 
    } catch (err) {
      setError('❌ Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="p-8 bg-white rounded-lg shadow-xl w-96">
        <h2 className="mb-6 text-2xl font-bold text-center text-slate-800">Login to TeamOS</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button type="submit" className="w-full p-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">
            Log In
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-500 font-medium">{error}</p>}
      </div>
    </div>
  );
}
