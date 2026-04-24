import { useState, useEffect } from 'react'
import axios from 'axios'
import { Trash2, Upload, FileText } from 'lucide-react'

export default function AdminPanel() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({
    name: '', insurer: '', premium: '', coverage_amount: '', waiting_period_months: '', copay_percentage: ''
  })

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/policies')
      setPolicies(res.data)
    } catch (error) {
      console.error("Failed to fetch policies", error)
    }
  }

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This will delete the document from Vector DB and MongoDB.")) return
    try {
      await axios.delete(`http://localhost:8000/api/admin/policies/${id}`)
      fetchPolicies()
    } catch (error) {
      console.error("Failed to delete", error)
      alert("Delete failed")
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if(!file) return alert("Please select a PDF file")
    
    setLoading(true)
    const data = new FormData()
    data.append('file', file)
    Object.keys(formData).forEach(key => data.append(key, formData[key]))

    try {
      await axios.post('http://localhost:8000/api/admin/policies', data)
      alert("Uploaded and processed successfully!")
      setFormData({name: '', insurer: '', premium: '', coverage_amount: '', waiting_period_months: '', copay_percentage: ''})
      setFile(null)
      fetchPolicies()
    } catch (error) {
      console.error("Upload failed", error)
      alert("Upload failed. Check console.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Upload size={20}/> Upload New Policy PDF</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Policy Name" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="p-2 border rounded" />
          <input type="text" placeholder="Insurer Name" required value={formData.insurer} onChange={e=>setFormData({...formData, insurer: e.target.value})} className="p-2 border rounded" />
          <input type="number" placeholder="Premium (Rs/year)" required value={formData.premium} onChange={e=>setFormData({...formData, premium: e.target.value})} className="p-2 border rounded" />
          <input type="number" placeholder="Coverage Amount (Rs)" required value={formData.coverage_amount} onChange={e=>setFormData({...formData, coverage_amount: e.target.value})} className="p-2 border rounded" />
          <input type="number" placeholder="Waiting Period (Months)" required value={formData.waiting_period_months} onChange={e=>setFormData({...formData, waiting_period_months: e.target.value})} className="p-2 border rounded" />
          <input type="number" placeholder="Co-pay Percentage" required value={formData.copay_percentage} onChange={e=>setFormData({...formData, copay_percentage: e.target.value})} className="p-2 border rounded" />
          
          <input type="file" accept=".pdf" required onChange={e=>setFile(e.target.files[0])} className="col-span-2 p-2 border rounded" />
          
          <button disabled={loading} type="submit" className="col-span-2 bg-brand-600 text-white p-3 rounded font-medium hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Processing Document and Embedding...' : 'Upload & Process'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText size={20}/> Active Policies in Database</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Policy Name</th>
                <th className="p-3">Insurer</th>
                <th className="p-3">Premium</th>
                <th className="p-3">Coverage</th>
                <th className="p-3">Chunks</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.policy_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.insurer}</td>
                  <td className="p-3">₹{p.premium}</td>
                  <td className="p-3">₹{p.coverage_amount}</td>
                  <td className="p-3">{p.chunks_count || 0}</td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(p.policy_id)} className="text-red-600 hover:text-red-800 p-2">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {policies.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No policies found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
