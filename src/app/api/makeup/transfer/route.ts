import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      code: "not_available",
      message: "Reference makeup transfer is not included in the paid beta."
    },
    { status: 501 }
  );
}
