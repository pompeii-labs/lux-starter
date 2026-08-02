import { describe, expect, test } from 'bun:test';
import { isPrivateIPv4 } from './local-network';

describe('Lux Lab device host validation', () => {
	test.each([
		'10.0.0.1',
		'10.255.255.254',
		'172.16.0.1',
		'172.31.255.254',
		'192.168.1.50'
	])('accepts RFC1918 address %s', (address) => {
		expect(isPrivateIPv4(address)).toBe(true);
	});

	test.each([
		'127.0.0.1',
		'169.254.1.1',
		'172.32.0.1',
		'192.169.1.1',
		'8.8.8.8',
		'10.0.0.256',
		'not-an-address'
	])('rejects non-RFC1918 address %s', (address) => {
		expect(isPrivateIPv4(address)).toBe(false);
	});
});
