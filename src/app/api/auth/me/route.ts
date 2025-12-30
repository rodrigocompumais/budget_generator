import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth-service';
import { getTokenFromCookies } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserFromToken(token);

    if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
        id: user.id,
        email: user.email,
        displayName: user.display_name
    });
}
