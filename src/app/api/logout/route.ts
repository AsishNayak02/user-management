// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const KEYCLOAK_LOGOUT_URL = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
const CLIENT_ID = process.env.CLIENT_ID??'';
const CLIENT_SECRET = process.env.CLIENT_SECRET??'';

export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('refresh_token', refreshToken);

    await axios.post(KEYCLOAK_LOGOUT_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
