import { useState, useEffect } from 'react';
import Spinner from '../../components/Spinner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const CustomDemandList = () => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDemands = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/custom-demands`);
      const data = await res.json();
      if (data.success) {
        setDemands(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch demands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/custom-demands/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDemands();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this demand?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/custom-demands/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDemands();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Custom Protein Bar Demands</h1>
        <p className="text-gray-500">View and managed custom requests from users.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Build Details</th>
              <th className="px-6 py-4">Goal</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {demands.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{item.userName}</div>
                  <div className="text-xs text-gray-500">{item.phone}</div>
                  <div className="text-xs text-gray-500">{item.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <span className="font-bold">Base:</span> {item.baseMillet} | <span className="font-bold">Protein:</span> {item.proteinType}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Sweetener:</span> {item.sweetener}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {item.addIns?.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase">
                    {item.goal}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className={`text-[10px] font-bold uppercase rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-1 ${
                      item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'Contacted' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-900 font-bold text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {demands.length === 0 && (
          <div className="p-12 text-center text-gray-400">No custom demands found.</div>
        )}
      </div>
    </div>
  );
};

export default CustomDemandList;
