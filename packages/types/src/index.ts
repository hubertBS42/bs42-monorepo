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
