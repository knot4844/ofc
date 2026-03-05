import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    // 데모 로그인 (비회원 데모) 처리 체크
    const isDemoUser = request.cookies.get("noado_demo_mode")?.value === "true";

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    const isPublic = pathname === "/" || pathname === "/login" || pathname.startsWith("/auth/callback") || pathname.startsWith("/api/");
    const isTenantOnly = pathname.startsWith("/tenant-portal");
    const isLandlordOnly =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tenants") ||
        pathname.startsWith("/payments") ||
        pathname.startsWith("/billing") ||
        pathname.startsWith("/invoices") ||
        pathname.startsWith("/reports") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/master-admin");

    // 데모 유저는 예외적으로 허용
    if (isDemoUser) {
        if (pathname === "/login") {
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    if (!user && !isPublic) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user) {
        const role = user.user_metadata?.role || "LANDLORD";

        if (role === "TENANT" && isLandlordOnly) {
            url.pathname = "/tenant-portal";
            return NextResponse.redirect(url);
        }

        if (role === "LANDLORD" && isTenantOnly) {
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }

        if (pathname === "/login") {
            url.pathname = role === "TENANT" ? "/tenant-portal" : "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
