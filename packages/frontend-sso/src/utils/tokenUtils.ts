import jwtDecode from "jwt-decode";

interface ITokenPayload {
  /**
   * token过期时间，单位秒
   * Date.now()获取到的单位为ms
   */
  exp: number;
  iat: number;
  username: string;
}

export class TokenUtils {
  static decodeToken(token: string): ITokenPayload {
    try {
      return jwtDecode<ITokenPayload>(token);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {} as any;
    }
  }

  static checkTokenExpires(token: string, time?: number): boolean {
    if (!time) {
      time = Date.now();
    }
    try {
      const { exp } = this.decodeToken(token);
      if (exp === undefined) return true;
      return exp * 1000 < time;
    } catch (e) {
      return true;
    }
  }
}
