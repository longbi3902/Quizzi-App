/**
 * Utility functions cho JWT token
 */

/**
 * Decode JWT token (không verify)
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Kiểm tra token có hết hạn chưa
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    // exp là timestamp (giây), Date.now() là milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Thêm buffer 1 phút để refresh trước khi hết hạn
    const bufferTime = 60 * 1000; // 1 phút

    return currentTime >= expirationTime - bufferTime;
  } catch (error) {
    return true;
  }
};

/**
 * Lấy thời gian còn lại của token (milliseconds)
 */
export const getTokenTimeRemaining = (token: string): number => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    return Math.max(0, expirationTime - currentTime);
  } catch (error) {
    return 0;
  }
};

