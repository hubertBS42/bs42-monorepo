import { DocumentItem } from "@/types"

export async function uploadImages(formData: FormData): Promise<string[]> {
  const response = await fetch("/api/storage/images", {
    method: "POST",
    body: formData,
  })
  if (!response.ok) throw new Error("Failed to upload images")
  return response.json()
}

export async function deleteImages(urls: string[]): Promise<void> {
  await fetch("/api/storage/images", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  })
}

export async function restoreImages(urls: string[]): Promise<void> {
  await fetch("/api/storage/images/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  })
}

export async function uploadDocuments(formData: FormData): Promise<DocumentItem[]> {
  const response = await fetch("/api/storage/documents", {
    method: "POST",
    body: formData,
  })
  if (!response.ok) throw new Error("Failed to upload documents")
  return response.json()
}

export async function deleteDocuments(urls: string[]): Promise<void> {
  await fetch("/api/storage/documents", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  })
}

export async function restoreDocuments(urls: string[]): Promise<void> {
  await fetch("/api/storage/documents/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  })
}

export async function deleteFiles(urls: string[]): Promise<void> {
  await fetch("/api/storage/files", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  })
}

export async function restoreFiles(urls: string[]): Promise<void> {
  await fetch("/api/storage/files/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  })
}
