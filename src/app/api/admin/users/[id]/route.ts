// app/api/admin/users/[id]/route.ts
"use server";
import { NextResponse } from 'next/server';
import axios from 'axios';

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { username, email, firstName, lastName, organization, group } = await req.json();

        const updateData = {
            username,
            email,
            firstName,
            lastName,
            attributes: {
                organization: organization,
                groups: group,
            },
        };

        await axios.put(
            `${KEYCLOAK_ADMIN_URL}/${id}`,
            updateData,
            { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
        );

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (err: any) {
        return NextResponse.json({ 
            error: err.response?.data?.errorMessage || err.message || 'Internal server error',
            details: err.response?.data
        }, { status: err.response?.status || 500 });
    }
}

export async function DELETE(req: Request,{ params }: { params: Promise<{ id: string }> }) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    try {
        const { id } = await params;
        await axios.delete(
            `${KEYCLOAK_ADMIN_URL}/${id}`,
            { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
        );

        return NextResponse.json({ message: 'User Deleted successfully' });
    } catch (err: any) {
        return NextResponse.json({ 
            error: err.response?.data?.errorMessage || err.message || 'Internal server error',
            details: err.response?.data
        }, { status: err.response?.status || 500 });
    }
}
