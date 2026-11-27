<script lang="ts">
	import { onMount } from 'svelte';

	type LoginResponse = {
		user?: {
			displayName?: unknown;
			username?: unknown;
		};
	};

	type CsrfResponse = { csrfToken?: unknown };
	type SessionResponse = { displayName?: unknown; globalScope?: unknown; permissions?: unknown };

	class HttpResponseError extends Error {
		readonly requestId: string | null;

		constructor(message: string, requestId: string | null) {
			super(message);
			this.requestId = requestId;
		}
	}

	function readRequestId(response: Response): string | null {
		const requestId = response.headers.get('x-request-id');
		return requestId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
			? requestId
			: null;
	}

	let username = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let currentUser = $state<string | null>(null);
	let canManageUsers = $state(false);
	let canManageOrganization = $state(false);
	let checkingSession = $state(true);
	let submitting = $state(false);
	let retryAfterSeconds = $state(0);
	let theme = $state<'light' | 'dark'>('dark');
	let message = $state('');
	let messageKind = $state<'error' | 'success' | 'info'>('info');
	let retryTimer: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		let storedTheme: string | null = null;
		try { storedTheme = window.localStorage.getItem('dompis-theme'); } catch { /* Storage may be disabled by browser policy. */ }
		const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
		applyTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemPrefersLight ? 'light' : 'dark');
		void checkSession();
		return () => clearRetryTimer();
	});

	function applyTheme(nextTheme: 'light' | 'dark'): void {
		theme = nextTheme;
		document.documentElement.dataset.theme = nextTheme;
		const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
		if (themeColor) themeColor.content = nextTheme === 'light' ? '#FFFFFF' : '#101220';
	}

	function toggleTheme(): void {
		const nextTheme = theme === 'dark' ? 'light' : 'dark';
		try { window.localStorage.setItem('dompis-theme', nextTheme); } catch { /* Theme still changes for this page view. */ }
		applyTheme(nextTheme);
	}

	function clearRetryTimer(): void {
		if (retryTimer !== undefined) clearInterval(retryTimer);
		retryTimer = undefined;
	}

	function startRetryCountdown(response: Response): void {
		const retryAfter = Number(response.headers.get('retry-after'));
		if (!Number.isInteger(retryAfter) || retryAfter < 1) return;

		clearRetryTimer();
		retryAfterSeconds = Math.min(retryAfter, 900);
		message = 'Terlalu banyak percobaan masuk. Tunggu sebelum mencoba kembali.';
		messageKind = 'error';
		retryTimer = setInterval(() => {
			if (retryAfterSeconds <= 1) {
				clearRetryTimer();
				retryAfterSeconds = 0;
				message = 'Waktu tunggu selesai. Anda dapat mencoba kembali.';
				messageKind = 'info';
				return;
			}
			retryAfterSeconds -= 1;
		}, 1000);
	}

	async function checkSession(): Promise<void> {
		try {
			const response = await fetch('/auth/me', {
				credentials: 'same-origin',
				cache: 'no-store'
			});
			if (response.ok) {
				const payload = await response.json() as SessionResponse;
				currentUser = typeof payload.displayName === 'string' && payload.displayName.trim().length > 0
					? payload.displayName
					: 'Pengguna DOMPIS';
				canManageUsers = payload.globalScope === true && Array.isArray(payload.permissions) && payload.permissions.includes('users.manage');
				canManageOrganization = payload.globalScope === true && Array.isArray(payload.permissions) && payload.permissions.includes('organization.manage');
			}
			else if (response.status >= 500) {
				const requestId = readRequestId(response);
				messageKind = 'error';
				message = requestId
					? `Layanan autentikasi belum tersedia. Referensi: ${requestId}.`
					: 'Layanan autentikasi belum tersedia. Coba lagi beberapa saat.';
			}
		} catch {
			messageKind = 'error';
			message = 'Layanan autentikasi belum dapat dijangkau. Form masuk tetap tersedia.';
		} finally {
			checkingSession = false;
		}
	}

	async function requestCsrfToken(): Promise<string> {
		const response = await fetch('/auth/csrf', {
			credentials: 'same-origin',
			cache: 'no-store'
		});
		if (!response.ok) throw new HttpResponseError('csrf_unavailable', readRequestId(response));
		const payload = await response.json() as CsrfResponse;
		if (typeof payload.csrfToken !== 'string' || payload.csrfToken.length !== 43) {
			throw new Error('csrf_invalid');
		}
		return payload.csrfToken;
	}

	async function submitLogin(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (submitting || retryAfterSeconds > 0) return;

		submitting = true;
		message = '';
		let requestId: string | null = null;
		try {
			const csrfToken = await requestCsrfToken();
			const response = await fetch('/auth/login', {
				method: 'POST',
				credentials: 'same-origin',
				cache: 'no-store',
				headers: {
					'content-type': 'application/json',
					'x-csrf-token': csrfToken
				},
				body: JSON.stringify({ username: username.trim(), password })
			});
			requestId = readRequestId(response);

			if (response.status === 401) {
				messageKind = 'error';
				message = 'Username atau password tidak sesuai.';
				return;
			}
			if (response.status === 403) {
				messageKind = 'error';
				message = 'Permintaan tidak dapat diverifikasi. Muat ulang halaman lalu coba lagi.';
				return;
			}
			if (response.status === 429) {
				startRetryCountdown(response);
				if (retryAfterSeconds === 0) {
					messageKind = 'error';
					message = 'Terlalu banyak percobaan masuk. Tunggu beberapa saat sebelum mencoba lagi.';
				}
				return;
			}
			if (!response.ok) throw new Error('login_unavailable');

			const payload = await response.json() as LoginResponse;
			const displayName = payload.user?.displayName;
			currentUser = typeof displayName === 'string' && displayName.trim().length > 0
				? displayName
				: 'Pengguna DOMPIS';
			await loadUserCapabilities();
			password = '';
			showPassword = false;
			messageKind = 'success';
			message = 'Sesi DOMPIS Anda sudah aktif.';
		} catch (error: unknown) {
			messageKind = 'error';
			const failureRequestId = error instanceof HttpResponseError ? error.requestId : requestId;
			message = failureRequestId
				? `Layanan masuk belum dapat dijangkau. Coba lagi beberapa saat. Referensi: ${failureRequestId}.`
				: 'Layanan masuk belum dapat dijangkau. Coba lagi beberapa saat.';
		} finally {
			submitting = false;
		}
	}

	async function loadUserCapabilities(): Promise<void> {
		try {
			const response = await fetch('/auth/me', { credentials: 'same-origin', cache: 'no-store' });
			if (!response.ok) return;
			const payload = await response.json() as SessionResponse;
			canManageUsers = payload.globalScope === true && Array.isArray(payload.permissions) && payload.permissions.includes('users.manage');
			canManageOrganization = payload.globalScope === true && Array.isArray(payload.permissions) && payload.permissions.includes('organization.manage');
		} catch { canManageUsers = false; canManageOrganization = false; }
	}

	async function logout(): Promise<void> {
		if (submitting) return;
		submitting = true;
		message = '';
		let requestId: string | null = null;
		try {
			const csrfToken = await requestCsrfToken();
			const response = await fetch('/auth/logout', {
				method: 'POST',
				credentials: 'same-origin',
				cache: 'no-store',
				headers: { 'x-csrf-token': csrfToken }
			});
			requestId = readRequestId(response);
			if (!response.ok) throw new Error('logout_failed');
			currentUser = null;
			canManageUsers = false;
			canManageOrganization = false;
			username = '';
			password = '';
			showPassword = false;
			messageKind = 'success';
			message = 'Anda sudah keluar dari DOMPIS.';
		} catch (error: unknown) {
			messageKind = 'error';
			const failureRequestId = error instanceof HttpResponseError ? error.requestId : requestId;
			message = failureRequestId
				? `Sesi belum dapat ditutup. Periksa koneksi lalu coba lagi. Referensi: ${failureRequestId}.`
				: 'Sesi belum dapat ditutup. Periksa koneksi lalu coba lagi.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Masuk · DOMPIS</title>
	<meta name="description" content="Masuk ke ruang kerja DOMPIS." />
	<meta name="page-type" content="software" />
	<meta name="site-kind" content="software" />
	<meta name="theme-color" content="#101220" />
</svelte:head>

<a class="skip-link" href="#login-panel">Lewati ke form masuk</a>

<main class="page-shell">
	<section class="introduction" aria-labelledby="page-title">
		<a class="wordmark" href="/" aria-label="DOMPIS, halaman masuk">
			<span class="brand-mark" aria-hidden="true">D</span>
			<span>DOMPIS</span>
		</a>

		<div class="intro-copy">
			<p class="eyebrow"><span></span> RUANG KERJA OPERASIONAL</p>
			<h1 id="page-title">Pantau ticket dan work order dalam satu ruang kerja.</h1>
			<p class="intro-description">
				Masuk dengan akun DOMPIS Anda. Informasi yang tersedia mengikuti permission dan cakupan wilayah akun.
			</p>

			<div class="product-map" aria-label="Menu utama DOMPIS">
				<div class="map-heading">
					<span class="map-index">01—04</span>
					<span>MENU UTAMA</span>
				</div>
				<ul>
					<li><span>Ticket Management</span><span aria-hidden="true">01</span></li>
					<li><span>Semesta</span><span aria-hidden="true">02</span></li>
					<li><span>Rekap Workorder</span><span aria-hidden="true">03</span></li>
					<li><span>Detail WO HI</span><span aria-hidden="true">04</span></li>
				</ul>
			</div>
		</div>

		<footer class="page-footer">
			<span>DOMPIS</span>
			<span>Akses internal</span>
		</footer>
	</section>

	<section class="access-panel" id="login-panel" aria-labelledby="form-title">
		<div class="access-card">
			<div class="access-card-top">
				<span class="access-label">AKSES AKUN</span>
				<div class="access-actions">
					<button class="theme-toggle" type="button" onclick={toggleTheme} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}>
						{#if theme === 'dark'}<span aria-hidden="true">☼</span> Terang{:else}<span aria-hidden="true">◐</span> Gelap{/if}
					</button>
					<span class="access-indicator"><span></span> INTERNAL</span>
				</div>
			</div>

			{#if currentUser}
				<div class="signed-in" aria-live="polite">
					<div class="signed-icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none">
							<path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
					<p class="eyebrow">SESI TERVERIFIKASI</p>
					<h2 id="form-title">Selamat datang.</h2>
					<p class="user-name">{currentUser}</p>
					<p class="form-note">Akses ticket dan laporan tetap dibatasi oleh permission serta scope akun Anda.</p>
					{#if canManageUsers}
						<a class="primary-button" href="/admin/users">Kelola pengguna</a>
					{/if}
					{#if canManageOrganization}
						<a class="primary-button" href="/admin/organization">Kelola organisasi</a>
					{/if}
					<button class="primary-button" type="button" onclick={logout} disabled={submitting}>
						{#if submitting}Memproses…{:else}Keluar dari DOMPIS{/if}
					</button>
					{#if message}
						<p class="notice" class:notice-error={messageKind === 'error'} class:notice-success={messageKind === 'success'} role="status">{message}</p>
					{/if}
				</div>
			{:else}
				<div class="form-heading">
					<p class="eyebrow">SELAMAT DATANG</p>
					<h2 id="form-title">Masuk ke DOMPIS</h2>
					<p>Gunakan username dan password akun Anda.</p>
				</div>

				<form onsubmit={submitLogin} id="login-form">
					<label for="username">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						bind:value={username}
						autocomplete="username"
						maxlength="160"
						required
						disabled={submitting || checkingSession}
						placeholder="Masukkan username"
					/>

					<div class="password-label-row">
						<label for="password">Password</label>
						<span>Rahasia akun</span>
					</div>
					<div class="password-input-wrap">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							autocomplete="current-password"
							maxlength="1024"
							required
							disabled={submitting || checkingSession}
							placeholder="Masukkan password"
						/>
						<button
							class="password-toggle"
							type="button"
							aria-controls="password"
							aria-pressed={showPassword}
							aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
							disabled={submitting || checkingSession}
							onclick={() => showPassword = !showPassword}
						>
							{showPassword ? 'Sembunyi' : 'Lihat'}
						</button>
					</div>

					{#if message}
						<p class="notice" class:notice-error={messageKind === 'error'} class:notice-success={messageKind === 'success'} role={messageKind === 'error' ? 'alert' : 'status'}>
							{message}{#if retryAfterSeconds > 0}<span aria-hidden="true"> {retryAfterSeconds} detik</span>{/if}
						</p>
					{/if}

				<button class="primary-button" type="submit" disabled={submitting || checkingSession || retryAfterSeconds > 0 || !username || !password}>
						{#if checkingSession}Memeriksa sesi…{:else if submitting}Memverifikasi…{:else}Masuk ke ruang kerja{/if}
						<span aria-hidden="true">↗</span>
					</button>
				</form>

				<div class="support-note">
					<span class="support-rule" aria-hidden="true"></span>
					<p>Perlu bantuan akun? Hubungi administrator DOMPIS.</p>
				</div>
			{/if}
		</div>
		<p class="privacy-note">Jangan bagikan password atau gunakan perangkat bersama untuk menyimpan sesi.</p>
	</section>
</main>

<style>
	:global(:root) {
		--dompis-canvas: #101220;
		--dompis-surface: #181a29;
		--dompis-raised: #2a2f45;
		--dompis-text: #ffffff;
		--dompis-muted: #c5cad3;
		--dompis-red: #ad0e27;
		--dompis-red-deep: #750a1c;
		color-scheme: dark;
	}
	:global(:root[data-theme='light']) {
		--dompis-canvas: #ffffff;
		--dompis-surface: #c5cad3;
		--dompis-raised: #2a2f45;
		--dompis-text: #101220;
		--dompis-muted: #2a2f45;
		--dompis-red: #750a1c;
		--dompis-red-deep: #ad0e27;
		color-scheme: light;
	}
	:global(*) { box-sizing: border-box; }
	:global(html) { min-width: 320px; background: var(--dompis-canvas); }
	:global(body) {
		margin: 0;
		background: var(--dompis-canvas);
		color: var(--dompis-text);
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		font-size: 15px;
		-webkit-font-smoothing: antialiased;
	}
	:global(button), :global(input) { font: inherit; }
	:global(::selection) { background: var(--dompis-red-deep); color: var(--dompis-text); }

	.skip-link {
		position: fixed;
		z-index: 5;
		left: 16px;
		top: 12px;
		transform: translateY(-160%);
		padding: 12px 16px;
		border-radius: 6px;
		background: var(--dompis-red-deep);
		color: var(--dompis-text);
	}
	.skip-link:focus { transform: translateY(0); }

	.page-shell {
		min-height: 100svh;
		max-width: 1440px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
		background: var(--dompis-canvas);
		box-shadow: 0 0 0 1px rgba(197, 202, 211, 0.06);
	}
	.introduction {
		min-height: 100svh;
		padding: 40px clamp(28px, 6.4vw, 92px) 28px;
		display: flex;
		flex-direction: column;
		background: var(--dompis-canvas);
	}
	.wordmark {
		width: fit-content;
		display: inline-flex;
		align-items: center;
		gap: 11px;
		color: var(--dompis-text);
		font-size: 15px;
		font-weight: 750;
		letter-spacing: 0.105em;
		text-decoration: none;
	}
	.brand-mark {
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		border-radius: 7px;
		background: var(--dompis-red);
		color: var(--dompis-text);
		font-size: 17px;
		font-weight: 650;
		letter-spacing: -0.06em;
	}
	.intro-copy {
		width: min(100%, 620px);
		margin: auto 0;
		padding: 56px 0 64px;
		animation: enter 500ms ease-out both;
	}
	.eyebrow {
		margin: 0;
		color: var(--dompis-muted);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.13em;
	}
	.intro-copy > .eyebrow { display: flex; align-items: center; gap: 9px; }
	.intro-copy > .eyebrow span {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--dompis-red);
		box-shadow: 0 0 0 4px rgba(173, 14, 39, 0.28);
	}
	h1 {
		max-width: 590px;
		margin: 25px 0 18px;
		font-size: clamp(38px, 4.3vw, 58px);
		line-height: 1.07;
		font-weight: 590;
		letter-spacing: -0.055em;
	}
	.intro-description {
		max-width: 480px;
		margin: 0;
		color: var(--dompis-muted);
		font-size: 16px;
		line-height: 1.7;
	}
	.product-map {
		max-width: 500px;
		margin-top: 48px;
		border-top: 1px solid var(--dompis-raised);
	}
	.map-heading {
		padding: 15px 0 6px;
		display: flex;
		justify-content: space-between;
		color: var(--dompis-muted);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.12em;
	}
	.map-index { color: var(--dompis-red); font-variant-numeric: tabular-nums; }
	.product-map ul { margin: 0; padding: 0; list-style: none; }
	.product-map li {
		min-height: 43px;
		padding: 0 2px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--dompis-raised);
		color: var(--dompis-text);
		font-size: 13px;
	}
	.product-map li span:last-child {
		color: var(--dompis-muted);
		font-size: 10px;
		font-variant-numeric: tabular-nums;
	}
	.page-footer {
		padding-top: 18px;
		display: flex;
		justify-content: space-between;
		border-top: 1px solid var(--dompis-raised);
		color: var(--dompis-muted);
		font-size: 11px;
	}

	.access-panel {
		min-height: 100svh;
		padding: 32px clamp(22px, 5.8vw, 80px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--dompis-surface);
	}
	.access-card {
		width: min(100%, 440px);
		padding: clamp(26px, 3.2vw, 42px);
		border: 1px solid rgba(197, 202, 211, 0.2);
		border-radius: 10px;
		background: var(--dompis-raised);
		box-shadow: 0 18px 55px rgba(0, 0, 0, 0.3);
		animation: enter 550ms 60ms ease-out both;
	}
	.access-card-top {
		margin-bottom: 54px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.access-actions { display: flex; align-items: center; gap: 14px; }
	.theme-toggle {
		min-height: 44px;
		padding: 0 10px;
		border: 1px solid var(--dompis-muted);
		border-radius: 6px;
		background: var(--dompis-surface);
		color: var(--dompis-text);
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}
	.theme-toggle span { margin-right: 4px; }
	.theme-toggle:hover { border-color: var(--dompis-red); }
	.theme-toggle:focus-visible { outline: 2px solid var(--dompis-red); outline-offset: 2px; }
	.access-label, .access-indicator {
		color: var(--dompis-muted);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.12em;
	}
	.access-indicator { display: inline-flex; align-items: center; gap: 7px; color: var(--dompis-muted); }
	.access-indicator span { width: 6px; height: 6px; border-radius: 50%; background: var(--dompis-muted); }
	.form-heading .eyebrow { color: var(--dompis-text); }
	h2 {
		margin: 10px 0 8px;
		font-size: 28px;
		line-height: 1.15;
		font-weight: 620;
		letter-spacing: -0.04em;
	}
	.form-heading > p:last-child, .form-note {
		margin: 0;
		color: var(--dompis-muted);
		font-size: 14px;
		line-height: 1.6;
	}
	form { margin-top: 34px; }
	label {
		display: block;
		margin-bottom: 8px;
		color: var(--dompis-text);
		font-size: 13px;
		font-weight: 650;
	}
	input {
		width: 100%;
		min-height: 48px;
		padding: 0 14px;
		border: 1px solid rgba(197, 202, 211, 0.48);
		border-radius: 6px;
		outline: none;
		background: var(--dompis-surface);
		color: var(--dompis-text);
		font-size: 14px;
		transition: border-color 140ms ease, box-shadow 140ms ease;
	}
	.password-input-wrap { position: relative; }
	.password-input-wrap input { padding-right: 78px; }
	.password-toggle {
		position: absolute;
		top: 2px;
		right: 2px;
		min-width: 44px;
		min-height: 44px;
		padding: 0 7px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: var(--dompis-text);
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}
	.password-toggle:hover:not(:disabled) { background: var(--dompis-red-deep); }
	.password-toggle:focus-visible { outline: 2px solid var(--dompis-text); outline-offset: 1px; }
	.password-toggle:disabled { color: var(--dompis-muted); cursor: wait; }
	input::placeholder { color: var(--dompis-muted); }
	input:hover { border-color: var(--dompis-muted); }
	input:focus { border-color: var(--dompis-red); box-shadow: 0 0 0 3px rgba(173, 14, 39, 0.32); }
	input:disabled { background: var(--dompis-surface); color: var(--dompis-muted); }
	.password-label-row { margin-top: 22px; display: flex; justify-content: space-between; align-items: baseline; }
	.password-label-row span { color: var(--dompis-muted); font-size: 11px; }
	.primary-button {
		width: 100%;
		min-height: 48px;
		margin-top: 25px;
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1px solid var(--dompis-red);
		border-radius: 6px;
		background: var(--dompis-red);
		color: var(--dompis-text);
		font-size: 14px;
		font-weight: 650;
		cursor: pointer;
		transition: background 140ms ease, transform 140ms ease, box-shadow 140ms ease;
	}
	.primary-button:hover:not(:disabled) { background: var(--dompis-red-deep); box-shadow: 0 5px 14px rgba(0, 0, 0, 0.24); }
	.primary-button:active:not(:disabled) { transform: translateY(1px); }
	.primary-button:focus-visible { outline: 3px solid var(--dompis-muted); outline-offset: 3px; }
	.primary-button:disabled { opacity: 0.62; cursor: wait; }
	.primary-button span { font-size: 17px; font-weight: 400; }
	.support-note {
		margin-top: 28px;
		padding-top: 17px;
		display: grid;
		grid-template-columns: 22px 1fr;
		gap: 10px;
		border-top: 1px solid rgba(197, 202, 211, 0.2);
	}
	.support-rule { width: 18px; height: 1px; margin-top: 9px; background: var(--dompis-red); }
	.support-note p { margin: 0; color: var(--dompis-muted); font-size: 12px; line-height: 1.6; }
	.privacy-note { max-width: 440px; margin: 17px 0 0; color: var(--dompis-muted); font-size: 11px; line-height: 1.6; text-align: center; }
	.notice {
		margin: 16px 0 0;
		padding: 11px 12px;
		border: 1px solid var(--dompis-raised);
		border-radius: 6px;
		background: var(--dompis-surface);
		color: var(--dompis-muted);
		font-size: 13px;
		line-height: 1.5;
	}
	.notice-error { border-color: var(--dompis-red); background: var(--dompis-red-deep); color: var(--dompis-text); }
	.notice-success { border-color: var(--dompis-muted); background: var(--dompis-surface); color: var(--dompis-text); }
	.signed-in { padding-bottom: 4px; animation: enter 450ms ease-out both; }
	.signed-icon {
		width: 44px;
		height: 44px;
		margin-bottom: 27px;
		display: grid;
		place-items: center;
		border: 1px solid var(--dompis-muted);
		border-radius: 50%;
		background: var(--dompis-surface);
		color: var(--dompis-muted);
	}
	.signed-icon svg { width: 22px; height: 22px; }
	.user-name { margin: 0 0 10px; color: var(--dompis-text); font-size: 15px; font-weight: 650; }

	@keyframes enter {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@media (prefers-reduced-motion: reduce) {
		*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
	}
	@media (max-width: 900px) {
		.page-shell { grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr); }
		.introduction { padding-right: 34px; padding-left: 34px; }
		.access-panel { padding-right: 24px; padding-left: 24px; }
		h1 { font-size: clamp(35px, 5vw, 48px); }
	}
	@media (max-width: 720px) {
		.page-shell { min-height: 100svh; grid-template-columns: minmax(0, 1fr); }
		.introduction { min-width: 0; min-height: auto; padding: 22px 22px 0; }
		.intro-copy { min-width: 0; width: 100%; margin: 48px 0 0; padding: 0 0 25px; }
		h1 { max-width: 530px; margin: 17px 0 12px; font-size: clamp(34px, 9vw, 46px); }
		.intro-description { font-size: 14px; }
		.product-map { margin-top: 24px; }
		.product-map li { min-height: 38px; }
		.page-footer { display: none; }
		.access-panel { min-width: 0; min-height: auto; padding: 20px 18px 28px; align-items: stretch; }
		.access-card { min-width: 0; width: min(100%, 480px); margin: 0 auto; padding: 25px 22px; }
		.access-card-top { margin-bottom: 38px; }
		.privacy-note { margin-right: auto; margin-left: auto; }
	}
	@media (max-width: 360px) {
		.introduction { padding-right: 16px; padding-left: 16px; }
		.access-panel { padding-right: 12px; padding-left: 12px; }
		.access-card { padding: 22px 18px; }
	}
</style>
