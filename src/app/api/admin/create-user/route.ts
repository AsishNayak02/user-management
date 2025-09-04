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
    try {
        console.log("Getting admin token...");
        console.log("Environment variables check:", {
            KEYCLOAK_BASE_URL: process.env.KEYCLOAK_BASE_URL ? "Set" : "Missing",
            KEYCLOAK_REALM: process.env.KEYCLOAK_REALM ? "Set" : "Missing",
            CLIENT_ID: process.env.CLIENT_ID ? "Set" : "Missing",
            ADMIN_USERNAME: process.env.ADMIN_USERNAME ? "Set" : "Missing",
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "Set" : "Missing",
            CLIENT_SECRET: process.env.CLIENT_SECRET ? "Set" : "Missing"
        });

        const tokenUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
        console.log("Token URL:", tokenUrl);

        const params = new URLSearchParams();
        params.append("client_id", process.env.CLIENT_ID!);
        params.append("username", process.env.ADMIN_USERNAME!);
        params.append("password", process.env.ADMIN_PASSWORD!);
        params.append("client_secret", process.env.CLIENT_SECRET!);
        params.append("grant_type", "password");

        const response = await axios.post(tokenUrl, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        console.log("Token response status:", response.status);
        return response.data.access_token;
    } catch (error: any) {
        console.error("Error getting admin token:", error);
        console.error("Token error details:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        throw error;
    }
}

export async function POST(req: Request) {
    try {
        console.log("Starting user creation process...");

        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            console.error("Missing Authorization header");
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }
        console.log("Using authorization header from request");

        const requestBody = await req.json();
        console.log("Request body:", requestBody);

        const { username, email, password, organization, group, firstName, lastName } = requestBody;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName) {
            console.error("Missing required fields:", { username, email, password, firstName, lastName });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const groupID = '979482d9-31af-4977-bd66-e5ec73cc4586';
        const organizationID = '8a6e7ea2-8880-40de-9c74-9b4fe6b43b9f';

        console.log(`Attempting to create user: ${username}`);
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
                    "organization": [organization],
                    "groups": [group],
                },
            },
            { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } });
        console.log("User creation API call successful.");
        const newUserId = (await axios.get(`${KEYCLOAK_ADMIN_URL}/users?q=username:${username}`, { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } })).data[0].id; console.log(`Extracted new user ID: ${newUserId}`);
        console.log(`Attempting to add user ${newUserId} to organization ${organizationID} and group ${groupID}`);
        
        // Try to add to organization and group, but don't fail if they don't exist
        try {
            await Promise.all([
                // Add to Organization
                axios.post(
                    `${KEYCLOAK_ADMIN_URL}/organizations/${organizationID}/members`, newUserId,
                    { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
                ).catch(orgError => {
                    console.warn("Could not add user to organization:", orgError.response?.data || orgError.message);
                    return null; // Don't fail the entire operation
                }),
                // Add to Group
                axios.put(
                    `${KEYCLOAK_ADMIN_URL}/users/${newUserId}/groups/${groupID}`,
                    {}, // An empty body is required for this call
                    { headers: { Authorization: authHeader } }
                ).catch(groupError => {
                    console.warn("Could not add user to group:", groupError.response?.data || groupError.message);
                    return null; // Don't fail the entire operation
                }),
            ]);
            console.log("Successfully added user to organization and group.");
        } catch (error) {
            console.warn("Some organization/group assignments failed, but user was created:", error);
        }
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
