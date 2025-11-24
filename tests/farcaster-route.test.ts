import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../src/app/api/farcaster/route";
import { getNeynarUser } from "~/lib/neynar";

vi.mock("~/lib/neynar", () => ({
    getNeynarUser: vi.fn(),
}));

function createRequest(url: string): any {
    return { url } as any;
}

describe("GET /api/user (Neynar user)", () => {
    const mockedGetNeynarUser = getNeynarUser as unknown as vi.Mock;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 if fid parameter is missing", async () => {
        const req = createRequest("https://example.com/api/user");
        const res = await GET(req);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: "Missing fid parameter" });
    });

    it("returns 400 if fid parameter is not a valid number", async () => {
        const req = createRequest("https://example.com/api/user?fid=abc");
        const res = await GET(req);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: "Invalid fid parameter" });
    });

    it("returns 404 if user is not found", async () => {
        mockedGetNeynarUser.mockResolvedValueOnce(null);

        const req = createRequest("https://example.com/api/user?fid=123");
        const res = await GET(req);

        expect(mockedGetNeynarUser).toHaveBeenCalledWith(123);
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body).toEqual({ error: "User not found" });
    });

    it("returns 200 and user data when user is found", async () => {
        const user = {
            fid: 123,
            username: "testuser",
            display_name: "Test User",
            pfp_url: "https://example.com/pfp.png",
        };
        mockedGetNeynarUser.mockResolvedValueOnce(user);

        const req = createRequest("https://example.com/api/user?fid=123");
        const res = await GET(req);

        expect(mockedGetNeynarUser).toHaveBeenCalledWith(123);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body).toEqual({
            fid: user.fid,
            username: user.username,
            display_name: user.display_name,
            pfp_url: user.pfp_url,
        });
    });

    it("returns 500 if getNeynarUser throws", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        mockedGetNeynarUser.mockRejectedValueOnce(new Error("Neynar down"));

        const req = createRequest("https://example.com/api/user?fid=123");
        const res = await GET(req);

        expect(mockedGetNeynarUser).toHaveBeenCalledWith(123);
        expect(res.status).toBe(500);

        const body = await res.json();
        expect(body).toEqual({ error: "Failed to fetch user" });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
