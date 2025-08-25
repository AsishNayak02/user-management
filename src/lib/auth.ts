// lib/auth.js
import axios from 'axios';

const KEYCLOAK_INTROSPECT_URL =`${process.env.KEYCLOAK_BASE_URL}/realms/myrealm/protocol/openid-connect/introspect`;
const CLIENT_ID = process.env.CLIENT_ID??'';
const CLIENT_SECRET = process.env.CLIENT_SECRET??'';

export async function verifyAdminToken(token:string) {
  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('token', token);

    const { data } = await axios.post(KEYCLOAK_INTROSPECT_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!data.active) {
      return { valid: false, reason: 'Token inactive' };
    }

    // Check if 'admin' role is present
    if (data.realm_access?.roles?.includes('admin')) {
      return { valid: true };
    }

    return { valid: false, reason: 'User is not authorized for this action' };
  } catch (err:any) {
    console.error('Introspect error:', err.message);
    return { valid: false, reason: 'Token validation failed' };
  }
}
