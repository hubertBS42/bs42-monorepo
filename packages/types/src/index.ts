export type SelectOption = { label: string; value: string }
export type PrimitiveOption = string | number
interface SuccessResponse<T> {
  success: true
  data: T
}

interface ErrorResponse {
  success: false
  error: string
}

export type DataResponse<T> = SuccessResponse<T> | ErrorResponse
export type ActionResponse = { success: true } | ErrorResponse

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginatedFilters {
  page?: number
  pageSize?: number
  sort?: string
  order?: string
}

export type TreeNode<T> = T & {
  children?: TreeNode<T>[]
}

export type FlatNode<T> = Omit<T, "children"> & {
  parentId: string | null
  depth: number
}
