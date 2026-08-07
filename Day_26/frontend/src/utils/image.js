import api from "../api/api";

export const resolveProfileImage = (image) => {
  if (!image) return null;

  if (image.startsWith("http")) return image;

  try {
    return `${new URL(api.defaults.baseURL).origin}${image}`;
  } catch {
    return image;
  }
};