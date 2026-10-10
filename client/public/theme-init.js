try {
    var savedTheme = localStorage.getItem("theme");
    var prefersDark = savedTheme ? savedTheme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", prefersDark);
} catch {
    // If storage is blocked (private mode), we use the light theme.
}
