// errors/errorResponse.js
class ApiError extends Error {
  constructor({ status = 400, code = 'ERROR', details = [] }) {
    super(code);
    this.status = status;
    this.code = code;
    this.details = details;
    this.isApiError = true;
  }

  toResponse() {
    return {
      error: 'ApiError',
      code: this.code,
      details: this.details
    };
  }
}

module.exports = ApiError;