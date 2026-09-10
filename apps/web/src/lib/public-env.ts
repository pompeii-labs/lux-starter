import { env } from '$env/dynamic/public';

type PublicEnvName =
    | 'PUBLIC_API_URL'
    | 'PUBLIC_LUX_PUBLISHABLE_KEY'
    | 'PUBLIC_LUX_URL';

export function requirePublicEnv(name: PublicEnvName): string {
    const value = env[name];
    if (!value) throw new Error(`${name} is required`);
    return value;
}
