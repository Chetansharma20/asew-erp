import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getItemById } from '../../../api/itemApi'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const ItemDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                setLoading(true)
                const response = await getItemById(id)
                if (response.success) {
                    setItem(response.data)
                } else {
                    toast.error(response.message || 'Failed to fetch item details')
                    navigate('/admin/items')
                }
            } catch (error) {
                console.error('Error fetching item details:', error)
                toast.error('Failed to load item details')
                navigate('/admin/items')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchItemDetails()
        }
    }, [id, navigate])

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if (!item) {
        return null
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors gap-2"
            >
                <ArrowLeft size={20} />
                <span>Back to Items</span>
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Item Image Banner */}
                {item.image && (
                    <div className="w-full bg-gray-50 flex justify-center border-b border-gray-100">
                        <img
                            src={`${API_BASE}${item.image}`}
                            alt={item.name}
                            className="max-h-72 object-contain p-4"
                        />
                    </div>
                )}

                <div className="p-8 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Base Price</div>
                            <div className="text-3xl font-bold text-blue-600">₹{item.basePrice}</div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-xl border border-gray-100">
                            {item.description}
                        </div>
                    </div>

                    {item.quantity && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Inventory Details</h3>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-gray-500">Available Quantity:</div>
                                <div className="font-semibold text-gray-900 text-lg">{item.quantity}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ItemDetails
