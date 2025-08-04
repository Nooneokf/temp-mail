import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const issuer = 'urn:freecustomemail:issuer';
const audience = 'urn:freecustomemail:audience';

export async function sign(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime('2h')
    .sign(secret);
}

export async function verify(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer,
      audience,
      algorithms: ['HS256']
    });
    return payload;
  } catch (e) {
    return null;
  }
}