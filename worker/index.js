const SITE_URL = "https://doriandmarios.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cookies = request.headers.get("Cookie") || "";
    const authenticated = cookies.includes("wedding_access=1");

    if (authenticated) {
      const target = new URL(url.pathname + url.search, SITE_URL);

      return fetch(new Request(target, {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body
      }));
    }

    if (request.method === "POST" && url.pathname === "/login") {
      const formData = await request.formData();
      const password = formData.get("password");

      if (password === env.WEDDING_PASSWORD) {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/",
            "Set-Cookie":
              "wedding_access=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000"
          }
        });
      }

      return new Response(loginPage("Incorrect password. Please try again."), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8"
        },
        status: 401
      });
    }

    return new Response(loginPage(), {
      headers: {
        "Content-Type": "text/html; charset=UTF-8"
      }
    });
  }
};

function loginPage(error = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dori and Marios Wedding</title>
</head>

<body>
  <div>
    <h1>Dori and Marios</h1>

    <p>
      Welcome to our wedding website.
      Please enter the password to continue.
    </p>

    ${error ? `<p>${error}</p>` : ""}

    <form method="POST" action="/login">
      <input
        type="password"
        name="password"
        placeholder="Enter password"
        autocomplete="current-password"
        required
      >

      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;
}