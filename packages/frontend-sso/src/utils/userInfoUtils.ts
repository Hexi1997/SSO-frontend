import { EStorageKey } from "./const";
import { TokenUtils } from "./tokenUtils";
interface IUserInfo {
  accessToken: string;
  refreshToken: string;
}
class UserInfoUtils {
  static saveToLocal(data: unknown) {
    localStorage.setItem(EStorageKey.USER_INFO, JSON.stringify(data));
  }

  static getFromLocal(): IUserInfo | null {
    const data = localStorage.getItem(EStorageKey.USER_INFO);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  static removeLocal() {
    localStorage.removeItem(EStorageKey.USER_INFO);
  }

  static getAccessToken() {
    return this.getFromLocal()?.accessToken;
  }

  static getRefreshToken() {
    return this.getFromLocal()?.refreshToken;
  }

  static getLoginInfo() {
    const userInfo = this.getFromLocal();
    if (userInfo) {
      const { username } = TokenUtils.decodeToken(userInfo.accessToken);
      return {
        username,
      };
    }
    return {};
  }

  static checkAccessTokenExpires() {
    const userInfo = this.getFromLocal();
    if (userInfo) {
      return TokenUtils.checkTokenExpires(userInfo.accessToken);
    }
    return true;
  }

  static checkRefreshTokenExpires() {
    const userInfo = this.getFromLocal();
    if (userInfo) {
      return TokenUtils.checkTokenExpires(userInfo.refreshToken);
    }
    return true;
  }
}

export default UserInfoUtils;
