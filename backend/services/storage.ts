import { createHash } from "node:crypto";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
};

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER ?? "interviewai";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  return { cloudName, apiKey, apiSecret, folder };
}

function signParameters(parameters: Record<string, string | number>, apiSecret: string) {
  const serialized = Object.entries(parameters)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

function assertCloudinaryResponse(response: Response, operation: string) {
  if (!response.ok) {
    throw new Error(`CLOUDINARY_${operation}_FAILED`);
  }
}

export async function uploadPrivateResume(input: {
  userId: string;
  resumeId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${config.folder}/users/${input.userId}/resumes`;
  const parameters = {
    access_mode: "authenticated",
    folder,
    public_id: input.resumeId,
    timestamp,
    type: "authenticated",
  };
  const body = new FormData();
  const fileBytes = Uint8Array.from(input.buffer);
  body.append("file", new Blob([fileBytes.buffer as ArrayBuffer], { type: input.mimeType }), input.fileName);
  body.append("api_key", config.apiKey);
  body.append("access_mode", parameters.access_mode);
  body.append("folder", parameters.folder);
  body.append("public_id", parameters.public_id);
  body.append("timestamp", String(parameters.timestamp));
  body.append("type", parameters.type);
  body.append("signature", signParameters(parameters, config.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`, {
    method: "POST",
    body,
  });
  assertCloudinaryResponse(response, "UPLOAD");
  const data = (await response.json().catch(() => null)) as { public_id?: string } | null;

  return {
    storageKey: data?.public_id || `${folder}/${input.resumeId}`,
    storageProvider: "cloudinary",
  };
}

export async function deletePrivateObject(storageKey: string) {
  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = {
    invalidate: 1,
    public_id: storageKey,
    timestamp,
    type: "authenticated",
  };
  const body = new URLSearchParams({
    api_key: config.apiKey,
    invalidate: "1",
    public_id: storageKey,
    timestamp: String(timestamp),
    type: "authenticated",
    signature: signParameters(parameters, config.apiSecret),
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/raw/destroy`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  assertCloudinaryResponse(response, "DELETE");
}

export async function downloadPrivateObject(storageKey: string, maxBytes = 5 * 1024 * 1024) {
  const config = getCloudinaryConfig();

  async function fetchKey(key: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const parameters = {
      public_id: key,
      timestamp,
      type: "authenticated",
    };
    const query = new URLSearchParams({
      api_key: config.apiKey,
      public_id: key,
      timestamp: String(timestamp),
      type: "authenticated",
      signature: signParameters(parameters, config.apiSecret),
    });
    return fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/download?${query.toString()}`,
    );
  }

  let response = await fetchKey(storageKey);
  if (!response.ok && response.status === 404 && !storageKey.endsWith(".pdf") && !storageKey.endsWith(".docx")) {
    const pdfResponse = await fetchKey(`${storageKey}.pdf`);
    if (pdfResponse.ok) {
      response = pdfResponse;
    } else {
      const docxResponse = await fetchKey(`${storageKey}.docx`);
      if (docxResponse.ok) {
        response = docxResponse;
      }
    }
  }

  assertCloudinaryResponse(response, "DOWNLOAD");
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new Error("CLOUDINARY_DOWNLOAD_TOO_LARGE");
  if (!response.body) throw new Error("CLOUDINARY_DOWNLOAD_EMPTY");

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      totalBytes += next.value.byteLength;
      if (totalBytes > maxBytes) throw new Error("CLOUDINARY_DOWNLOAD_TOO_LARGE");
      chunks.push(Buffer.from(next.value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, totalBytes);
}
