export class ApiResponse<T> {
    status: string;
    message: string;
    data?: T;
    error?: string;
  
    constructor(status: string, message: string, data?: T, error?: string) {
      this.status = status;
      this.message = message;
      this.data = data;
      this.error = error;
    }
  
    static success<T>(message: string, data?: T): ApiResponse<T> {
      return new ApiResponse<T>("success", message, data);
    }
  
    static error<T>(message: string, error?: string): ApiResponse<T> {
      return new ApiResponse<T>("error", message, undefined, error);
    }
  }