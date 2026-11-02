"use client";

import { useSession } from "@/lib/auth-client";
import { getAllBooks, updateBook, deleteBook } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  addedBy: {
    name: string;
    email: string;
  };
}

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function MyBooksPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "BookNook | My Books";
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?callbackUrl=/my-books");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchMyBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const allBooks = await getAllBooks();
      const myBooks = allBooks.filter(
        (book: Book) => book.addedBy?.email === session?.user?.email
      );
      setBooks(myBooks);
    } catch {
      toast.error("Failed to load books.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditBook({ ...book });
    (document.getElementById("edit-modal") as HTMLDialogElement)?.showModal();
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editBook) return;

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      description: formData.get("description") as string,
      totalCopies: Number(formData.get("totalCopies")),
    };

    setSaving(true);
    try {
      await updateBook(editBook._id, updatedData);
      toast.success("Book updated successfully!");
      (document.getElementById("edit-modal") as HTMLDialogElement)?.close();
      setEditBook(null);
      await fetchMyBooks();
    } catch {
      toast.error("Failed to update book.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (book: Book) => {
    setDeleteTarget(book);
    (document.getElementById("delete-modal") as HTMLDialogElement)?.showModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteBook(deleteTarget._id);
      toast.success("Book deleted successfully!");
      setBooks((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      (document.getElementById("delete-modal") as HTMLDialogElement)?.close();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete book.");
    } finally {
      setDeleting(false);
    }
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
        <h1 className="text-3xl font-bold text-center mb-8">My Books</h1>

        {loading ? (
          <Loading />
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-base-content/60 mb-4">
              You haven&apos;t added any books yet.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/add-book")}
            >
              Add Your First Book
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {books.map((book) => (
                      <motion.tr
                        key={book._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td>
                          <div className="avatar">
                            <div className="w-12 h-16 rounded">
                              <img
                                src={book.image}
                                alt={book.title}
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="font-medium">{book.title}</td>
                        <td>{book.author}</td>
                        <td>
                          <span className="badge badge-outline">
                            {book.category}
                          </span>
                        </td>
                        <td>
                          {book.availableCopies} / {book.totalCopies}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-info btn-outline"
                              onClick={() => handleEdit(book)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-error btn-outline"
                              onClick={() => handleDeleteClick(book)}
                            >
                              Delete
                            </button>
                          </div>
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
                {books.map((book) => (
                  <motion.div
                    key={book._id}
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
                              src={book.image}
                              alt={book.title}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{book.title}</h3>
                          <p className="text-sm text-base-content/70">
                            {book.author}
                          </p>
                          <span className="badge badge-outline badge-sm mt-1">
                            {book.category}
                          </span>
                          <p className="text-sm mt-1">
                            Available: {book.availableCopies} /{" "}
                            {book.totalCopies}
                          </p>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-2">
                        <button
                          className="btn btn-sm btn-info btn-outline"
                          onClick={() => handleEdit(book)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => handleDeleteClick(book)}
                        >
                          Delete
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

      {/* Edit Modal */}
      <dialog id="edit-modal" className="modal">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Edit Book</h3>
          {editBook && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editBook.title}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Author</span>
                </label>
                <input
                  type="text"
                  name="author"
                  defaultValue={editBook.author}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  name="category"
                  defaultValue={editBook.category}
                  className="select select-bordered w-full"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Image URL</span>
                </label>
                <input
                  type="text"
                  name="image"
                  defaultValue={editBook.image}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  defaultValue={editBook.description}
                  className="textarea textarea-bordered w-full h-24"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Total Copies</span>
                </label>
                <input
                  type="number"
                  name="totalCopies"
                  defaultValue={editBook.totalCopies}
                  min={1}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    (
                      document.getElementById(
                        "edit-modal"
                      ) as HTMLDialogElement
                    )?.close()
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Delete Confirmation Modal */}
      <dialog id="delete-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <strong>&quot;{deleteTarget?.title}&quot;</strong>? This action
            cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() =>
                (
                  document.getElementById(
                    "delete-modal"
                  ) as HTMLDialogElement
                )?.close()
              }
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Delete"
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
