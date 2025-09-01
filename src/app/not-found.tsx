import Breadcrumb from "@/components/common/Breadcrumb";
import NotFound from "@/components/not-found";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 Page | HerbisVeritas - Cosmétiques Bio Naturels",
};

const ErrorPage = (): JSX.Element => {
  return (
    <>
      <Breadcrumb pageName="404 Page" />

      <NotFound />
    </>
  );
};

export default ErrorPage;
