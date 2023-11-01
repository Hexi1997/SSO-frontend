import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Auth } from "./pages/Auth";
import { UserProfile } from "./pages/UserProfile";
import { RouterPathMap } from "./utils/const";
import { useSSOInit } from "./utils/hooks/useSSOInit";

function App() {
  useSSOInit();
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RouterPathMap.auth} element={<Auth />} />
        <Route path={RouterPathMap.userProfile} element={<UserProfile />} />
        <Route path="*" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
