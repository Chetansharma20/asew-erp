import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAllItems, createItem, updateItem, deleteItem, getItemById } from '../../../api/itemApi'
import { toast } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const ItemsManager = () => {
    const location = useLocation()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewItem, setViewItem] = useState(null)
    const [viewLoading, setViewLoading] = useState(false)
    const [currentItem, setCurrentItem] = useState(null) // null for add, object for edit

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: '',
        price: '',
        basePrice: '',
        isActive: true
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await getAllItems()
            if (response.success) {
                setItems(response.data.items)
            } else {
                toast.error(response.message || 'Failed to fetch items')
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast.error('Failed to load items')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentItem(item)
            setFormData(item)
            setImagePreview(item.image ? `${API_BASE}${item.image}` : null)
        } else {
            setCurrentItem(null)
            setFormData({ name: '', description: '', quantity: '', price: '', basePrice: '', isActive: true })
            setImagePreview(null)
        }
        setImageFile(null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setCurrentItem(null)
        setImageFile(null)
        setImagePreview(null)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let response
            const payload = { ...formData }
            if (imageFile) {
                payload.imageFile = imageFile
            }

            if (currentItem) {
                response = await updateItem(currentItem._id, payload)
            } else {
                response = await createItem(payload)
            }

            if (response.success) {
                toast.success(currentItem ? 'Item updated successfully' : 'Item created successfully')
                fetchItems()
                handleCloseModal()
            } else {
                toast.error(response.message || 'Operation failed')
            }
        } catch (error) {
            console.error('Error saving item:', error)
            toast.error(error.response?.data?.message || 'Failed to save item')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await deleteItem(id)
                if (response.success) {
                    toast.success('Item deleted successfully')
                    fetchItems()
                } else {
                    toast.error(response.message || 'Failed to delete item')
                }
            } catch (error) {
                console.error('Error deleting item:', error)
                toast.error(error.response?.data?.message || 'Failed to delete item')
            }
        }
    }


    const handleViewDetails = async (id) => {
        setIsViewModalOpen(true)
        setViewLoading(true)
        try {
            const response = await getItemById(id)
            if (response.success) {
                setViewItem(response.data)
            } else {
                toast.error(response.message || 'Failed to fetch item details')
                setIsViewModalOpen(false)
            }
        } catch (error) {
            console.error('Error fetching item details:', error)
            toast.error('Failed to load item details')
            setIsViewModalOpen(false)
        } finally {
            setViewLoading(false)
        }
    }

    const closeViewModal = () => {
        setIsViewModalOpen(false)
        setViewItem(null)
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Items Management</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>+</span> Add Item
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Price (₹)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {item.image ? (
                                                <img
                                                    src={`${API_BASE}${item.image}`}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <Link
                                                to={`${location.pathname}/${item._id}`}
                                                className="text-gray-900 hover:text-gray-600 transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <Link to={`${location.pathname}/${item._id}`} className="hover:text-gray-700 block">
                                                {item.description?.length > 50
                                                    ? `${item.description.substring(0, 50)}...`
                                                    : item.description}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">₹{item.basePrice}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No items found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {currentItem ? 'Edit Item' : 'Add New Item'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                                {imagePreview ? (
                                    <div className="relative group w-full">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-500">Click to upload image</span>
                                        <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP (max 5MB)</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows="2"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Reference)</label>
                                <input
                                    type="number"
                                    name="basePrice"
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.basePrice}
                                    onChange={handleInputChange}
                                    placeholder="₹"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Active Status
                                </label>
                            </div>
                            <div className="flex gap-3 mt-6 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    {currentItem ? 'Save Changes' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {isViewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">
                            Product Details
                        </h3>

                        {viewLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : viewItem ? (
                            <div className="space-y-4">
                                {/* Item Image */}
                                {viewItem.image && (
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src={`${API_BASE}${viewItem.image}`}
                                            alt={viewItem.name}
                                            className="max-w-full h-48 object-cover rounded-xl border border-gray-200"
                                        />
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-gray-500 font-medium">Name:</div>
                                    <div className="col-span-2 text-gray-900 font-medium">{viewItem.name}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-gray-500 font-medium">Description:</div>
                                    <div className="col-span-2 text-gray-700 whitespace-pre-wrap">{viewItem.description}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-gray-500 font-medium">Base Price:</div>
                                    <div className="col-span-2 text-gray-900">₹{viewItem.basePrice}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-gray-500 font-medium">Status:</div>
                                    <div className="col-span-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${viewItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {viewItem.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                {viewItem.quantity && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-gray-500 font-medium">Quantity:</div>
                                        <div className="col-span-2 text-gray-900">{viewItem.quantity}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">Item not found</div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={closeViewModal}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemsManager
