import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { username, password, schoolId, schoolName, useDefaultSchool } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        const encryptedUsername = encrypt(username);
        const encryptedPassword = encrypt(password);

        const { error } = await supabase.from("sparx_profiles").upsert(
            {
                user_id: user.id,
                encrypted_username: encryptedUsername,
                encrypted_password: encryptedPassword,
                school_id: schoolId,
                school_name: schoolName,
                use_default_school: useDefaultSchool || false,
                created_at: new Date().toISOString(),
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

        const syncResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/sync/sparx`,
            {
                method: "POST",
                headers: {
                    Cookie: req.headers.get("cookie") || "",
                },
            }
        );

        if (!syncResponse.ok) {
            await supabase
                .from("sparx_profiles")
                .delete()
                .eq("user_id", user.id);

            const syncError = await syncResponse.json();
            return NextResponse.json(
                { error: syncError.error || "Failed to verify credentials" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Sparx connected successfully",
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to connect Sparx" },
            { status: 500 }
        );
    }
}
