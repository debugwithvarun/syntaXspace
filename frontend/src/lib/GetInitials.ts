export const getInitials = (username: string): string => {
    const clean = username.replace(/[_\s]+/g, " ").trim();
    if (!clean) return "U";
  
    const parts = clean.split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
  
    return (first + second || first || "U").toUpperCase().slice(0, 2);
  };