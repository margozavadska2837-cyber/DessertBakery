class ApiError extends Error {
  constructor(code, details = []) {
    super('ApiError');
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      error: 'ApiError',
      code: this.code,
      details: this.details,
    };
  }
}

module.exports = { ApiError };
