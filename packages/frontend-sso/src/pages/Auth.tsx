import { useEffect, useState } from "react";
import UserInfoUtils from "../utils/userInfoUtils";
import { RouterPathMap } from "../utils/const";
import instance from "../service/request";

export function Auth() {
  const [name, setName] = useState("user");
  const [psd, setPsd] = useState("123456");
  useEffect(() => {
    if (!UserInfoUtils.checkRefreshTokenExpires()) {
      location.href = `${location.origin}${RouterPathMap.userProfile}`;
    }
  }, []);
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form>
        <input
          type="text"
          placeholder="User name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          className="border-[1px] border-solid focus:outline-none mb-4 rounded"
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={psd}
          onChange={(e) => {
            setPsd(e.target.value);
          }}
          className="border-[1px] border-solid focus:outline-none rounded"
        />
        <br />
        <button
          type="submit"
          className="mt-4 text-center text-sm bg-green-500 w-full rounded-lg py-1 px-4 text-white"
          onClick={(e) => {
            e.preventDefault();
            //do login
            instance
              .post("/login", {
                username: name,
                password: psd,
              })
              .then((v) => {
                console.log(v);
                UserInfoUtils.saveToLocal(v);
                location.href = `${location.origin}${RouterPathMap.userProfile}`;
              })
              .catch(console.error);
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
