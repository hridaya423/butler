import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const emailEncrypted = encrypt(email);
        const passwordEncrypted = encrypt(password);

        const { error } = await supabase.from("teams_profiles").upsert(
            {
                user_id: user.id,
                email_encrypted: emailEncrypted,
                password_encrypted: passwordEncrypted,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
        );

        if (error) {
            return NextResponse.json(
                { error: "Failed to save credentials" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Teams connected successfully",
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to connect Teams" },
            { status: 500 }
        );
    }
}
