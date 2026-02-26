export async function getAccessToken(): Promise<string> {
    // Define headers with Authorization token
    const headers = new Headers();
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error(
            "MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET environment variables are not set."
        );
    }

    // Use the provided Basic Auth credentials
     
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    
    headers.append('Authorization', `Basic ${credentials}`);


    try {
        // Make the fetch request to get access token

        const response = await fetch(
            "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                method: "GET",
                headers,
            }
        );

        // Ensure the response is successful
        if (!response.ok) {
            throw new Error(
                `Failed to fetch access token: ${response.statusText}`
            );
        }

        // Parse the response as JSON
        const result = await response.json();

        // Extract access token from the response
        const accessToken = result.access_token;
        return accessToken;
    } catch (error) {
        console.error("Error fetching access token:", error);
        throw error; // Propagate the error
    }
}