export const AuthRoutes = {
	signup: '/(auth)/signup',
	postSignup: '/(protected)/account',
	login: '/(auth)/login',
	postLogin: '/(protected)/account',
} as const;
