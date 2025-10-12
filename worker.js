//Back End template with cookies - made my NOAH RICHARDS  ---------------------------CAN ONLY USE ON MOBILE IF WORKER IS ON SUBDOMAIN ex. https://worker.fhcsports.site

export default {
    // This function runs whenever a request hits your worker's URL.
    async fetch(request, env) {
        // Create a URL object so we can look at the path and query string easily.
        const url = new URL(request.url);

        // Simple CORS headers so your frontend (Pages or other) can call this worker freely.
        const corsHeaders = {
            "Access-Control-Allow-Origin": "https://fhcsports.site", //set to frontend site, like https://fhcsports.site
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        //function to help generate tokens

        async function GenerateToken(){
            return Math.random().toString(36).substring(0, 8); //set length of token
        }

        //function to store tokens

        async function StoreTokens(token, user){
            await env.GlobalStorage.put("token_" + token, user)
        }

        //get user from token

        async function GetUserFromToken(token){
            let user = await env.GlobalStorage.get("token_" + token);
            user = user ? user : null;
            return user;
        }

        //deletes tokens

        async function DeleteTokenFromToken(token){
            await env.GlobalStorage.delete("token_" + token);
        }

        async function DeleteTokenFromUser(user){
            let list = await env.GlobalStorage.list();
            for (const item of list.keys) {
                if (await env.GlobalStorage.get(item.name) === user) {
                    await env.GlobalStorage.delete(item.name);
                }
            }
        }

        //adds helpful query perameter help

        function GetQueryParam(url, keys) {
            const params = new URL(url).searchParams;
            const result = {};
            for (const key of keys) {
                result[key] = params.get(key);
            }
            return result;
        }
        function GetURL(){
            return window.location.href
        }

        // Handle browser preflight for POSTs
        if (request.method === "OPTIONS") {
            return new Response(null, {status: 204, headers: corsHeaders});
        }

        //MAIN PART - handles get and post ---------------------------------------------------------------------------------------------------------------- change after this
        //examples at end of code
        const CorrectAccounts = {
            "admin":"passwordadmin1",
            "gports67":"CanesRaisin41"
        }


        if (url.pathname === "/get-content" && request.method === "GET") {
            let content = await env.GlobalStorage.get("stories");
            content = content ? content : [];

            return new Response(content, {status: 200, headers: corsHeaders});
        }
        if (url.pathname === "/sign-in" && request.method === "POST") {
            let [username, password] = await request.json();
            await DeleteTokenFromUser(username)

            if (CorrectAccounts[username] === password) {
                let token = await GenerateToken(username, password);
                await StoreTokens(token, username)

                return new Response("successful sign in", {
                    headers: {
                        "Set-Cookie": `session=${token}; Domain=.fhcsports.site; Path=/; HttpOnly; Secure; SameSite=None`,
                        ...corsHeaders,
                    }
                });
            }
            return new Response("invalid login", {status: 404, headers: corsHeaders});
        }
        if (url.pathname === "/post" && request.method === "POST") {
            const RequestedStory = await request.json();

            // Extract session cookie value
            const cookieHeader = request.headers.get("Cookie") || "";
            const tokenMatch = cookieHeader.match(/session=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;

            const SignedIn = token ? await GetUserFromToken(token) : null;

            if (SignedIn !== null) {
                let CurrentContent = await env.GlobalStorage.get("stories");
                CurrentContent = CurrentContent ? JSON.parse(CurrentContent) : [];

                CurrentContent.unshift(RequestedStory);
                await env.GlobalStorage.put("stories", JSON.stringify(CurrentContent));

                return new Response("Successfully Posted", { status: 200, headers: corsHeaders });
            }

            return new Response("not posted: Not logged in", { status: 404, headers: corsHeaders });
        }


        // Default response for any other route
        return new Response("Not found", {status: 404, headers: corsHeaders});
    }
};

//----------------------------------------------------------------------------------------------------------------------------------EXAMPLES

/* example get


        if (url.pathname === "/get-content" && request.method === "GET") {
            let content = await env.GlobalStorage.get("stories");
            content = content ? content : [];

            return new Response(content, {status: 200, headers: corsHeaders});
        }
        */


/* example post

if (url.pathname === "/login" && request.method === "POST") {
    let [username, password] = await request.json();

    if (CorrectAccounts[username] === password) {
        let token = await GenerateStoreReturnToken(username, password);

        return new Response("login success", {
            headers: {
                "Set-Cookie": `session=${token}; Domain=.fhcsports.site; Path=/; HttpOnly; Secure; SameSite=None`,                  <-------------   SET COOKIE
                ...corsHeaders,
            }
        });
    }
    return new Response("invalid login", {status: 404, headers: corsHeaders});
}

 */
