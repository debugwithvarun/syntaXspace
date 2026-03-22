import { BACKEND } from "./api";

const ImagePath = (path: string) => {
    if (!path) return "";
    // If path is already a full URL, return as-is
    if (path.startsWith("http")) return path;
    return `${BACKEND}${path}`;
}

export default ImagePath