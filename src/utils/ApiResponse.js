class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.success = true
    this.statusCode = statusCode <400
    this.message = message
    this.data = data
  }
}
export {ApiResponse}
