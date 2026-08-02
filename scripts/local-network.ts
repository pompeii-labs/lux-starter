import { networkInterfaces } from 'node:os';

export function isPrivateIPv4(address: string): boolean {
	const octets = address.split('.');
	if (octets.length !== 4 || octets.some((octet) => !/^\d+$/.test(octet))) return false;
	const [first, second] = octets.map(Number);
	if (octets.some((octet) => Number(octet) > 255)) return false;
	return first === 10 ||
		(first === 192 && second === 168) ||
		(first === 172 && second >= 16 && second <= 31);
}

export function privateIPv4(): string {
	const configured = process.env.LUX_LAB_DEVICE_HOST?.trim();
	if (configured) {
		if (!isPrivateIPv4(configured)) {
			throw new Error('LUX_LAB_DEVICE_HOST must be an RFC1918 private IPv4 address');
		}
		return configured;
	}
	const candidates = Object.values(networkInterfaces())
		.flatMap((addresses) => addresses ?? [])
		.filter((address) => address.family === 'IPv4' && !address.internal)
		.map((address) => address.address);
	const privateAddress = candidates.find(isPrivateIPv4);
	if (!privateAddress) {
		throw new Error('No private LAN IPv4 address found; set LUX_LAB_DEVICE_HOST explicitly');
	}
	return privateAddress;
}
