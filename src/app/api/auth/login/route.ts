import { authApiRequest } from "@/configs/apiUrl/authApi";
import { LoginBodyType } from "@/schema/auth";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'
import { HttpError } from "@/core/error";

export async function POST(requesst: Request) {
    const body = (await requesst.json()) as LoginBodyType;
    const cookieStore = cookies()
    try {
        const { payload } = await authApiRequest.s_Login(body)
        const { accessToken, refreshToken } = payload.data
        const decodeAccessToken = jwt.decode(accessToken) as {exp: number}
        const decodeRefreshToken = jwt.decode(refreshToken) as {exp: number}

        cookieStore.set('accessToken', accessToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            expires: decodeAccessToken.exp * 1000
        })

        cookieStore.set('refreshToken', refreshToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            expires: decodeRefreshToken.exp * 1000
        })

        return Response.json(payload)
    } catch (error) {
        if (error instanceof HttpError) {
            return Response.json(error.payload, {
                status: error.status
            })
        } else {
            return Response.json({
                message: 'Internal Server Error',
                status: 500
            })
        }
    }
}