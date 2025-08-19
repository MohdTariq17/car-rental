"use client"
import React, { useEffect, useState } from 'react';

const UserScreen = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Replace with your API endpoint or data fetching logic
    const fetchUsers = async () => {
      // Example static data
      const data = [
        { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
        { id: 2, name: 'Bob Johnson', email: 'bob@example.com' },
      ];
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>User List</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserScreen;