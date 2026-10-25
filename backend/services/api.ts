import { NextResponse } from "next/server";

export function jsonError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status },
  );
}

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
