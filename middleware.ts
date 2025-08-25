// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//     const token = request.cookies.get('access_token')?.value;
//     console.log("Hey")
//     if (!token) {
//         return NextResponse.redirect(new URL('/Login', request.url));
//     }

//     // Optionally verify token here using a lightweight JWT lib
//     return NextResponse.next();
// }

// export const config = {
//     matcher: ['/Dashboard/:path*'], // Protect these routes
// };
