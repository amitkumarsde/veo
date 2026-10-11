// Pre-deploy check: loads every server file and starts the app with placeholder settings, no database.
process.env.MONGO_URL ||= "mongodb://localhost:27017/veo-check";
process.env.JWT_SECRET ||= "check-only-secret-that-is-at-least-32-characters";

const { createApp } = await import("../src/app.js");
const server = createApp().listen(0);
await new Promise((resolve) => server.once("listening", resolve));
const { port } = server.address();

const response = await fetch(`http://localhost:${port}/`);
server.close();
if (!response.ok) {
    console.error(`Server check failed: GET / answered ${response.status}`);
    process.exit(1);
}
console.log("Server check passed: all modules load and the app answers.");
