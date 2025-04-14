const API_BASE_URL = 'http://localhost:5001/api'; // Your Flask backend URL

// Helper function for making fetch requests
const fetchApi = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        method: 'POST', // Default to POST for these endpoints
        headers: {
            'Content-Type': 'application/json',
            // Add any other headers like Authorization if needed later
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        // Attempt to parse JSON regardless of status code for error messages
        const data = await response.json();

        if (!response.ok) {
            // Use the error message from backend if available, otherwise use status text
            const errorMessage = data?.error || response.statusText || `HTTP error! status: ${response.status}`;
            console.error(`API Error (${response.status}) on ${endpoint}:`, errorMessage, data);
            throw new Error(errorMessage); // Throw an error to be caught by calling function
        }

        return data; // Return the JSON data on success

    } catch (error) {
        console.error(`Network or fetch error on ${endpoint}:`, error);
        // Re-throw the error or a more generic one for the UI
        throw new Error(error.message || `Failed to fetch data from ${endpoint}. Is the backend running?`);
    }
};


// Function to call the prediction endpoint
export const predictSafety = async (stateUt, district) => {
    console.log(`Calling backend API: Predicting safety for ${district}, ${stateUt}`);
    const body = JSON.stringify({ stateUt, district });
    return fetchApi('/predict', { body });
};


// Function to call the recommendation endpoint
export const getRecommendations = async ({ state, topN = 5, weights }) => {
    console.log(`Calling backend API: Getting recommendations. State: ${state}, N: ${topN}, Weights:`, weights);
    const body = JSON.stringify({
        state: state || null, // Send null if state is empty/falsy
        topN: parseInt(topN, 10) || 5, // Ensure it's an integer
        weights: weights || {} // Send empty object if null/undefined
    });
    return fetchApi('/recommend', { body });
};