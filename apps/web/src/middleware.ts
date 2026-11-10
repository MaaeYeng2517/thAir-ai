import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach((cookie: any) => request.cookies.set(cookie.name, cookie.value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach((cookie: any) =>
            supabaseResponse.cookies.set(cookie.name, cookie.value, cookie.options)
          )
        },
      },
    }
  ) as any

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isProtected = pathname.startsWith("/dashboard")
  const isAuthRoute = pathname.startsWith("/auth/")
  const isCallback = pathname.startsWith("/auth/callback")

  if (isProtected && !user) {
    url.pathname = "/auth/signin"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && !isCallback && user) {
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
