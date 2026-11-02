const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getToken() {
  // Get the session from BetterAuth and request a JWT from our Express server
  try {
    const res = await fetch("/api/auth/get-session", {
      credentials: "include",
    });
    if (!res.ok) return null;
    const session = await res.json();
    if (!session?.user) return null;

    // Get JWT token from Express server
    const tokenRes = await fetch(`${API_URL}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        name: session.user.name,
      }),
    });
    if (!tokenRes.ok) return null;
    const data = await tokenRes.json();
    return data.token;
  } catch {
    return null;
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

// Book APIs
export async function getAllBooks(limit?: number, sort?: string) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit.toString());
  if (sort) params.set("sort", sort);
  const res = await apiFetch(`/books?${params.toString()}`);
  return res.json();
}

export async function getBook(id: string) {
  const res = await apiFetch(`/books/${id}`);
  return res.json();
}

export async function addBook(bookData: Record<string, unknown>) {
  const res = await apiFetch("/books", {
    method: "POST",
    body: JSON.stringify(bookData),
  });
  return res.json();
}

export async function updateBook(id: string, bookData: Record<string, unknown>) {
  const res = await apiFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(bookData),
  });
  return res.json();
}

export async function deleteBook(id: string) {
  const res = await apiFetch(`/books/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// Borrow APIs
export async function borrowBook(bookId: string, userName: string) {
  const res = await apiFetch("/borrows", {
    method: "POST",
    body: JSON.stringify({ bookId, userName }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to borrow book");
  }
  return res.json();
}

export async function getMyBorrows() {
  const res = await apiFetch("/borrows");
  return res.json();
}

export async function returnBook(borrowId: string) {
  const res = await apiFetch(`/borrows/${borrowId}`, {
    method: "DELETE",
  });
  return res.json();
}
