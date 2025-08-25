'use client';
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [accToken, setAccToken] = useState('');
    const [refToken, setRefToken] = useState('');
    const [message, setMessage] = useState('');
    const [newUsername, setNewUsername] = useState<string>('');
    const [newEmail, setNewEmail] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [selectedGroup, setSelectedGroup] = useState<string>('');


    // CRUD state
    const [users, setUsers] = useState([]);

    const handleLogin = async () => {
        try {
            const res = await axios.post('/api/login', { username, password });
            setAccToken(res.data.accessToken);
            setRefToken(res.data.refreshToken);
            setMessage('Login successful');
        } catch {
            setMessage('Login failed');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout', { refreshToken: refToken });
            setAccToken('');
            setRefToken('');
            setMessage('Logout successful');
        } catch {
            setMessage('Logout failed');
        }
    };

    // CRUD API calls (you'll implement these in your backend)
    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${accToken}` }
            });
            setUsers(res.data);
        } catch {
            setMessage('Failed to load users');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg || !selectedGroup) {
            alert("Please select an organization and a group before submitting.");
            return;
        }
        const newUserPayload = {
            username: newUsername,
            email: newEmail,
            password: newPassword,
            organization: selectedOrg, 
            group: selectedGroup,
        };

        try {
            const res = await axios.post(
                "/api/admin/create-user",
                newUserPayload,
                { headers: { Authorization: `Bearer ${accToken}` } }
            );
            alert(res.data.message);
        } catch (err: any) {
            alert(err.response?.data?.error || err.message);
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await axios.delete(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${accToken}` }
            });
            fetchUsers();
        } catch {
            setMessage('Failed to delete user');
        }
    };

    return (
        <div style={{ padding: 20 }}>
            {!accToken ? (
                <>
                    <h2>Login</h2>
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    /><br />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    /><br />
                    <button className="bg-green-600 text-white px-4 py-1" onClick={handleLogin}>Login</button>
                    {message && <p>{message}</p>}
                </>
            ) : (
                <>
                    <p>{message}</p>
                    <button className="bg-red-600 text-white px-4 py-1" onClick={handleLogout}>Logout</button>

                    <h2>User Management</h2>

                    {/* Fetch Users */}
                    <button className="bg-blue-600 text-white px-4 py-1" onClick={fetchUsers}>Load Users</button>
                    <ul>
                        {users?.map((u: any) => (
                            <>
                                <li key={u.id}>
                                    {u.username} -({u.firstName} {u.lastName}) - {u.email}
                                </li>
                                <button className="bg-red-600 text-white px-2 py-1" onClick={() => deleteUser(u.id)}>Delete</button>
                            </>
                        ))}
                    </ul>

                    {/* Add User */}
                    <h3>Add User</h3>
                    {/* Add User Form */}
                    <div className="bg-black p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Add New User</h2>
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">

                            {/* Username Input */}
                            <input
                                type="text"
                                value={newUsername}
                                onChange={e => setNewUsername(e.target.value)}
                                placeholder="Username"
                                required
                                className="p-2 border rounded"
                            />

                            {/* Email Input */}
                            <input
                                type="email"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="p-2 border rounded"
                            />

                            {/* Password Input */}
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="p-2 border rounded"
                            />
                            <input
                                type="text"
                                value={selectedGroup}
                                onChange={e => setSelectedGroup(e.target.value)}
                                placeholder="Group"
                                required
                                className="p-2 border rounded"
                            />

                            <input
                                type="text"
                                value={selectedOrg}
                                onChange={e => setSelectedOrg(e.target.value)}
                                placeholder="Organization"
                                required
                                className="p-2 border rounded"
                            />
                    




                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                            >
                                Create User
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
