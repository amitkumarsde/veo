try {
    var savedTheme = localStorage.getItem("theme");
    var prefersDark = savedTheme ? savedTheme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", prefersDark);
} catch {
    // Storage can be blocked (private mode); the light theme is used then.
}
