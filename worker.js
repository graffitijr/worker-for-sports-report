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

        async function GenerateStoreReturnToken(user){
            let token = Math.random().toString(36).substring(2);
            await env.GlobalStorage.put(`token_${token}`, user)
            return token;
        }

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
            let [username, password] = await request.json();

            if (CorrectAccounts[username] === password) {
                let token = await GenerateStoreReturnToken(username, password);

                return new Response("login success", {
                    headers: {
                        "Set-Cookie": `session=${token}; Domain=.fhcsports.site; Path=/; HttpOnly; Secure; SameSite=None`,
                        ...corsHeaders,
                    }
                });
            }
            return new Response("invalid login", {status: 404, headers: corsHeaders});
        }

        if (url.pathname === "/post-story" && request.method === "POST") {
            let [name, text] = await request.json();
            const cookieHeader = request.headers.get("Cookie") || "";
            const match = cookieHeader.match(/session=([^;]+)/);
            const token = match ? match[1] : null;

            let CorrectUser = await env.GlobalStorage.get(`token_${token}`)


            if(CorrectUser === name) {
                let raw = await env.GlobalStorage.get("stories");
                let OldStories = raw ? JSON.parse(raw) : [];

                OldStories.unshift(text);

                await env.GlobalStorage.put("stories", JSON.stringify(OldStories));

                return new Response("successfully added", {status: 200, headers: corsHeaders});
            }
            return new Response("not logged in", {status: 404, headers: corsHeaders});
        }

        if (url.pathname === "/remove-story" && request.method === "POST") {
            let [name, storyRequest] = await request.json();

            const cookieHeader = request.headers.get("Cookie") || "";
            const match = cookieHeader.match(/session=([^;]+)/);
            const token = match ? match[1] : null;

            let CorrectUser = await env.GlobalStorage.get(`token_${token}`)

            let Stories = await env.GlobalStorage.get("stories");
            Stories = JSON.parse(Stories || "[]");

            let newStories = [];

            if(CorrectUser === name) {
                for (const story of Stories) {
                    if (story.title !== storyRequest) {
                        newStories.push(story);
                    }
                }
                await env.GlobalStorage.put("stories", newStories)
                return new Response("attempted to remove", {status: 200, headers: corsHeaders});
            }
            return new Response("Error, no such story", {status: 404, headers: corsHeaders});
        }


        // Default response for any other route
        return new Response("Not found", {status: 404, headers: corsHeaders});
    }
};
