"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BookCard from "@/components/BookCard";
import { getAllBooks } from "@/lib/api";

// ─── Banner Slides ───────────────────────────────────────────────
const slides = [
  {
    title: "Discover Your Next Favorite Book",
    text: "Browse our curated collection of thousands of titles across every genre imaginable.",
    gradient: "from-primary to-secondary",
  },
  {
    title: "Borrow Anytime, Anywhere",
    text: "Our seamless borrowing system lets you enjoy books on your own schedule.",
    gradient: "from-secondary to-accent",
  },
  {
    title: "Join the BookNook Community",
    text: "Connect with fellow readers, share reviews, and explore reading lists.",
    gradient: "from-accent to-primary",
  },
];

// ─── Fake Reviews ────────────────────────────────────────────────
const reviews = [
  {
    name: "Sarah Mitchell",
    quote:
      "BookNook completely changed my reading habits! The borrowing process is so smooth and the collection is incredible.",
    rating: 5,
  },
  {
    name: "James Rodriguez",
    quote:
      "I love how easy it is to discover new books. The recommendations are always spot-on. Highly recommended!",
    rating: 4,
  },
  {
    name: "Emily Chen",
    quote:
      "The best library platform I've ever used. Fast, beautiful, and packed with amazing titles. A reader's paradise!",
    rating: 5,
  },
];

// ─── Steps Data ──────────────────────────────────────────────────
const steps = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: "Find a Book",
    description: "Search our vast catalog by title, author, or category to find the perfect read.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Borrow It",
    description: "Click borrow and the book is yours. It's that easy — no paperwork needed.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
    title: "Return When Done",
    description: "Finished reading? Return it with one click so others can enjoy it too.",
  },
];

// ─── Star Component ──────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-warning">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${i < count ? "fill-current" : "fill-none stroke-current"}`}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Book type ───────────────────────────────────────────────────
interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  availableCopies?: number;
}

// ═════════════════════════════════════════════════════════════════
// HOME PAGE
// ═════════════════════════════════════════════════════════════════
export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "BookNook | Home";
  }, []);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const data = await getAllBooks(6, "newest");
        setBooks(Array.isArray(data) ? data : data.books ?? []);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Banner / Slider ────────────────────────────────────── */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div
              className={`hero min-h-[520px] bg-gradient-to-br ${slide.gradient} text-primary-content`}
            >
              <div className="hero-overlay bg-black/20" />
              <div className="hero-content text-center py-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="mt-5 text-lg md:text-xl opacity-90 drop-shadow">
                    {slide.text}
                  </p>
                  <Link href="/books" className="btn btn-lg mt-8 btn-outline border-white text-white hover:bg-white hover:text-primary">
                    Browse Books
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── New Arrivals ───────────────────────────────────────── */}
      <AnimatedSection className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            New <span className="text-primary">Arrivals</span>
          </h2>
          <p className="text-base-content/60 mt-3 max-w-xl mx-auto">
            Check out the latest books added to our ever-growing collection.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : books.length === 0 ? (
          <p className="text-center text-base-content/50 py-10">
            No books found. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, idx) => (
              <BookCard key={book._id} book={book} index={idx} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/books" className="btn btn-primary btn-wide">
            See All Books
          </Link>
        </div>
      </AnimatedSection>

      {/* ── How Borrowing Works ────────────────────────────────── */}
      <AnimatedSection className="py-16 px-4 md:px-8 bg-base-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              How <span className="text-primary">Borrowing</span> Works
            </h2>
            <p className="text-base-content/60 mt-3 max-w-xl mx-auto">
              Getting your next read is just three simple steps away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="card-body items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {step.icon}
                  </div>
                  <div className="badge badge-primary badge-sm mb-2">
                    Step {i + 1}
                  </div>
                  <h3 className="card-title text-xl">{step.title}</h3>
                  <p className="text-base-content/60">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Reader Reviews ─────────────────────────────────────── */}
      <AnimatedSection className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            What <span className="text-primary">Readers</span> Say
          </h2>
          <p className="text-base-content/60 mt-3 max-w-xl mx-auto">
            Don&apos;t just take our word for it — hear from our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="card bg-base-100 shadow-md border border-base-300 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="card-body">
                <Stars count={review.rating} />
                <p className="text-base-content/80 italic mt-3 leading-relaxed">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-10">
                      <span className="text-lg font-bold">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold">{review.name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
