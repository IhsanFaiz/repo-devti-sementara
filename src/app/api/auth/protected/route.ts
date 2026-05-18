// NEXT
import { NextResponse } from 'next/server';
import { auth } from 'server/auth';
// ==============================|| NEXT AUTH - ROUTES  ||============================== //

export async function GET(request: Request) {
  const session = await auth();
  if (session) {
    return NextResponse.json({ protected: true });
  } else {
    return NextResponse.json({ protected: false });
  }
}
