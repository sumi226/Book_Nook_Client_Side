"use client";

import { useSession } from "@/lib/auth-client";
import { addBook } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function AddBookPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "BookNook | Add Book";
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?callbackUrl=/add-book");
    }
  }, [isPending, session, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const bookData = {
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      totalCopies: Number(formData.get("totalCopies")),
      description: formData.get("description") as string,
      addedBy: {
        name: session?.user?.name || "",
        email: session?.user?.email || "",
      },
    };

    setSubmitting(true);
    try {
      await addBook(bookData);
      toast.success("Book added successfully!");
      form.reset();
    } catch {
      toast.error("Failed to add book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) return <Loading />;
  if (!session?.user) return null;

  return (
    <div className="min-h-[70vh] px-4 py-12 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8">Add a New Book</h1>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Book Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Book Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter book title"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Author Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Author Name</span>
                </label>
                <input
                  type="text"
                  name="author"
                  placeholder="Enter author name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Category */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Category</span>
                </label>
                <select
                  name="category"
                  className="select select-bordered w-full"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Book Image URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Book Image URL</span>
                </label>
                <input
                  type="text"
                  name="image"
                  placeholder="Enter image URL or imgbb link"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Total Copies */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Total Copies</span>
                </label>
                <input
                  type="number"
                  name="totalCopies"
                  min={1}
                  defaultValue={1}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Short Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Short Description
                  </span>
                </label>
                <textarea
                  name="description"
                  placeholder="Write a short description about the book"
                  className="textarea textarea-bordered w-full h-28"
                  required
                />
              </div>

              {/* User Name (read-only) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">User Name</span>
                </label>
                <input
                  type="text"
                  value={session.user.name || ""}
                  className="input input-bordered w-full bg-base-200"
                  readOnly
                />
              </div>

              {/* User Email (read-only) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">User Email</span>
                </label>
                <input
                  type="text"
                  value={session.user.email || ""}
                  className="input input-bordered w-full bg-base-200"
                  readOnly
                />
              </div>

              {/* Submit Button */}
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Add Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
