import { query, queryOne } from "@/lib/db";
import type { Booking, Customer, BookingStatus, RequestType } from "@/lib/types";

export async function findOrCreateCustomer(data: { name: string; email: string; phone?: string }): Promise<number> {
  const existing = await queryOne<{ id: number }>("SELECT id FROM customers WHERE email = $1", [data.email]);
  if (existing) {
    await query("UPDATE customers SET name = $1, phone = COALESCE($2, phone) WHERE id = $3", [
      data.name,
      data.phone || null,
      existing.id,
    ]);
    return existing.id;
  }
  const row = await queryOne<{ id: number }>(
    "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
    [data.name, data.email, data.phone || null]
  );
  return row!.id;
}

export interface BookingInput {
  tour_id: number;
  customer_id: number;
  travel_date: string;
  num_travelers: number;
  total_price: number;
  notes?: string;
  request_type?: RequestType;
}

export async function createBooking(input: BookingInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO bookings (tour_id, customer_id, travel_date, num_travelers, total_price, notes, request_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      input.tour_id,
      input.customer_id,
      input.travel_date,
      input.num_travelers,
      input.total_price,
      input.notes || null,
      input.request_type || "booking",
    ]
  );
  return row!.id;
}

function rowToBooking(row: any): Booking {
  return { ...row, num_travelers: Number(row.num_travelers), total_price: Number(row.total_price) };
}

async function joinedQuery(where = "", params: any[] = []): Promise<Booking[]> {
  const rows = await query(
    `SELECT b.*, t.title as tour_title, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
     FROM bookings b
     JOIN tours t ON t.id = b.tour_id
     JOIN customers c ON c.id = b.customer_id
     ${where}
     ORDER BY b.created_at DESC`,
    params
  );
  return rows.map(rowToBooking);
}

export async function listBookings(status?: BookingStatus, requestType?: RequestType): Promise<Booking[]> {
  const clauses: string[] = [];
  const params: any[] = [];
  if (status) {
    params.push(status);
    clauses.push(`b.status = $${params.length}`);
  }
  if (requestType) {
    params.push(requestType);
    clauses.push(`b.request_type = $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return joinedQuery(where, params);
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const rows = await joinedQuery("WHERE b.id = $1", [id]);
  return rows[0] || null;
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<void> {
  await query("UPDATE bookings SET status = $1 WHERE id = $2", [status, id]);
}

export async function listCustomers(): Promise<(Customer & { total_bookings: number; total_spent: number })[]> {
  const rows = await query(
    `SELECT c.*,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_price ELSE 0 END), 0) as total_spent
     FROM customers c
     LEFT JOIN bookings b ON b.customer_id = c.id
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  );
  return rows.map((r: any) => ({ ...r, total_bookings: Number(r.total_bookings), total_spent: Number(r.total_spent) }));
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const row = await queryOne<Customer>("SELECT * FROM customers WHERE id = $1", [id]);
  return row || null;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
}

export async function createCustomer(input: CustomerInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
    [input.name, input.email, input.phone || null]
  );
  return row!.id;
}

export async function updateCustomer(id: number, input: CustomerInput): Promise<void> {
  await query("UPDATE customers SET name = $1, email = $2, phone = $3 WHERE id = $4", [input.name, input.email, input.phone || null, id]);
}

export async function deleteCustomer(id: number): Promise<void> {
  await query("DELETE FROM customers WHERE id = $1", [id]);
}

export async function getDashboardStats() {
  const totalBookings = Number((await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM bookings"))!.c);
  const pendingBookings = Number(
    (await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'"))!.c
  );
  const quoteRequests = Number(
    (await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM bookings WHERE request_type = 'quote'"))!.c
  );
  const totalRevenue = Number(
    (await queryOne<{ s: string }>("SELECT COALESCE(SUM(total_price),0) as s FROM bookings WHERE status = 'confirmed'"))!.s
  );
  const totalCustomers = Number((await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM customers"))!.c);
  const totalTours = Number(
    (await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM tours WHERE status = 'active'"))!.c
  );

  const monthlyRows = await query<{ month: string; revenue: string; bookings: string }>(
    `SELECT TO_CHAR(created_at, 'YYYY-MM') as month,
            COALESCE(SUM(CASE WHEN status = 'confirmed' THEN total_price ELSE 0 END),0) as revenue,
            COUNT(*) as bookings
     FROM bookings
     GROUP BY month
     ORDER BY month ASC`
  );
  const monthly = monthlyRows.map((r) => ({ month: r.month, revenue: Number(r.revenue), bookings: Number(r.bookings) }));

  const byCategoryRows = await query<{ category: string; bookings: string }>(
    `SELECT t.category as category, COUNT(b.id) as bookings
     FROM bookings b JOIN tours t ON t.id = b.tour_id
     WHERE b.status != 'cancelled'
     GROUP BY t.category
     ORDER BY bookings DESC`
  );
  const byCategory = byCategoryRows.map((r) => ({ category: r.category, bookings: Number(r.bookings) }));

  return { totalBookings, pendingBookings, quoteRequests, totalRevenue, totalCustomers, totalTours, monthly, byCategory };
}
