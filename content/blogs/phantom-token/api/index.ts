import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(
	new URL(
		".well-known/jwks.json",
		process.env.AUTH_SERVER ?? "http://auth:8080",
	),
);

Bun.serve({
	routes: {
		"/api/me": async (req) => {
			const auth = req.headers.get("authorization");
			const bearer = auth?.slice(7);
			console.log("auth", auth, "bearer", bearer);
			if (!bearer) return new Response("Forbidden", { status: 403 });

			const { payload } = await jwtVerify(bearer, jwks);
			console.log("success", "jwt payload", payload);
			return new Response(JSON.stringify(payload));
		},
	},
});
