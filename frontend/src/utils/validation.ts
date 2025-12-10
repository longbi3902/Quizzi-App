/**
 * Validation Utilities
 * File này chứa các hàm validation (kiểm tra dữ liệu)
 * Tách riêng để dễ tái sử dụng và test
 */

/**
 * Kiểm tra email có hợp lệ không
 * @param email - Email cần kiểm tra
 * @returns true nếu email hợp lệ, false nếu không
 */
export const isValidEmail = (email: string): boolean => {
  // Regex pattern để kiểm tra định dạng email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

/**
 * Kiểm tra mật khẩu có đủ mạnh không
 * @param password - Mật khẩu cần kiểm tra
 * @param minLength - Độ dài tối thiểu (mặc định là 6)
 * @returns true nếu mật khẩu hợp lệ, false nếu không
 */
export const isValidPassword = (password: string, minLength: number = 6): boolean => {
  return password.length >= minLength;
};

/**
 * Kiểm tra hai mật khẩu có khớp nhau không
 * @param password - Mật khẩu gốc
 * @param confirmPassword - Mật khẩu xác nhận
 * @returns true nếu khớp, false nếu không
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Kiểm tra năm sinh có hợp lệ không
 * @param birthYear - Năm sinh cần kiểm tra
 * @returns true nếu hợp lệ, false nếu không
 */
export const isValidBirthYear = (birthYear: number): boolean => {
  const currentYear = new Date().getFullYear();
  const minYear = 1950;
  return birthYear >= minYear && birthYear <= currentYear;
};







