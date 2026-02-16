import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../auth/Login'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import SubAdminLayout from '../layouts/SubAdminLayout'
import StaffLayout from '../layouts/StaffLayout'

import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../common/Dashboard'
import ItemsManager from '../modules/items/ItemsManager'
import ItemDetails from '../modules/items/ItemDetails'
import LeadsManager from '../modules/leads/LeadsManager'
import QuotationsManager from '../modules/quotations/QuotationsManager'
import RegisterUser from '../modules/users/RegisterUser'
import UsersList from '../modules/users/UsersList'
import CustomersManager from '../modules/customers/CustomersManager'
import OrdersManager from '../modules/orders/OrdersManager'


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Admin (Owner) Routes */}
            <Route path="/admin/*" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard role="Admin (Owner)" />} />
                <Route path="leads" element={<LeadsManager />} />
                <Route path="quotations" element={<QuotationsManager />} />
                <Route path="items" element={<ItemsManager />} />
                <Route path="items/:id" element={<ItemDetails />} />
                <Route path="customers" element={<CustomersManager />} />
                <Route path="register-user" element={<RegisterUser />} />
                <Route path="users" element={<UsersList />} />
                <Route path="orders" element={<OrdersManager />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin/*" element={<SuperAdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard role="Super Admin" />} />
                <Route path="register-user" element={<RegisterUser />} />
                <Route path="users" element={<UsersList />} />
            </Route>

            {/* Sub Admin Routes */}
            <Route path="/sub-admin/*" element={<SubAdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard role="Sub Admin" />} />
                <Route path="items" element={<ItemsManager />} />
                <Route path="items/:id" element={<ItemDetails />} />
                <Route path="leads" element={<LeadsManager />} />
                <Route path="quotations" element={<QuotationsManager />} />
                <Route path="orders" element={<OrdersManager />} />
                <Route path="customers" element={<CustomersManager />} />
                <Route path="register-user" element={<RegisterUser />} />
                <Route path="users" element={<UsersList />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff/*" element={<StaffLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard role="Staff" />} />
                <Route path="quotations" element={<QuotationsManager />} />
                <Route path="orders" element={<OrdersManager />} />
                <Route path="leads" element={<LeadsManager />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes
