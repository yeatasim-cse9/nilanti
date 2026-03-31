export const uploadToImgBB = async (file: File, apiKey?: string): Promise<string> => {
  const finalApiKey = apiKey || import.meta.env.VITE_IMGBB_API_KEY;
  if (!finalApiKey) {
    throw new Error("ImgBB API Key is not configured (imgbb_api_key)");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${finalApiKey}`, {
      method: "POST",
      body: formData,
    });


    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Image upload failed");
    }
  } catch (error) {
    console.error("ImgBB Upload Error:", error);
    throw error;
  }
};
