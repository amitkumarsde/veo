// URL-safe id from a name: "Chess Club!" -> "chess-club".
export const slugify = (value) =>
    String(value ?? "")
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .replace(/-+$/, "");
