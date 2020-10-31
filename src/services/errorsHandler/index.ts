interface FieldError {
  field: string;
  message: string;
}

interface UserResponse {
  errors?: FieldError[];
}
const errorsHandler = (field: string, message: string): UserResponse => ({
  errors: [{ field, message }],
});

export default errorsHandler;
