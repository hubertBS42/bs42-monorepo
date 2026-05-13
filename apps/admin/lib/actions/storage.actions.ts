"use server"
import { DocumentItem } from "@/types"
import { uploadFiles, deleteFiles, restoreFiles } from "@bs42/storage"

export async function uploadImagesAction(formData: FormData): Promise<string[]> {
  const files = formData.getAll("files") as File[]
  return uploadFiles(files)
}

export async function deleteFilesAction(urls: string[]): Promise<void> {
  await deleteFiles(urls)
}

export async function restoreFilesAction(urls: string[]): Promise<void> {
  await restoreFiles(urls)
}

export async function uploadDocumentsAction(formData: FormData): Promise<DocumentItem[]> {
  const files = formData.getAll("files") as File[]
  const urls = await uploadFiles(files) // reuse existing upload
  return urls.map((url, i) => ({
    name: files[i]?.name ?? "Document",
    url,
  }))
}
