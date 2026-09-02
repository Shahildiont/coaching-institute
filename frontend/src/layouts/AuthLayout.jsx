import { Outlet } from "react-router";
import ScrollToTop from "../components/ScrollToTop";

function AuthLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

export default AuthLayout;