import { NextRequest, NextResponse } from 'next/server';
import { getVisualSettings, saveVisualSettings } from '@/lib/visual-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getTokenFromCookies } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    const user = token ? getUserFromToken(token) : null;

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let settings = await getVisualSettings(user.id);

    // Default settings if none found
    if (!settings) {
        settings = {
            userId: user.id,
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            accentColor: '#10b981',
            fontFamily: 'Inter',
        };
    }

    return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    const user = token ? getUserFromToken(token) : null;

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const success = await saveVisualSettings({
        ...data,
        userId: user.id
    });

    if (success) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
