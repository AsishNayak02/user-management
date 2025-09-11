// app/api/admin/create-user/route.js
"use server";
import { NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';


interface DecodedUserToken {
    organization: string[];
}

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;

export async function POST(req: Request) {
    try {

        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            console.error("Missing Authorization header");
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const requestBody = await req.json();

        const { username, email, password, organization, group, firstName, lastName } = requestBody;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName || !organization || !group) {
            console.error("Missing required fields:", { username, email, password, firstName, lastName, organization, group });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const createUserResponse = await axios.post(
            `${KEYCLOAK_ADMIN_URL}/users`,
            {
                "username": username,
                "email": email,
                "firstName": firstName,
                "lastName": lastName,
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
                    "organization": [organization], // Store the name, not ID
                    "groups": [group], // Store the name, not ID
                },
            },
            { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } });
        const newUserId = (await axios.get(`${KEYCLOAK_ADMIN_URL}/users?q=username:${username}`, { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } })).data[0].id; 
        return NextResponse.json({ message: 'User created successfully' });
    } catch (err: any) {
        console.error("Error in user creation:", err);
        console.error("Error details:", {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data
        });

        return NextResponse.json({
            error: err.response?.data?.errorMessage || err.message || 'Internal server error',
            details: err.response?.data
        }, { status: err.response?.status || 500 });
    }
}
