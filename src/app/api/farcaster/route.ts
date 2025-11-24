import {NextRequest, NextResponse} from "next/server";
import {getNeynarUser} from "~/lib/neynar";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get('fid');

    if (!fidParam) {
        return NextResponse.json(
            { error: 'Missing fid parameter' },
            { status: 400 }
        );
    }

    const fid = Number(fidParam);
    if (!Number.isFinite(fid)) {
        return NextResponse.json(
            { error: 'Invalid fid parameter' },
            { status: 400 }
        );
    }

    try {
        const user = await getNeynarUser(fid);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                fid: user.fid,
                username: user.username,
                display_name: user.display_name,
                pfp_url: user.pfp_url,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500}
        );
    }
}