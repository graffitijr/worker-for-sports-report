//Back End template - made my NOAH RICHARDS

export default {
    // This function runs whenever a request hits your worker's URL.
    async fetch(request, env) {
        // Create a URL object so we can look at the path and query string easily.
        const url = new URL(request.url);

        // Simple CORS headers so your frontend (Pages or other) can call this worker freely.
        const corsHeaders = {
            "Access-Control-Allow-Origin": "https://fhcsports.site",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        // Handle browser preflight for POSTs
        if (request.method === "OPTIONS") {
            return new Response(null, {status: 204, headers: corsHeaders});
        }

        //MAIN PART - handles get and post ----------------------------------------------------------------------------------------------------------------
        if (url.pathname === "/get-content" && request.method === "GET") {
            let content = await env.GlobalStorage.get("stories");
            content = content ? content : [];

            return new Response(content, {status: 200, headers: corsHeaders});
        }

        const CorrectAccounts = {
            "noahrich2028":"CanesRaisin41",
            "gports67":"CanesRaisin41"
        }

        if (url.pathname === "/login" && request.method === "POST") {
            [username, password] = request.body.json();

            if (CorrectAccounts.username === password) {
                //return new Response("login Success", {status: 200, headers: ...corsHeaders, "Set-Cookie: token="});
            }
        }


        // Default response for any other route
        return new Response("Not found", {status: 404, headers: corsHeaders});
    }
};
