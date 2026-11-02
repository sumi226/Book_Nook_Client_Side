"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { borrowBook } from "@/lib/api";
import Loading from "@/components/Loading";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  image: string;
  availableCopies: number;
  addedBy?: {
    name?: string;
    email?: string;
  };
}

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    document.title = "BookNook | Book Details";
  }, []);

  const fetchBook = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/books/${id}`);
      const data = await res.json();
      setBook(data);
    } catch (error) {
      console.error("Failed to fetch book:", error);
      toast.error("Failed to load book details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const handleBorrowClick = () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/books/${id}`);
      return;
    }
    const modal = document.getElementById(
      "borrow-modal"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleConfirmBorrow = async () => {
    if (!session?.user || !book) return;
    setBorrowing(true);
    try {
      await borrowBook(book._id, session.user.name);
      toast.success("Book borrowed successfully!");
      const modal = document.getElementById(
        "borrow-modal"
      ) as HTMLDialogElement | null;
      modal?.close();
      setLoading(true);
      await fetchBook();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to borrow book";
      toast.error(message);
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <Loading />;

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-base-content/60">Book not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Book Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center"
        >
          <img
            src={
              book.image || "https://via.placeholder.com/400x550?text=No+Image"
            }
            alt={book.title}
            className="rounded-xl shadow-2xl max-h-[550px] object-cover"
          />
        </motion.div>

        {/* Book Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col justify-center space-y-5"
        >
          <h1 className="text-4xl font-bold">{book.title}</h1>
          <p className="text-lg text-base-content/70">
            by <span className="font-semibold">{book.author}</span>
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary badge-lg">{book.category}</span>
            <span
              className={`badge badge-lg ${
                book.availableCopies > 0 ? "badge-success" : "badge-error"
              }`}
            >
              {book.availableCopies > 0
                ? `${book.availableCopies} copies available`
                : "Not Available"}
            </span>
          </div>

          <div className="divider"></div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-base-content/80 leading-relaxed">
              {book.description || "No description available."}
            </p>
          </div>

          {book.addedBy && (
            <div className="bg-base-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-base-content/60 mb-1">
                Added by
              </h3>
              <p className="font-medium">{book.addedBy.name || "Unknown"}</p>
              {book.addedBy.email && (
                <p className="text-sm text-base-content/60">
                  {book.addedBy.email}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleBorrowClick}
            className="btn btn-primary btn-lg"
            disabled={book.availableCopies <= 0}
          >
            {book.availableCopies <= 0
              ? "Not Available"
              : "Borrow This Book"}
          </button>
        </motion.div>
      </div>

      {/* Borrow Modal */}
      <dialog id="borrow-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4">Confirm Borrow</h3>

          <div className="space-y-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Your Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={session?.user?.name || ""}
                readOnly
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Your Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={session?.user?.email || ""}
                readOnly
              />
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">Cancel</button>
            </form>
            <button
              onClick={handleConfirmBorrow}
              className="btn btn-primary"
              disabled={borrowing}
            >
              {borrowing ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Confirm Borrow"
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </motion.div>
  );
}
