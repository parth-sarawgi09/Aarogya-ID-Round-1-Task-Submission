import { useState } from 'react'
import axios from 'axios'
import useStore from '../store/useStore'

const CONDITIONS = ["diabetes", "hypertension", "asthma", "cardiac", "none"]

export default function ProfileForm({ onComplete }) {
  const setUserProfile = useStore(state => state.setUserProfile)
  const setSessionId = useStore(state => state.setSessionId)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    lifestyle: 'sedentary',
    pre_existing_conditions: [],
    income_band: 'under 3L',
    city_tier: 'metro'
  })

  const handleConditionChange = (condition) => {
    if (condition === 'none') {
      setFormData({ ...formData, pre_existing_conditions: ['none'] })
      return
    }
    
    let updated = formData.pre_existing_conditions.filter(c => c !== 'none')
    if (updated.includes(condition)) {
      updated = updated.filter(c => c !== condition)
    } else {
      updated.push(condition)
    }
    setFormData({ ...formData, pre_existing_conditions: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        user_profile: {
          ...formData,
          age: parseInt(formData.age)
        }
      }
      const response = await axios.post('http://localhost:8000/api/sessions', payload)
      setSessionId(response.data.session_id)
      setUserProfile(payload.user_profile)
      onComplete()
    } catch (error) {
      console.error("Error creating session", error)
      alert("Failed to start session. Ensure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input type="number" required min="18" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lifestyle</label>
            <select value={formData.lifestyle} onChange={e => setFormData({...formData, lifestyle: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 p-2">
              <option value="sedentary">Sedentary</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="athlete">Athlete</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City Tier</label>
            <select value={formData.city_tier} onChange={e => setFormData({...formData, city_tier: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 p-2">
              <option value="metro">Metro</option>
              <option value="tier-2">Tier-2</option>
              <option value="tier-3">Tier-3</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Income Band</label>
          <select value={formData.income_band} onChange={e => setFormData({...formData, income_band: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 p-2">
            <option value="under 3L">Under 3L</option>
            <option value="3-8L">3-8L</option>
            <option value="8-15L">8-15L</option>
            <option value="15L+">15L+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pre-existing Conditions</label>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(cond => (
              <label key={cond} className="inline-flex items-center space-x-2 bg-gray-50 p-2 rounded-md border cursor-pointer hover:bg-gray-100">
                <input 
                  type="checkbox" 
                  checked={formData.pre_existing_conditions.includes(cond)}
                  onChange={() => handleConditionChange(cond)}
                  className="rounded text-brand-600 focus:ring-brand-500" 
                />
                <span className="text-sm capitalize">{cond}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || formData.pre_existing_conditions.length === 0}
          className="w-full bg-brand-600 text-white py-3 px-4 rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 font-medium mt-6 transition-colors"
        >
          {loading ? 'Initializing Agent...' : 'Find My Perfect Policy'}
        </button>
      </form>
    </div>
  )
}
