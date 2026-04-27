export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        // Token abgelaufen oder ungültig -> zurück zum Login
        localStorage.removeItem('token');
        window.location.href = '/login'; 
    }

    return response;
};