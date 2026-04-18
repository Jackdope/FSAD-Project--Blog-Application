// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Helper function to set JWT token
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Helper function to clear JWT token
function clearAuthToken() {
    localStorage.removeItem('authToken');
}

/** Escape user text before inserting into innerHTML (prevents XSS and broken markup). */
function escapeHtml(text) {
    if (text == null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// API Functions
const api = {
    // Auth endpoints
    register: async (data) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Registration failed');
        }
        return json;
    },

    login: async (data) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Login failed');
        }
        return json;
    },

    // verifyEmail removed

    // Blog endpoints
    getAllPosts: async () => {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to fetch posts');
        }
        return json;
    },

    getPublicPosts: async () => {
        const response = await fetch(`${API_BASE_URL}/posts/public`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to fetch public posts');
        }
        return json;
    },

    getPost: async (id) => {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to fetch post');
        }
        return json;
    },

    getUserPosts: async (username) => {
        const response = await fetch(`${API_BASE_URL}/posts/user/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to fetch user posts');
        }
        return json;
    },

    createPost: async (data) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to create post');
        }
        return json;
    },

    uploadImage: async (file) => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/posts/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to upload image');
        }
        
        const imagePath = await response.text();
        return imagePath;
    },

    updatePost: async (id, data) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to update post');
        }
        return json;
    },

    deletePost: async (id) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const json = await response.json();
            throw new Error(json.message || 'Failed to delete post');
        }
        return response;
    },

    searchByTag: async (keyword) => {
        const response = await fetch(`${API_BASE_URL}/posts/search?keyword=${encodeURIComponent(keyword)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(json.message || 'Failed to search posts');
        }
        return json;
    }
};
