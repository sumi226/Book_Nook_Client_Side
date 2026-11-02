"use client";

import { useSession } from "@/lib/auth-client";
import { getMyBorrows, returnBook } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import Link from "next/link";

interface Borrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
}

export default function MyBorrowsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnTarget, setReturnTarget] = useState<Borrow | null>(null);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    document.title = "BookNook | My Borrows";
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?callbackUrl=/my-borrows");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBorrows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const data = await getMyBorrows();
      setBorrows(data);
    } catch {
      toast.error("Failed to load borrows.");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (borrow: Borrow) => {
    setReturnTarget(borrow);
    (document.getElementById("return-modal") as HTMLDialogElement)?.showModal();
  };

  const handleReturnConfirm = async () => {
    if (!returnTarget) return;

    setReturning(true);
    try {
      await returnBook(returnTarget._id);
      toast.success("Book returned successfully!");
      setBorrows((prev) => prev.filter((b) => b._id !== returnTarget._id));
      (document.getElementById("return-modal") as HTMLDialogElement)?.close();
      setReturnTarget(null);
    } catch {
      toast.error("Failed to return book.");
    } finally {
      setReturning(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isPending) return <Loading />;
  if (!session?.user) return null;

  return (
    <div className="min-h-[70vh] px-4 py-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          My Borrowed Books
        </h1>

        {loading ? (
          <Loading />
        ) : borrows.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg text-base-content/60 mb-4">
              You haven&apos;t borrowed any books yet.
            </p>
            <Link href="/books" className="btn btn-primary">
              Browse Books
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Book Title</th>
                    <th>Borrow Date</th>
                    <th>Return Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {borrows.map((borrow) => (
                      <motion.tr
                        key={borrow._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td>
                          <div className="avatar">
                            <div className="w-12 h-16 rounded">
                              <img
                                src={borrow.bookImage}
                                alt={borrow.bookTitle}
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="font-medium">
                          {borrow.bookTitle}
                        </td>
                        <td>{formatDate(borrow.borrowDate)}</td>
                        <td>{formatDate(borrow.returnDate)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning btn-outline"
                            onClick={() => handleReturnClick(borrow)}
                          >
                            Return Book
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              <AnimatePresence>
                {borrows.map((borrow) => (
                  <motion.div
                    key={borrow._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="card bg-base-100 shadow border border-base-300"
                  >
                    <div className="card-body p-4">
                      <div className="flex gap-4">
                        <div className="avatar">
                          <div className="w-16 h-20 rounded">
                            <img
                              src={borrow.bookImage}
                              alt={borrow.bookTitle}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">
                            {borrow.bookTitle}
                          </h3>
                          <p className="text-sm text-base-content/70 mt-1">
                            Borrowed: {formatDate(borrow.borrowDate)}
                          </p>
                          <p className="text-sm text-base-content/70">
                            Return by: {formatDate(borrow.returnDate)}
                          </p>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-2">
                        <button
                          className="btn btn-sm btn-warning btn-outline"
                          onClick={() => handleReturnClick(borrow)}
                        >
                          Return Book
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>

      {/* Return Confirmation Modal */}
      <dialog id="return-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Return</h3>
          <p className="py-4">
            Are you sure you want to return{" "}
            <strong>&quot;{returnTarget?.bookId?.title}&quot;</strong>?
          </p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() =>
                (
                  document.getElementById(
                    "return-modal"
                  ) as HTMLDialogElement
                )?.close()
              }
            >
              Cancel
            </button>
            <button
              className="btn btn-warning"
              onClick={handleReturnConfirm}
              disabled={returning}
            >
              {returning ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Return Book"
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
