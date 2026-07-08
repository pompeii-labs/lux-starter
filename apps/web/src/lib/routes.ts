export const AuthRoutes = {
	signup: '/(auth)/signup',
	postSignup: '/(protected)/account',
	login: '/(auth)/login',
	postLogin: '/(protected)/account',
	resetPassword: '/(auth)/forgot-password',
	signout: '/(auth)/signout',
} as const;

export const ProtectedSlugs = [
	//marketing routes

	// auth routes
	'callback',
	'confirm',
	'forgot-password',
	'login',
	'oauth',
	'signup',
	'update-password',
	// protected routes
	'account',
	'teams'
];
