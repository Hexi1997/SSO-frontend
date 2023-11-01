/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import UserInfoUtils from "../userInfoUtils";
import axios from "axios";
import { BASE_URL } from "../../service/request";

interface AppSendToSSOMessageType {
  type: "logout" | "refresh_access_token" | "get_latest_access_token";
  data?: string;
}

interface SSOSendToAppMessageType {
  type: "refresh_access_token_succeed" | "get_latest_access_token_succeed";
  data?: string;
}

const isSSOInIFrame = window.self !== window.top;

export function useSSOInit() {
  useEffect(() => {
    const handleSSOReceiveMessageFromApp = (
      e: MessageEvent<AppSendToSSOMessageType>
    ) => {
      if (!checkOriginWhenReceiveMessageFromApp(e.origin)) {
        console.error("SSO: Invalid app origin!");
        return;
      }
      const { type } = e.data;
      if (type === "logout") {
        UserInfoUtils.removeLocal();
      } else if (type === "refresh_access_token") {
        getAccessToken("refresh_access_token");
      } else if (type === "get_latest_access_token") {
        getAccessToken("get_latest_access_token");
      }
    };
    window.addEventListener("message", handleSSOReceiveMessageFromApp);
    return () => {
      window.removeEventListener("message", handleSSOReceiveMessageFromApp);
    };
  }, []);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function checkOriginWhenReceiveMessageFromApp(origin: string) {
  // do origin check
  return true;
}

function sendMessageFromSSOToParentApp(message: SSOSendToAppMessageType) {
  if (isSSOInIFrame) {
    window.parent.postMessage(message, "*");
  }
}

function getAccessToken(
  type: "get_latest_access_token" | "refresh_access_token"
) {
  const accessToken = UserInfoUtils.getAccessToken() || "";
  const refreshToken = UserInfoUtils.getRefreshToken() || "";
  const responseType =
    type === "get_latest_access_token"
      ? "get_latest_access_token_succeed"
      : "refresh_access_token_succeed";
  if (!accessToken) {
    sendMessageFromSSOToParentApp({
      type: responseType,
      data: "",
    });
  } else {
    if (!UserInfoUtils.checkAccessTokenExpires()) {
      sendMessageFromSSOToParentApp({
        type: responseType,
        data: accessToken,
      });
    } else {
      if (UserInfoUtils.checkRefreshTokenExpires()) {
        UserInfoUtils.removeLocal();
        sendMessageFromSSOToParentApp({
          type: responseType,
          data: "",
        });
      } else {
        axios
          .post(`${BASE_URL}/refresh`, {
            refreshToken,
          })
          .then((v) => {
            UserInfoUtils.saveToLocal(v.data);
            sendMessageFromSSOToParentApp({
              type: responseType,
              data: v.data.accessToken || "",
            });
          })
          .catch((e) => {
            console.error("SSO: ", e);
            UserInfoUtils.removeLocal();
            sendMessageFromSSOToParentApp({
              type: responseType,
              data: "",
            });
          });
      }
    }
  }
}
