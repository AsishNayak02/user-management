// app/api/admin/create-user/route.js
"use server";
import { NextResponse } from 'next/server';
import axios from 'axios';

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/myrealm`;
async function getAdminToken() {
    const tokenUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/myrealm/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID!);
    params.append("client_secret", process.env.CLIENT_SECRET!);
    params.append("grant_type", "client_credentials");

    const { data } = await axios.post(tokenUrl, params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log({"accessToken": data.access_token});

    return data.access_token;
}

export async function DELETE(req: Request,{ params }: { params: { id: string } }) {
    const authHeader = await getAdminToken();
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    try {
        await axios.delete(
            `${KEYCLOAK_ADMIN_URL}/users/${params.id}`,
            { headers: { Authorization: `Bearer ${authHeader}`, 'Content-Type': 'application/json' } }
        );

        return NextResponse.json({ message: 'User Deleted successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: err.response?.status || 400 });
    }
}
