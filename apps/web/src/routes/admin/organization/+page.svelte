<script lang="ts">
	import { onMount } from 'svelte';
	type OrganizationLevel = 'area' | 'region' | 'branch' | 'service_area' | 'workzone';
	type OrganizationScopeOption = { id: string; code: string; name: string };
	type OrganizationChildImpactPreview = {
		childLevel: OrganizationLevel;
		parent: (OrganizationScopeOption & { level: OrganizationLevel }) | null;
		summary: { total: number; global: number; inheritedScope: number };
		users: Array<{ id: string; username: string; displayName: string; roleCode: string; accessMode: 'global' | 'inherited_scope'; scopeLevels: string[] }>;
		nextCursor: string | null;
		previewToken: string;
	};
	type AuthenticatedSessionSummary = { globalScope?: boolean; permissions?: string[] };
	const levels: { id: OrganizationLevel; label: string }[] = [
		{ id: 'area', label: 'Area' }, { id: 'region', label: 'Region' }, { id: 'branch', label: 'Branch' },
		{ id: 'service_area', label: 'Service Area' }, { id: 'workzone', label: 'Workzone' }
	];
	const ancestors: OrganizationLevel[] = ['area', 'region', 'branch', 'service_area'];
	let theme = $state<'light' | 'dark'>('dark');
	let allowed = $state(false);
	let loading = $state(true);
	let busy = $state(false);
	let error = $state('');
	let successNotice = $state('');
	let searchDraft = $state('');
	let appliedSearch = $state('');
	let level = $state<OrganizationLevel>('area');
	let selected = $state<Record<OrganizationLevel, string>>({ area: '', region: '', branch: '', service_area: '', workzone: '' });
	let options = $state<Record<OrganizationLevel, OrganizationScopeOption[]>>({ area: [], region: [], branch: [], service_area: [], workzone: [] });
	let hasMoreOptions = $state(false);
	let impact = $state<OrganizationChildImpactPreview | null>(null);
	let nextCursor = $state<string | null>(null);
	let cursorStack = $state<(string | null)[]>([null]);
	let currentPage = $state(0);
	let unitCode = $state('');
	let unitName = $state('');
	let currentPassword = $state('');
	let saving = $state(false);

	onMount(() => {
		let stored: string | null = null;
		try { stored = localStorage.getItem('dompis-theme'); } catch { /* Theme preference is optional. */ }
		const systemPrefersLightTheme = matchMedia('(prefers-color-scheme: light)').matches;
		applySelectedTheme(stored === 'light' || stored === 'dark' ? stored : systemPrefersLightTheme ? 'light' : 'dark');
		void initializeOrganizationManagementPage();
	});
	function applySelectedTheme(themeName: 'light' | 'dark'): void {
		theme = themeName;
		document.documentElement.dataset.theme = themeName;
		const themeColorMetaElement = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
		if (themeColorMetaElement) themeColorMetaElement.content = themeName === 'light' ? '#FFFFFF' : '#101220';
	}
	function toggleSelectedTheme(): void {
		const nextThemeName = theme === 'dark' ? 'light' : 'dark';
		try { localStorage.setItem('dompis-theme', nextThemeName); } catch { /* Continue without persistence. */ }
		applySelectedTheme(nextThemeName);
	}
	async function requestJson<T>(requestUrl: string): Promise<T> {
		const httpResponse = await fetch(requestUrl, { credentials: 'same-origin', cache: 'no-store' });
		if (!httpResponse.ok) throw new Error(`http_${httpResponse.status}`);
		return await httpResponse.json() as T;
	}
	async function initializeOrganizationManagementPage(): Promise<void> {
		loading = true;
		try {
			const authenticatedSession = await requestJson<AuthenticatedSessionSummary>('/auth/me');
			allowed = authenticatedSession.globalScope === true && authenticatedSession.permissions?.includes('organization.manage') === true;
			if (!allowed) { error = 'Akses Organization Management memerlukan superadmin dengan cakupan global.'; return; }
			await loadOrganizationScopeOptions('area');
		} catch (cause) {
			error = cause instanceof Error && cause.message === 'http_401'
				? 'Sesi tidak aktif. Masuk kembali untuk mengelola organisasi.'
				: 'Layanan belum tersedia. Coba lagi beberapa saat.';
		}
		finally { loading = false; }
	}
	function getParentOrganizationLevel(child: OrganizationLevel): OrganizationLevel | null {
		const index = levels.findIndex((item) => item.id === child);
		return index > 0 ? levels[index - 1]!.id : null;
	}
	async function loadOrganizationScopeOptions(target: OrganizationLevel): Promise<void> {
		const parent = getParentOrganizationLevel(target);
		const parentId = parent ? selected[parent] : '';
		if (parent && !parentId) { options[target] = []; return; }
		const scopeOptionSearchParameters = new URLSearchParams({ level: target, limit: '50' });
		if (parentId) scopeOptionSearchParameters.set('parentId', parentId);
		if (appliedSearch) scopeOptionSearchParameters.set('search', appliedSearch);
		const scopeOptionResponse = await requestJson<{ options: OrganizationScopeOption[]; nextCursor: string | null }>(`/api/admin/scope-options?${scopeOptionSearchParameters}`);
		options[target] = scopeOptionResponse.options;
		if (target === level) hasMoreOptions = scopeOptionResponse.nextCursor !== null;
	}
	async function applyOrganizationSearch(): Promise<void> {
		appliedSearch = searchDraft.trim();
		impact = null; error = '';
		selected = { area: '', region: '', branch: '', service_area: '', workzone: '' };
		options = { area: [], region: [], branch: [], service_area: [], workzone: [] };
		try { await loadOrganizationScopeOptions('area'); if (level !== 'area') await loadOrganizationScopeOptions(level); }
		catch { error = 'Daftar wilayah gagal dimuat. Periksa pencarian lalu coba lagi.'; }
	}
	async function selectOrganizationLevel(value: OrganizationLevel): Promise<void> {
		level = value; impact = null; error = '';
		try { await loadOrganizationScopeOptions(value); }
		catch { error = 'Pilihan wilayah gagal dimuat.'; }
	}
	async function selectOrganizationParent(target: OrganizationLevel, value: string): Promise<void> {
		selected[target] = value;
		impact = null; error = '';
		const index = levels.findIndex((item) => item.id === target);
		for (const child of levels.slice(index + 1)) { selected[child.id] = ''; options[child.id] = []; }
		const child = levels[index + 1]?.id;
		if (child && levels.findIndex((item) => item.id === child) < levels.findIndex((item) => item.id === level)) {
			try { await loadOrganizationScopeOptions(child); } catch { error = 'Pilihan wilayah lanjutan gagal dimuat.'; }
		}
	}
	function isOrganizationParentSelectionComplete(): boolean {
		const parent = getParentOrganizationLevel(level);
		return parent === null || Boolean(selected[parent]);
	}
	async function loadOrganizationChildImpactPage(after: string | null, page: number): Promise<void> {
		if (!isOrganizationParentSelectionComplete()) { error = 'Pilih seluruh parent wilayah terlebih dahulu.'; return; }
		busy = true; error = '';
		try {
			const params = new URLSearchParams({ level, limit: '50' });
			const parent = getParentOrganizationLevel(level);
			if (parent) params.set('parentId', selected[parent]);
			if (after) params.set('after', after);
			impact = await requestJson<OrganizationChildImpactPreview>(`/api/admin/organization/child-impact?${params}`);
			nextCursor = impact.nextCursor; currentPage = page;
		} catch (cause) {
			impact = null;
			error = cause instanceof Error && cause.message === 'http_403'
				? 'Akses ditolak. Sesi atau hak akses mungkin telah berubah.'
				: 'Pratinjau dampak gagal dimuat. Coba lagi.';
		} finally { busy = false; }
	}
	async function previewOrganizationChildCreationImpact(): Promise<void> { cursorStack = [null]; await loadOrganizationChildImpactPage(null, 0); }
	async function loadNextOrganizationImpactPage(): Promise<void> {
		if (!nextCursor) return;
		const cursors = [...cursorStack, nextCursor]; cursorStack = cursors;
		await loadOrganizationChildImpactPage(nextCursor, currentPage + 1);
	}
	async function loadPreviousOrganizationImpactPage(): Promise<void> {
		if (cursorStack.length <= 1) return;
		const cursors = cursorStack.slice(0, -1); cursorStack = cursors;
		await loadOrganizationChildImpactPage(cursors.at(-1) ?? null, Math.max(0, currentPage - 1));
	}
	async function createOrganizationChild(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!impact || saving) return;
		saving = true; error = ''; successNotice = '';
		try {
			const csrfResponse = await fetch('/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
			if (!csrfResponse.ok) throw new Error('csrf');
			const csrfResponsePayload = await csrfResponse.json() as { csrfToken?: unknown };
			if (typeof csrfResponsePayload.csrfToken !== 'string') throw new Error('csrf');
			const parent = getParentOrganizationLevel(level);
			const response = await fetch('/api/admin/organization/children', {
				method: 'POST', credentials: 'same-origin', cache: 'no-store',
				headers: { 'content-type': 'application/json', 'x-csrf-token': csrfResponsePayload.csrfToken },
				body: JSON.stringify({ level, ...(parent ? { parentId: selected[parent] } : {}), code: unitCode, name: unitName,
					previewToken: impact.previewToken, currentPassword })
			});
			if (response.status === 409) throw new Error('impact_changed');
			if (response.status === 403) throw new Error('forbidden');
			if (!response.ok) throw new Error('create_failed');
			const childCreationResponse = await response.json() as { affectedUsers: number };
			successNotice = `Unit berhasil dibuat. ${childCreationResponse.affectedUsers} sesi user terdampak dicabut. Masuk kembali untuk melanjutkan administrasi.`;
			impact = null; unitCode = ''; unitName = ''; currentPassword = '';
		} catch (cause) {
			error = cause instanceof Error && cause.message === 'impact_changed'
				? 'Daftar user terdampak berubah atau pratinjau kedaluwarsa. Muat pratinjau baru sebelum menyimpan.'
				: cause instanceof Error && cause.message === 'forbidden'
					? 'Permintaan ditolak. Periksa ulang sesi, Origin, CSRF, dan password superadmin.'
					: 'Unit belum dapat dibuat. Periksa kode unik, data, dan koneksi lalu coba lagi.';
		} finally { saving = false; }
	}
	function getOrganizationLevelLabel(value: string): string { return levels.find((item) => item.id === value)?.label ?? value; }
</script>

<svelte:head>
	<title>Organization Management · DOMPIS</title>
	<meta name="description" content="Pratinjau dampak cakupan user pada struktur organisasi DOMPIS." />
	<meta name="theme-color" content="#101220" />
</svelte:head>

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<main id="main-content" class="shell">
	<header class="topbar">
		<a class="brand" href="/" aria-label="DOMPIS, kembali ke halaman utama"><span class="brand-mark">D</span><span>DOMPIS</span></a>
		{#if allowed}<nav aria-label="Administrasi"><a href="/admin/users">Pengguna</a><a class="active" href="/admin/organization" aria-current="page">Organisasi</a><a href="/admin/organization/move">Pindah unit</a></nav>{/if}
		<button class="theme-button" type="button" onclick={toggleSelectedTheme} aria-label="Ganti tema">{theme === 'dark' ? 'Mode terang' : 'Mode gelap'}</button>
	</header>
	<section class="intro">
		<p class="eyebrow">ADMINISTRASI <span> / </span> STRUKTUR ORGANISASI</p>
		<div class="title-row"><div><h1>Organization Management</h1><p>Periksa user yang akan terjangkau oleh parent sebelum membuat unit organisasi.</p></div><a class="back-link" href="/">← Beranda</a></div>
	</section>
	{#if loading}<section class="panel loading" aria-live="polite">Memeriksa sesi dan permission…</section>
	{:else if !allowed}<section class="panel denied" role="alert"><strong>Akses tidak tersedia</strong><p>{error || 'Halaman ini hanya tersedia untuk superadmin global.'}</p><a href="/">Kembali ke halaman utama</a></section>
	{:else}
		{#if error}<p class="notice" role="alert">{error}</p>{/if}
		{#if successNotice}<p class="success-notice" role="status">{successNotice} <a href="/">Kembali ke halaman masuk</a></p>{/if}
		<div class="layout">
			<section class="panel controls" aria-labelledby="previewOrganizationChildCreationImpact-title">
				<div class="panel-heading"><span class="step">01</span><div><h2 id="previewOrganizationChildCreationImpact-title">Atur konteks pratinjau</h2><p>Semua pilihan hanya membaca data.</p></div></div>
			<label class="field"><span>Cari wilayah</span><div class="search-row"><input bind:value={searchDraft} maxlength="80" placeholder="Kode atau nama wilayah" onkeydown={(event) => event.key === 'Enter' && applyOrganizationSearch()} /><button type="button" class="secondary" onclick={applyOrganizationSearch}>Terapkan</button></div></label>
			<p class="hint">Pencarian menyaring pilihan pada setiap tingkat. Daftar dibatasi 50 item; gunakan pencarian bila unit tidak terlihat.</p>
			<label class="field"><span>Unit yang akan dibuat</span><select value={level} onchange={(event) => selectOrganizationLevel(event.currentTarget.value as OrganizationLevel)}>{#each levels as item}<option value={item.id}>{item.label}</option>{/each}</select></label>
			{#each ancestors.slice(0, levels.findIndex((item) => item.id === level)) as parent}
				<label class="field"><span>{getOrganizationLevelLabel(parent)} parent</span><select value={selected[parent]} onchange={(event) => selectOrganizationParent(parent, event.currentTarget.value)}><option value="">Pilih {getOrganizationLevelLabel(parent).toLowerCase()}</option>{#each options[parent] as option}<option value={option.id}>{option.code} · {option.name}</option>{/each}</select></label>
			{/each}
			{#if hasMoreOptions}<p class="hint">Masih ada pilihan lain di luar 50 hasil pertama. Tambahkan kata kunci pencarian.</p>{/if}
			<div class="read-only-note"><span aria-hidden="true">i</span><p><strong>Pratinjau saja.</strong> Belum ada perubahan hierarchy atau scope yang disimpan.</p></div>
			<button class="primary" type="button" disabled={!isOrganizationParentSelectionComplete() || busy} onclick={previewOrganizationChildCreationImpact}>{busy ? 'Memuat pratinjau…' : 'Lihat user terdampak'}</button>
			</section>
			<section class="panel results" aria-labelledby="impact-title" aria-live="polite">
				<div class="panel-heading"><span class="step">02</span><div><h2 id="impact-title">Dampak cakupan user</h2><p>Snapshot user aktif yang grant-nya mencakup calon unit.</p></div></div>
				{#if !impact}<div class="empty"><span class="empty-icon">↗</span><strong>Belum ada pratinjau</strong><p>Tentukan level dan parent, lalu pilih “Lihat user terdampak”.</p></div>
				{:else}
					<div class="context"><span>CALON UNIT</span><strong>{getOrganizationLevelLabel(impact.childLevel)}</strong><p>{impact.parent ? `${getOrganizationLevelLabel(impact.parent.level)} · ${impact.parent.code} — ${impact.parent.name}` : 'Unit root baru; hanya global scope yang berlaku.'}</p></div>
					<div class="metrics"><article><span>USER TERDAMPAK</span><strong>{impact.summary.total}</strong></article><article><span>GLOBAL</span><strong>{impact.summary.global}</strong></article><article><span>INHERIT SCOPE</span><strong>{impact.summary.inheritedScope}</strong></article></div>
					<div class="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Akses melalui</th></tr></thead><tbody>
						{#each impact.users as user (user.id)}<tr><td><strong>{user.displayName}</strong><small>@{user.username}</small></td><td><span class="role">{user.roleCode}</span></td><td>{user.accessMode === 'global' ? 'Cakupan global' : user.scopeLevels.map(getOrganizationLevelLabel).join(', ')}</td></tr>
						{:else}<tr><td colspan="3" class="no-users">Tidak ada user aktif dengan grant yang mencakup parent ini.</td></tr>{/each}
					</tbody></table></div>
					<div class="pagination"><span>Halaman {currentPage + 1} · {impact.users.length} user ditampilkan pada halaman ini</span><div><button class="secondary" type="button" disabled={currentPage === 0 || busy} onclick={loadPreviousOrganizationImpactPage}>Sebelumnya</button><button class="secondary" type="button" disabled={!nextCursor || busy} onclick={loadNextOrganizationImpactPage}>Berikutnya</button></div></div>
					<form class="create-form" onsubmit={createOrganizationChild}>
						<div><p class="eyebrow">KONFIRMASI MUTASI</p><h3>Buat {getOrganizationLevelLabel(level)}</h3><p>Pratinjau berlaku lima menit. User yang terdampak akan diminta masuk kembali.</p></div>
						<div class="create-fields"><label class="field"><span>Kode unit</span><input bind:value={unitCode} maxlength="80" required autocomplete="off" /></label><label class="field"><span>Nama unit</span><input bind:value={unitName} maxlength="120" required autocomplete="off" /></label><label class="field"><span>Password superadmin untuk konfirmasi</span><input bind:value={currentPassword} type="password" maxlength="1024" required autocomplete="current-password" /></label></div>
						<button class="primary" type="submit" disabled={saving || !unitCode.trim() || !unitName.trim() || !currentPassword}>{saving ? 'Menyimpan…' : 'Konfirmasi dan buat unit'}</button>
					</form>
				{/if}
			</section>
		</div>
	{/if}
</main>

<style>
	:global(*){box-sizing:border-box} :global(body){margin:0;background:var(--canvas);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
	:global(:root){--canvas:#101220;--surface:#181A29;--ink:#FFFFFF;--muted:#C5CAD3;--line:#34384a;--accent:#AD0E27;--accent-strong:#750A1C;--soft:#2A2F45;--shadow:0 18px 55px #07081166}
	:global(:root[data-theme="light"]){--canvas:#f4f5f8;--surface:#FFFFFF;--ink:#181A29;--muted:#596071;--line:#dfe2e9;--accent:#AD0E27;--accent-strong:#750A1C;--soft:#eef0f5;--shadow:0 18px 55px #24283b12}
	.skip-link{position:absolute;left:-9999px;top:1rem;background:var(--surface);padding:.75rem;z-index:5}.skip-link:focus{left:1rem}.shell{max-width:1440px;margin:auto;padding:0 48px 56px}.topbar{height:78px;display:flex;align-items:center;border-bottom:1px solid var(--line);gap:48px}.brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;font-weight:800;letter-spacing:.09em}.brand-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:var(--accent);color:white}.topbar nav{display:flex;align-self:stretch;gap:28px}.topbar nav a{display:flex;align-items:center;color:var(--muted);text-decoration:none;font-size:14px;border-bottom:2px solid transparent}.topbar nav a.active{color:var(--ink);border-color:var(--accent)}.theme-button{margin-left:auto;background:transparent;color:var(--muted);border:1px solid var(--line);border-radius:8px;padding:9px 13px;cursor:pointer}.intro{padding:34px 0 27px}.eyebrow{font-size:11px;letter-spacing:.15em;font-weight:700;color:var(--muted)}.eyebrow span{color:var(--accent);padding:0 7px}.title-row{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}.title-row h1{font-size:clamp(28px,3vw,38px);letter-spacing:-.04em;margin:12px 0 8px}.title-row p,.panel-heading p{margin:0;color:var(--muted);font-size:14px}.back-link{color:var(--muted);font-size:13px;text-decoration:none;padding-bottom:4px}.layout{display:grid;grid-template-columns:minmax(310px,390px) minmax(0,1fr);gap:22px;align-items:start}.panel{background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow)}.controls,.results{padding:24px}.panel-heading{display:flex;gap:13px;align-items:flex-start;margin-bottom:24px}.step{display:grid;place-items:center;border-radius:8px;width:31px;height:31px;background:color-mix(in srgb,var(--accent) 17%,var(--surface));color:#db586d;font:700 11px ui-monospace,monospace;flex:none}.panel-heading h2{font-size:17px;letter-spacing:-.02em;margin:2px 0 5px}.panel-heading p{font-size:12px;line-height:1.5}.field{display:grid;gap:8px;margin:0 0 16px}.field>span{font-size:12px;font-weight:650}.field input,.field select{width:100%;min-height:42px;background:var(--canvas);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:0 11px;font:inherit;font-size:13px}.field input:focus,.field select:focus,button:focus-visible,a:focus-visible{outline:2px solid #d7465e;outline-offset:2px}.search-row{display:flex;gap:8px}.search-row input{min-width:0}.secondary,.primary{border-radius:8px;padding:10px 13px;border:1px solid var(--line);font:600 12px inherit;cursor:pointer;white-space:nowrap}.secondary{color:var(--ink);background:var(--soft)}.primary{width:100%;margin-top:14px;color:white;background:var(--accent);border-color:var(--accent);font-size:13px;padding:13px}.primary:hover:not(:disabled){background:var(--accent-strong)}button:disabled{opacity:.45;cursor:not-allowed}.hint{font-size:11px;color:var(--muted);line-height:1.5;margin:-7px 0 18px}.read-only-note{display:flex;gap:10px;padding:12px;background:var(--soft);border-radius:9px;margin-top:22px}.read-only-note>span{display:grid;place-items:center;width:19px;height:19px;border:1px solid var(--muted);border-radius:50%;font-size:12px;flex:none}.read-only-note p{font-size:11px;color:var(--muted);line-height:1.5;margin:0}.read-only-note strong{color:var(--ink)}.empty{min-height:310px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--muted)}.empty-icon{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:var(--soft);color:#db586d;font-size:23px;margin-bottom:15px}.empty strong{color:var(--ink);font-size:14px}.empty p{max-width:330px;font-size:12px;line-height:1.6}.context{padding:14px 16px;border-left:3px solid var(--accent);background:var(--soft);border-radius:0 9px 9px 0}.context span,.metrics article span{font-size:9px;letter-spacing:.12em;color:var(--muted);font-weight:700}.context strong{display:block;margin:6px 0 3px;font-size:14px}.context p{color:var(--muted);font-size:12px;margin:0;line-height:1.5}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:17px 0}.metrics article{padding:14px;background:var(--canvas);border:1px solid var(--line);border-radius:10px}.metrics article strong{display:block;font-size:25px;letter-spacing:-.04em;margin-top:8px}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;text-align:left}th{padding:10px 12px;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--line)}td{padding:13px 12px;border-bottom:1px solid var(--line);font-size:12px;vertical-align:top}td strong,td small{display:block}td small{color:var(--muted);font-size:10px;margin-top:4px}.role{display:inline-block;border:1px solid var(--line);border-radius:30px;padding:4px 8px;font-size:10px;color:var(--muted)}.no-users{text-align:center;color:var(--muted);padding:28px}.pagination{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:14px;color:var(--muted);font-size:11px}.pagination>div{display:flex;gap:7px}.notice,.denied{padding:17px 20px;margin:0 0 18px;border:1px solid color-mix(in srgb,var(--accent) 55%,var(--line));border-radius:12px;color:var(--ink);background:var(--surface)}.denied p{color:var(--muted)}.denied a{color:#db586d}.loading{padding:28px;color:var(--muted)}
	.create-form{margin-top:25px;padding:19px;background:var(--canvas);border:1px solid var(--line);border-radius:12px}.create-form h3{font-size:15px;margin:3px 0 5px}.create-form>div:first-child>p:last-child{font-size:11px;color:var(--muted);margin:0 0 16px}.create-fields{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}.create-fields .field:last-child{grid-column:1/-1}.success-notice{padding:17px 20px;margin:0 0 18px;border:1px solid #2b8b63;border-radius:12px;color:var(--ink);background:var(--surface);font-size:13px}.success-notice a{display:inline-block;margin-left:8px;color:#69d1a2;font-weight:650}
	@media(max-width:900px){.shell{padding:0 24px 36px}.layout{grid-template-columns:1fr}.controls{order:0}.results{order:1}}
	@media(max-width:600px){.shell{padding:0 16px 28px}.topbar{height:66px;gap:18px}.topbar nav{gap:13px}.topbar nav a{font-size:12px}.brand{font-size:13px}.theme-button{padding:8px;font-size:11px}.title-row{align-items:flex-start}.title-row p{line-height:1.5}.back-link{display:none}.controls,.results{padding:17px}.metrics{gap:6px}.metrics article{padding:10px}.metrics article span{font-size:8px}.metrics article strong{font-size:21px}.pagination{align-items:flex-start;flex-direction:column}.pagination>div{width:100%}.pagination button{flex:1}.create-fields{grid-template-columns:1fr}}
</style>
