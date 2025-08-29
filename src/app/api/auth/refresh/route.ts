import { NextResponse } from 'next/server';
import axios from 'axios';

const KEYCLOAK_URL = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
const CLIENT_ID = process.env.CLIENT_ID??'';
const CLIENT_SECRET = process.env.CLIENT_SECRET??'';

export async function POST(req: Request) {
  const { refreshToken } = await req.json();
  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken); 

    const { data } = await axios.post(KEYCLOAK_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const response = NextResponse.json(
      { message: 'Session Updated Successfully', accessToken: data.access_token, refreshToken: data.refresh_token }, 
      { status: 200 }
    );
    
    response.cookies.set('AccessToken', data.access_token, { path: '/' });
    response.cookies.set('RefreshToken', data.refresh_token, { path: '/' });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.response?.data || error?.message }, { status: 401 });
  }
}
