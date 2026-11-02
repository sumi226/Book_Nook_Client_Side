"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Loading from "@/components/Loading";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.title = "BookNook | My Profile";
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?callbackUrl=/profile");
    }
  }, [isPending, session, router]);

  if (isPending) return <Loading />;
  if (!session?.user) return null;

  const user = session.user;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card bg-base-100 shadow-xl border border-base-300 w-full max-w-md"
      >
        <div className="card-body items-center text-center">
          <div className="avatar mb-4">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=10b981&color=fff&size=128`}
                alt={user.name || "User"}
              />
            </div>
          </div>
          <h2 className="card-title text-2xl">{user.name}</h2>
          <p className="text-base-content/70">{user.email}</p>
          <div className="divider"></div>
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
              <span className="font-medium">Name</span>
              <span className="text-base-content/70">{user.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
              <span className="font-medium">Email</span>
              <span className="text-base-content/70">{user.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
              <span className="font-medium">Member Since</span>
              <span className="text-base-content/70">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
