export function getErrorMessage(error) {
  const firstValidationError = error.response?.data?.errors?.[0];
  if (firstValidationError) {
    return firstValidationError.msg || firstValidationError.message || "Invalid input";
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message === "Network Error" || !error.response) {
    return "Unable to connect to the server. Please check your network.";
  }

  return "The request could not be completed.";
}