import { BlobDeleteOptions, BlobServiceClient, BlobUndeleteOptions, BlockBlobClient, ContainerClient } from "@azure/storage-blob"
import { DefaultAzureCredential } from "@azure/identity"

// Storage account name
const storageName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "bs42shopstorage"

// Initializing the blob service client
const blobServiceClient = new BlobServiceClient(`https://${storageName}.blob.core.windows.net`, new DefaultAzureCredential())

// Creating file container client
const filesContainerClient = blobServiceClient.getContainerClient("bs42")

// Uploading blobs
const uploadBlob = async ({ containerClient, file }: { containerClient: ContainerClient; file: File }): Promise<string> => {
  const ext = file.name.split(".").pop()

  // Convert File type to Buffer type
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)

  const newName = Date.now().toString() + "." + ext

  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(newName)

  // Upload file
  await blockBlobClient.uploadData(fileBuffer)

  return `https://${storageName}.blob.core.windows.net/${blockBlobClient.containerName}/${newName}`
}

// Deleting blobs
const deleteBlob = async ({ containerClient, blobName }: { containerClient: ContainerClient; blobName: string }): Promise<void> => {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName)

  // include: Delete the base blob and all its snapshots
  // only: Delete only the blob's snapshots and not the blob itself
  const options: BlobDeleteOptions = {
    deleteSnapshots: "include",
  }

  await blockBlobClient.deleteIfExists(options)
}

// Restoring blobs
const restoreBlob = async ({ containerClient, blobName }: { containerClient: ContainerClient; blobName: string }): Promise<void> => {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName)

  const options: BlobUndeleteOptions = {}
  await blockBlobClient.undelete(options)
}

// Upload images
export const uploadFiles = async (files: File[]) => {
  const queries = []
  for (const file of files) {
    const uploadQuery = uploadBlob({
      containerClient: filesContainerClient,
      file,
    })
    queries.push(uploadQuery)
  }

  const uploadedFiles = await Promise.all(queries)
  return uploadedFiles
}

// Delete files
export const deleteFiles = async (urls: string[]) => {
  const queries = []

  for (const url of urls) {
    const blobName = url.split("/").pop()
    const deleteQuery = deleteBlob({
      containerClient: filesContainerClient,
      blobName: blobName!,
    })
    queries.push(deleteQuery)
  }

  await Promise.all(queries)
}

// Restore files
export const restoreFiles = async (urls: string[]) => {
  const queries = []

  for (const url of urls) {
    const blobName = url.split("/").pop()
    const restoreQuery = restoreBlob({
      containerClient: filesContainerClient,
      blobName: blobName!,
    })
    queries.push(restoreQuery)
  }

  await Promise.all(queries)
}
