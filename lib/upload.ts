import { API_URL, api } from "./api";

export async function uploadImageFile(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("이미지 읽기 실패"));
    reader.readAsDataURL(file);
  });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const { data } = await api.post<{ url: string }>("/upload/base64", {
    filename: `web_${Date.now()}.${ext}`,
    base64,
  });
  if (!data?.url) throw new Error("업로드 URL을 받지 못했습니다.");
  const url = data.url.startsWith("http") ? data.url : `${API_URL}${data.url}`;
  return url;
}

const DEFAULT_PLACEHOLDER_IMAGE_PATH = "/ic.png";

export async function uploadDefaultPlaceholderImage(): Promise<string> {
  const res = await fetch(DEFAULT_PLACEHOLDER_IMAGE_PATH);
  if (!res.ok) throw new Error("기본 이미지를 불러오지 못했습니다.");
  const blob = await res.blob();
  const file = new File([blob], "ic.png", { type: blob.type || "image/png" });
  return uploadImageFile(file);
}

export { DEFAULT_PLACEHOLDER_IMAGE_PATH };
