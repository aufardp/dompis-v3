<script lang="ts">
	import { onMount } from 'svelte';
	type EventRow = { id: string; actorId: string | null; action: string; targetId: string | null; requestId: string; createdAt: string };
	let loading = $state(true);
	let busy = $state(false);
	let allowed = $state(false);
	let events = $state<EventRow[]>([]);
	let nextCursor = $state<string | null>(null);
	let cursors = $state<(string | null)[]>([null]);
	let page = $state(0);
	let theme = $state<'light' | 'dark'>('dark');
	let message = $state('');
	onMount(() => {
		let stored: string | null = null;
		try { stored = localStorage.getItem('dompis-theme'); } catch { /* Theme persistence is optional. */ }
		const systemLight = matchMedia('(prefers-color-scheme: light)').matches;
		applyTheme(stored === 'light' || stored === 'dark' ? stored : systemLight ? 'light' : 'dark');
		void initialize();
	});
	function applyTheme(value: 'light' | 'dark'): void {
		theme = value; document.documentElement.dataset.theme = value;
		const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
		if (meta) meta.content = value === 'light' ? '#FFFFFF' : '#101220';
	}
	function toggleTheme(): void {
		const value = theme === 'dark' ? 'light' : 'dark';
		try { localStorage.setItem('dompis-theme', value); } catch { /* Keep the page usable. */ }
		applyTheme(value);
	}
	async function get<T>(url: string): Promise<T> {
		const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
		if (!response.ok) throw new Error(`http_${response.status}`);
		return await response.json() as T;
	}
	async function initialize(): Promise<void> {
		loading = true;
		try {
			const session = await get<{ globalScope: boolean; permissions: string[] }>('/auth/me');
			allowed = session.globalScope && session.permissions.includes('audit.read');
			if (!allowed) { message = 'Audit Log hanya tersedia untuk superadmin dengan cakupan global.'; return; }
			await loadPage(null, 0);
		} catch (cause) {
			message = cause instanceof Error && cause.message === 'http_401'
				? 'Sesi tidak aktif. Masuk kembali untuk melihat catatan audit.' : 'Layanan belum tersedia. Coba lagi beberapa saat.';
		}
		finally { loading = false; }
	}
	async function loadPage(after: string | null, nextPage: number): Promise<void> {
		busy = true; message = '';
		try {
			const params = new URLSearchParams({ limit: '50' });
			if (after) params.set('after', after);
			const result = await get<{ events: EventRow[]; nextCursor: string | null }>(`/api/admin/audit-events?${params}`);
			events = result.events; nextCursor = result.nextCursor; page = nextPage;
		} catch (cause) { message = cause instanceof Error && cause.message === 'http_403'
			? 'Akses ditolak. Hak akses akun mungkin telah berubah.' : 'Catatan audit gagal dimuat. Coba lagi.'; }
		finally { busy = false; }
	}
	async function next(): Promise<void> { if (!nextCursor) return; const value = [...cursors, nextCursor]; cursors = value; await loadPage(nextCursor, page + 1); }
	async function previous(): Promise<void> { if (cursors.length <= 1) return; const value = cursors.slice(0, -1); cursors = value; await loadPage(value.at(-1) ?? null, Math.max(page - 1, 0)); }
	function localTime(value: string): string { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(value)); }
</script>

<svelte:head><title>Audit Log · DOMPIS</title><meta name="description" content="Riwayat tindakan administrasi DOMPIS." /><meta name="theme-color" content="#101220" /></svelte:head>
<a class="skip-link" href="#audit-main">Lewati ke catatan audit</a>
<main id="audit-main" class="shell">
	<header class="topbar"><a class="brand" href="/" aria-label="DOMPIS, halaman utama"><span class="brand-mark">D</span><span>DOMPIS</span></a>{#if allowed}<nav aria-label="Administrasi"><a href="/admin/users">Pengguna</a><a href="/admin/organization">Organisasi</a><a class="active" href="/admin/audit" aria-current="page">Audit log</a></nav>{/if}<button class="theme-button" type="button" onclick={toggleTheme}>{theme === 'dark' ? 'Mode terang' : 'Mode gelap'}</button></header>
	<section class="intro"><p class="eyebrow">ADMINISTRASI <span>/</span> JEJAK TINDAKAN</p><div class="title-row"><div><h1>Audit Log</h1><p>Riwayat perubahan yang tercatat oleh sistem DOMPIS.</p></div><a class="back-link" href="/">← Beranda</a></div></section>
	{#if loading}<section class="panel pending" aria-live="polite">Memeriksa sesi dan memuat catatan…</section>
	{:else if !allowed}<section class="panel denied" role="alert"><strong>Akses tidak tersedia</strong><p>{message}</p><a href="/">Kembali ke halaman utama</a></section>
	{:else}
		{#if message}<p class="notice" role="alert">{message}</p>{/if}
		<section class="panel"><div class="panel-title"><div><span class="eyebrow">REKAMAN TERBARU</span><h2>Tindakan administrasi</h2></div><span class="privacy-note">Metadata bebas tidak ditampilkan</span></div>
			<div class="table-wrap"><table><thead><tr><th>Waktu (WIB)</th><th>Tindakan</th><th>Actor ID</th><th>Target ID</th><th>Request ID</th></tr></thead><tbody>
				{#each events as event (event.id)}<tr><td>{localTime(event.createdAt)}</td><td><span class="action">{event.action}</span></td><td class="mono">{event.actorId ?? 'Actor dihapus'}</td><td class="mono">{event.targetId ?? '—'}</td><td class="mono">{event.requestId}</td></tr>
				{:else}<tr><td colspan="5" class="empty">Belum ada catatan audit.</td></tr>{/each}
			</tbody></table></div>
			<footer class="pagination"><span>Halaman {page + 1} · maksimum 50 catatan</span><div><button type="button" disabled={page === 0 || busy} onclick={previous}>Sebelumnya</button><button type="button" disabled={!nextCursor || busy} onclick={next}>Berikutnya</button></div></footer>
		</section>
	{/if}
</main>

<style>
	:global(*){box-sizing:border-box}:global(body){margin:0;background:var(--canvas);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(:root){--canvas:#101220;--surface:#181A29;--ink:#fff;--muted:#C5CAD3;--line:#34384a;--accent:#AD0E27;--soft:#2A2F45;--shadow:0 18px 55px #07081166}:global(:root[data-theme="light"]){--canvas:#f4f5f8;--surface:#fff;--ink:#181A29;--muted:#596071;--line:#dfe2e9;--accent:#AD0E27;--soft:#eef0f5;--shadow:0 18px 55px #24283b12}
	.skip-link{position:absolute;left:-9999px}.skip-link:focus{left:1rem;top:1rem;z-index:4;background:var(--surface);padding:12px}.shell{max-width:1440px;margin:auto;padding:0 48px 56px}.topbar{height:78px;display:flex;align-items:center;border-bottom:1px solid var(--line);gap:48px}.brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;font-weight:800;letter-spacing:.09em}.brand-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:var(--accent);color:white}.topbar nav{display:flex;align-self:stretch;gap:25px}.topbar nav a{display:flex;align-items:center;color:var(--muted);text-decoration:none;font-size:13px;border-bottom:2px solid transparent}.topbar nav a.active{color:var(--ink);border-color:var(--accent)}.theme-button{margin-left:auto;background:transparent;color:var(--muted);border:1px solid var(--line);border-radius:8px;padding:9px 13px;cursor:pointer}.intro{padding:34px 0 25px}.eyebrow{font-size:10px;letter-spacing:.15em;font-weight:700;color:var(--muted)}.eyebrow span{color:var(--accent);padding:0 7px}.title-row{display:flex;align-items:flex-end;justify-content:space-between}.title-row h1{font-size:clamp(28px,3vw,38px);letter-spacing:-.04em;margin:12px 0 8px}.title-row p{margin:0;color:var(--muted);font-size:14px}.back-link{color:var(--muted);font-size:13px;text-decoration:none}.panel{background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);padding:24px}.panel-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:15px}.panel-title h2{margin:6px 0 0;font-size:19px}.privacy-note{color:var(--muted);font-size:11px}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;text-align:left}th{padding:11px 12px;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--line);white-space:nowrap}td{padding:13px 12px;border-bottom:1px solid var(--line);font-size:12px;white-space:nowrap}.mono{font:10px ui-monospace,SFMono-Regular,monospace;color:var(--muted)}.action{display:inline-block;padding:5px 8px;background:var(--soft);border-radius:20px}.empty{padding:34px;text-align:center;color:var(--muted)}.pagination{display:flex;justify-content:space-between;align-items:center;padding-top:15px;color:var(--muted);font-size:11px}.pagination div{display:flex;gap:7px}.pagination button{background:var(--soft);color:var(--ink);border:1px solid var(--line);border-radius:7px;padding:8px 11px;cursor:pointer}.pagination button:disabled{opacity:.45;cursor:not-allowed}.notice,.denied,.pending{padding:18px 22px;margin:0 0 18px;color:var(--ink)}.denied p{color:var(--muted)}.denied a{color:#db586d}:focus-visible{outline:2px solid #db586d;outline-offset:2px}
	@media(max-width:800px){.shell{padding:0 22px 36px}.topbar{gap:24px}.panel{padding:18px}}
	@media(max-width:600px){.shell{padding:0 15px 28px}.topbar{height:66px;gap:13px}.topbar nav{gap:11px}.topbar nav a{font-size:11px}.brand{font-size:12px}.theme-button{padding:7px;font-size:10px}.back-link{display:none}.panel-title{align-items:flex-start;flex-direction:column;gap:10px}.pagination{align-items:flex-start;flex-direction:column;gap:10px}.pagination div{width:100%}.pagination button{flex:1}}
</style>
