import { BACKEND_BASE_URL } from "@/lib/api-client";

const getErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    return payload?.message || `Erro ao baixar arquivo (${response.status})`;
  } catch {
    return `Erro ao baixar arquivo (${response.status})`;
  }
};

const extractFilenameFromHeader = (contentDisposition: string | null) => {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] || null;
};

export const downloadProtectedFile = async (filePath: string, suggestedName?: string) => {
  if (!filePath) {
    throw new Error("Arquivo invalido para download.");
  }

  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  const response = await fetch(
    `${BACKEND_BASE_URL}/api/files/download?path=${encodeURIComponent(filePath)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const blob = await response.blob();
  const headerFilename = extractFilenameFromHeader(response.headers.get("content-disposition"));
  const fallbackName = decodeURIComponent(filePath.split("/").pop() || "arquivo");
  const filename = suggestedName || headerFilename || fallbackName;

  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};
