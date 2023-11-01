import { useEffect, useState } from "react";
import UserInfoUtils from "../utils/userInfoUtils";
import { RouterPathMap } from "../utils/const";
import instance from "../service/request";

interface IProfile {
  name: string;
  avatar: string;
}

export function UserProfile() {
  useEffect(() => {
    if (UserInfoUtils.checkRefreshTokenExpires()) {
      location.href = `${location.origin}${RouterPathMap.auth}`;
    }
  }, []);
  const [profile, setProfile] = useState<IProfile | null>(null);
  useEffect(() => {
    instance
      .post("/my")
      .then((v: unknown) => {
        setProfile(v as IProfile);
      })
      .catch(console.error);
  }, []);
  return (
    <div className="w-full h-screen flex flex-col gap-y-4 items-center justify-center">
      {profile?.avatar && (
        <img
          src={profile?.avatar}
          className="w-[100px] aspect-square rounded-full"
        />
      )}
      <span>{profile?.name}</span>
      <button
        className="text-center text-sm bg-green-500 rounded-lg py-1 px-4 text-white w-40"
        onClick={() => {
          UserInfoUtils.removeLocal();
          location.href = `${location.origin}${RouterPathMap.auth}`;
        }}
      >
        Log out
      </button>
    </div>
  );
}
