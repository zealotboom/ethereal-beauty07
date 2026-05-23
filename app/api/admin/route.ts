import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    revenue: 18400,
    orders: 126,
    users: 942,
    note: "Connect Supabase service role key for live admin data."
  });
}
