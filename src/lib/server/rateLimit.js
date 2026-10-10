import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const BURST = { limit: 5, windowMs: 60 * 1000 };
const DAILY = { limit: 30, windowMs: 24 * 60 * 60 * 1000 };
const DEFAULT_GLOBAL_DAILY = 500;

function globalDailyLimit() {
	const n = Number(env.CHAT_GLOBAL_DAILY_LIMIT);
	return Number.isInteger(n) && n > 0 ? n : DEFAULT_GLOBAL_DAILY;
}

/** @type {{ burst: Ratelimit, daily: Ratelimit, global: Ratelimit } | null | undefined} */
let limiters;

/** Builds the Upstash limiters once; returns null if Redis isn't configured. */
function getLimiters() {
	if (limiters !== undefined) return limiters;

	// The Vercel Marketplace integration may inject either set of names.
	const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
	const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
	if (!url || !token) {
		limiters = null;
		return limiters;
	}

	const redis = new Redis({ url, token });
	limiters = {
		burst: new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(BURST.limit, '1 m'),
			prefix: 'rl:chat:burst'
		}),
		daily: new Ratelimit({
			redis,
			limiter: Ratelimit.fixedWindow(DAILY.limit, '1 d'),
			prefix: 'rl:chat:daily'
		}),
		global: new Ratelimit({
			redis,
			limiter: Ratelimit.fixedWindow(globalDailyLimit(), '1 d'),
			prefix: 'rl:chat:global'
		})
	};
	return limiters;
}

/** @type {Map<string, { count: number, resetAt: number }>} */
const memoryCounters = new Map();

/**
 * Dev-only fixed-window counter, used when Redis isn't configured locally.
 * @param {string} key
 * @param {number} limit
 * @param {number} windowMs
 */
function memoryHit(key, limit, windowMs) {
	const now = Date.now();
	let entry = memoryCounters.get(key);
	if (!entry || entry.resetAt <= now) {
		entry = { count: 0, resetAt: now + windowMs };
		memoryCounters.set(key, entry);
	}
	entry.count += 1;
	return { success: entry.count <= limit, reset: entry.resetAt };
}

/**
 * @typedef {{ ok: true } | { ok: false, status: 429 | 503, message: string, retryAfter?: number }} RateLimitResult
 */

/**
 * Per-IP burst and daily limits, then a global daily cap. The global cap is only
 * consumed by requests that passed the per-IP checks.
 * @param {string} ip
 * @returns {Promise<RateLimitResult>}
 */
export async function checkRateLimit(ip) {
	const redisLimiters = getLimiters();

	try {
		if (redisLimiters) {
			return await runChecks(ip, {
				burst: (key) => redisLimiters.burst.limit(key),
				daily: (key) => redisLimiters.daily.limit(key),
				global: (key) => redisLimiters.global.limit(key)
			});
		}

		if (!dev) {
			// Fail closed: a missing Redis config must not silently disable the cost protection.
			console.error('Rate limiting unavailable: Upstash Redis env vars are not set');
			return { ok: false, status: 503, message: 'Chat is temporarily unavailable.' };
		}

		return await runChecks(ip, {
			burst: async (key) => memoryHit(`burst:${key}`, BURST.limit, BURST.windowMs),
			daily: async (key) => memoryHit(`daily:${key}`, DAILY.limit, DAILY.windowMs),
			global: async (key) => memoryHit(`global:${key}`, globalDailyLimit(), DAILY.windowMs)
		});
	} catch (err) {
		console.error('Rate limit check failed', err);
		return { ok: false, status: 503, message: 'Chat is temporarily unavailable.' };
	}
}

/**
 * @typedef {(key: string) => Promise<{ success: boolean, reset: number }>} Check
 */

/**
 * @param {string} ip
 * @param {{ burst: Check, daily: Check, global: Check }} checks
 * @returns {Promise<RateLimitResult>}
 */
async function runChecks(ip, checks) {
	const burst = await checks.burst(ip);
	if (!burst.success) return denied(burst.reset, 'Too many requests. Please slow down.');

	const daily = await checks.daily(ip);
	if (!daily.success) return denied(daily.reset, "You've reached today's question limit.");

	const global = await checks.global('all');
	if (!global.success) return denied(global.reset, 'The chat is busy right now. Try again later.');

	return { ok: true };
}

/**
 * @param {number} resetAt epoch ms when the window resets
 * @param {string} message
 * @returns {RateLimitResult}
 */
function denied(resetAt, message) {
	const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
	return { ok: false, status: 429, message, retryAfter };
}
