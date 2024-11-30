import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-me')

export async function sign(payload: any): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 // 1 hour expiration

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(secret)
}

export async function verify(token: string): Promise<any> {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
  })
  return payload
}

