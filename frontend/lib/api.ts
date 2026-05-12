const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Crucial for sending/receiving httpOnly cookies
  }

  const response = await fetch(url, defaultOptions)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Something went wrong')
  }

  return response.json()
}
