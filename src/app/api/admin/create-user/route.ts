// app/api/admin/create-user/route.js
"use server";
import { NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';


interface DecodedUserToken {
    organization: string[];
}

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;
async function getAdminToken() {
    const tokenUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID!);
    params.append("username", process.env.ADMIN_USERNAME!);
    params.append("password", process.env.ADMIN_PASSWORD!);
    params.append("client_secret", process.env.CLIENT_SECRET!);
    params.append("grant_type", "password");

    const { data } = await axios.post(tokenUrl, params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return data.access_token;
}

export async function POST(req: Request) {
    const authHeader = await getAdminToken();
    console.log({ authHeader })
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const { username, email, password, organization, group } = await req.json();
    const groupID = '979482d9-31af-4977-bd66-e5ec73cc4586';
    const organizationID = '8a6e7ea2-8880-40de-9c74-9b4fe6b43b9f';


    try {
        console.log(`Attempting to create user: ${username}`);
        const createUserResponse =        await axios.post(
            `${KEYCLOAK_ADMIN_URL}/users`,
            {
                "username": username,
                "email": email,
                "firstName": username,
                "lastName": username,
                "enabled": true,
                "emailVerified": true,
                "credentials": [
                    {
                        "type": "password",
                        "value": password,
                        "temporary": false
                    }
                ],
                "attributes": {
                    "organization": organization,
                    "groups": group,
                },
            },
            { headers: { Authorization: `Bearer ${authHeader}`, 'Content-Type': 'application/json' } }
        );
        console.log("User creation API call successful.");
        const newUserId = (await axios.get(`${KEYCLOAK_ADMIN_URL}/users?q=username:${username}`,{ headers: { Authorization: `Bearer ${authHeader}`, 'Content-Type': 'application/json' } })).data[0].id;
         console.log(`Extracted new user ID: ${newUserId}`);
         console.log(`Attempting to add user ${newUserId} to organization ${organizationID} and group ${groupID}`);
        await Promise.all([
            // Add to Organization
            axios.post(
                `${KEYCLOAK_ADMIN_URL}/organizations/${organizationID}/members`,newUserId,
                 // No request body is needed for this call
                { headers: { Authorization: `Bearer ${authHeader}`,'Content-Type': 'application/json' } }
            ),
            // Add to Group
            axios.put(
                `${KEYCLOAK_ADMIN_URL}/users/${newUserId}/groups/${groupID}`,
                {}, // An empty body is required for this call
                { headers: { Authorization: `Bearer ${authHeader}` } }
            ),
        ]);
        console.log("Successfully added user to organization and group.");
        return NextResponse.json({ message: 'User created successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: err.response?.status || 400 });
    }
}
