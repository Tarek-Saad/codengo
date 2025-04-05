import dynamic from "next/dynamic";
import { redirect } from "next/navigation"; // تم تصحيح الاقتباسات
import { getIsAdmin } from "@/lib/admin";

const App = dynamic(() => import("./app"), { ssr: true });

const AdminPage =  () => {
  const isAdmin =  getIsAdmin();
  
  if (!isAdmin) {
    redirect("/");
  }
  
  return (
    <App />
  );
};

export default AdminPage;
