"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCustomer, updateCustomer, deleteCustomer, type CustomerInput } from "@/lib/queries/bookings";
import { getSession, canEditSection, deleteWithApproval } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return canEditSection("customers");
}

const customerSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  phone: z.string().optional(),
});

export type CustomerFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

function buildInput(data: z.infer<typeof customerSchema>): CustomerInput {
  return { name: data.name, email: data.email, phone: data.phone || "" };
}

export async function createCustomerAction(_prev: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }
  await createCustomer(buildInput(parsed.data));
  revalidatePath("/admin/customers");
  redirect("/admin/customers?created=1");
}

export async function updateCustomerAction(id: number, _prev: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }
  await updateCustomer(id, buildInput(parsed.data));
  revalidatePath("/admin/customers");
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deleteCustomerAction(id: number, label: string) {
  if (!(await requireAdmin())) return;
  const result = await deleteWithApproval("customers", id, label, () => deleteCustomer(id));
  revalidatePath("/admin/customers");
  revalidatePath("/admin/deletion-requests");
  return result;
}
