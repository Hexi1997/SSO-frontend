import jwtDecode from "jwt-decode";
export class JWTUtils {
  private static decode(token: string) {
    return jwtDecode(token);
  }

  static decodeToken(token: string) {
    try {
      const data = this.decode(token) as { email: string; userId: string };
      return {
        email: data.email,
        //TODO:要根据实际数据做调整
        userName: data.userId,
      };
    } catch (e) {
      return {
        email: "",
        userName: "",
      };
    }
  }
}
