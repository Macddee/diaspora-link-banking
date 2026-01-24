
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  } else {
    // If not logged in, Clerk middleware will handle redirecting to sign-in
    // or you can redirect manually
    redirect("/dashboard"); 
  }
  
  return null; 
}
