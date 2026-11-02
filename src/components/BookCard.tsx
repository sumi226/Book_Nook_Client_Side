"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface BookCardProps {
  book: {
    _id: string;
    title: string;
    author: string;
    category: string;
    image: string;
    availableCopies?: number;
  };
  index?: number;
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300 group"
    >
      <figure className="relative overflow-hidden h-64">
        <img
          src={book.image || "https://via.placeholder.com/300x400?text=No+Image"}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className="badge badge-primary">{book.category}</span>
        </div>
        {book.availableCopies !== undefined && (
          <div className="absolute top-3 left-3">
            <span className={`badge ${book.availableCopies > 0 ? "badge-success" : "badge-error"}`}>
              {book.availableCopies > 0 ? `${book.availableCopies} copies` : "Not Available"}
            </span>
          </div>
        )}
      </figure>
      <div className="card-body p-5">
        <h2 className="card-title text-lg font-bold line-clamp-1">{book.title}</h2>
        <p className="text-base-content/70 text-sm">by {book.author}</p>
        <div className="card-actions justify-end mt-3">
          <Link href={`/books/${book._id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
