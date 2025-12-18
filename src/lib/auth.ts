import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "./supabase"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Fetch admin from Supabase
                const { data: admin, error } = await supabase
                    .from("admins")
                    .select("*")
                    .eq("email", credentials.email)
                    .single()

                if (error || !admin) {
                    return null
                }

                // Simple password comparison (no hashing)
                if (credentials.password !== admin.password_hash) {
                    return null
                }

                return {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
}
