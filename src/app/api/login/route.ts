import { NextResponse } from 'next/server';
import axios from 'axios';

const KEYCLOAK_URL = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
const CLIENT_ID = process.env.CLIENT_ID??'';
const CLIENT_SECRET = process.env.CLIENT_SECRET??'';

export async function POST(req: Request) {
  const { username, password } = await req.json();
console.log({CLIENT_ID, CLIENT_SECRET, KEYCLOAK_URL, username, password});
  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);

    const { data } = await axios.post(KEYCLOAK_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return NextResponse.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.response?.data || error?.message }, { status: 401 });
  }
}
