import axios, { AxiosError, AxiosRequestConfig } from "axios";
import UserInfoUtils from "../utils/userInfoUtils";
import cloneDeep from "clone-deep";
export const BASE_URL = "http://localhost:3000";
const instance = axios.create({
  // backend
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// 不需要token的路由白名单
const tokenExcludeApiArr = ["/refresh", "/login"];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let reqQueue = [] as any[]; // 需要token才可请求的请求列表
let isRefreshingToken = false; // 是否已经在刷新token
instance.interceptors.response.use(
  (response) => {
    // data解构
    if (response.data !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (
      [403, 401].includes(error?.response?.status as number) &&
      !tokenExcludeApiArr.includes(error.config?.url as string)
    ) {
      const config = error.config as AxiosRequestConfig;
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        axios
          .post(`${BASE_URL}/refresh`, {
            refreshToken: UserInfoUtils.getRefreshToken(),
          })
          .then((refreshTokenRes) => {
            UserInfoUtils.saveToLocal(refreshTokenRes.data);
            for (const req of reqQueue) {
              req();
            }
            reqQueue = [];
            isRefreshingToken = false;
          })
          .catch((refreshError) => {
            console.error(refreshError);
            UserInfoUtils.removeLocal();
            setTimeout(() => {
              location.reload();
            }, 1000);
          });
      }
      return new Promise((resolve) => {
        reqQueue.push(() => {
          if (config.headers) {
            console.log(UserInfoUtils.getAccessToken());
            config.headers.Authorization = `Bearer ${UserInfoUtils.getAccessToken()}`;
          }
          resolve(instance(cloneDeep(config)));
        });
      });
    } else {
      throw error;
    }
  }
);

instance.interceptors.request.use((config) => {
  // 设置
  if (!tokenExcludeApiArr.includes(config.url as string)) {
    config.headers.Authorization = `Bearer ${UserInfoUtils.getAccessToken()}`;
  }
  return config;
});

export default instance;
