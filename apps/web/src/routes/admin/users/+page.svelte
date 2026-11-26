<script lang="ts">
	import { onMount } from 'svelte';

	type RoleCode = 'superadmin' | 'team_leader' | 'helpdesk' | 'teknisi' | 'senior_leader' | 'officer';
	type ScopeLevel = 'area' | 'region' | 'branch' | 'service_area' | 'workzone';
	type ScopeGrant = { level: ScopeLevel; targetId: string; label: string };
	type UserRow = {
		id: string; username: string; displayName: string; roleCode: RoleCode; active: boolean;
		globalScope: boolean; scopeVersion: number; createdAt: string;
	};
	type ScopeRecord = {
		id: string; areaId: string | null; areaCode: string | null; areaName: string | null;
		regionId: string | null; regionCode: string | null; regionName: string | null;
		branchId: string | null; branchCode: string | null; branchName: string | null;
		serviceAreaId: string | null; serviceAreaCode: string | null; serviceAreaName: string | null;
		workzoneId: string | null; workzoneCode: string | null; workzoneName: string | null;
	};
	type UserDetail = UserRow & { scopes: ScopeRecord[] };
	type Option = { id: string; code: string; name: string };
	type ApiFailureBody = { error?: unknown };

	const roles: { code: RoleCode; label: string }[] = [
		{ code: 'superadmin', label: 'Superadmin' },
		{ code: 'team_leader', label: 'Team Leader' },
		{ code: 'helpdesk', label: 'Helpdesk' },
		{ code: 'teknisi', label: 'Teknisi' },
		{ code: 'senior_leader', label: 'Senior Leader' },
		{ code: 'officer', label: 'Officer' }
	];
	const levels: { code: ScopeLevel; label: string }[] = [
		{ code: 'area', label: 'Area' },
		{ code: 'region', label: 'Region' },
		{ code: 'branch', label: 'Branch' },
		{ code: 'service_area', label: 'Service Area' },
		{ code: 'workzone', label: 'Workzone' }
	];
	const levelDepth: Record<ScopeLevel, number> = { area: 0, region: 1, branch: 2, service_area: 3, workzone: 4 };

	let users = $state<UserRow[]>([]);
	let selectedUser = $state<UserDetail | null>(null);
	let selectedUserId = $state('');
	let nextCursor = $state<string | null>(null);
	let previousCursors = $state<(string | null)[]>([null]);
	let currentCursor = $state<string | null>(null);
	let listLoading = $state(false);
	let pageLoading = $state(true);
	let mutationLoading = $state(false);
	let currentPassword = $state('');
	let currentUserId = $state('');
	let currentUserName = $state('');
	let canManage = $state(false);
	let hasGlobalScope = $state(false);
	let theme = $state<'light' | 'dark'>('dark');
	let notice = $state('');
	let noticeKind = $state<'success' | 'error' | 'info'>('info');
	let showCreate = $state(false);
	let showDeactivateConfirm = $state(false);
	let createUsername = $state('');
	let createDisplayName = $state('');
	let createRole = $state<RoleCode>('officer');
	let createPassword = $state('');
	let createPasswordConfirm = $state('');
	let createGlobalPassword = $state('');
	let createScopes = $state<ScopeGrant[]>([]);
	let editScopes = $state<ScopeGrant[]>([]);
	let createGlobal = $state(false);
	let editGlobal = $state(false);
	let grantLevel = $state<ScopeLevel>('area');
	let scopeSearch = $state('');
	let areas = $state<Option[]>([]);
	let regions = $state<Option[]>([]);
	let branches = $state<Option[]>([]);
	let serviceAreas = $state<Option[]>([]);
	let workzones = $state<Option[]>([]);
	let areaId = $state('');
	let regionId = $state('');
	let branchId = $state('');
	let serviceAreaId = $state('');
	let workzoneId = $state('');

	onMount(() => {
		let storedTheme: string | null = null;
		try { storedTheme = window.localStorage.getItem('dompis-theme'); } catch { /* Storage can be disabled. */ }
		const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
		applyTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemLight ? 'light' : 'dark');
		void initialize();
	});

	function applyTheme(value: 'light' | 'dark'): void {
		theme = value;
		document.documentElement.dataset.theme = value;
		const color = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
		if (color) color.content = value === 'light' ? '#FFFFFF' : '#101220';
	}

	function toggleTheme(): void {
		const value = theme === 'dark' ? 'light' : 'dark';
		try { window.localStorage.setItem('dompis-theme', value); } catch { /* Keep this page usable without storage. */ }
		applyTheme(value);
	}

	async function readApiError(response: Response): Promise<string> {
		try {
			const payload = await response.json() as ApiFailureBody;
			return typeof payload.error === 'string' ? payload.error : `http_${response.status}`;
		} catch { return `http_${response.status}`; }
	}

	async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
		const response = await fetch(url, { ...init, credentials: 'same-origin', cache: 'no-store' });
		if (!response.ok) throw new Error(await readApiError(response));
		return await response.json() as T;
	}

	async function csrfToken(): Promise<string> {
		const payload = await request<{ csrfToken?: unknown }>('/auth/csrf');
		if (typeof payload.csrfToken !== 'string' || payload.csrfToken.length !== 43) throw new Error('csrf_unavailable');
		return payload.csrfToken;
	}

	async function initialize(): Promise<void> {
		pageLoading = true;
		try {
			const session = await request<{ userId: string; username: string; displayName: string; globalScope: boolean; permissions: string[] }>('/auth/me');
			currentUserId = session.userId;
			currentUserName = session.displayName || session.username;
			canManage = session.permissions.includes('users.manage') && session.permissions.includes('users.read');
			hasGlobalScope = session.globalScope;
			if (!canManage || !hasGlobalScope) {
				noticeKind = 'error';
				notice = 'Akses User Management memerlukan permission superadmin dan cakupan global.';
				return;
			}
			await Promise.all([loadUsers(null), loadScopeOptions('area')]);
		} catch (error: unknown) {
			noticeKind = 'error';
			notice = error instanceof Error && error.message === 'unauthenticated'
				? 'Sesi berakhir. Masuk kembali untuk melanjutkan.'
				: 'Data User Management belum dapat dimuat. Coba muat ulang halaman.';
		} finally { pageLoading = false; }
	}

	async function loadUsers(after: string | null): Promise<void> {
		listLoading = true;
		try {
			const params = new URLSearchParams({ limit: '50' });
			if (after) params.set('after', after);
			const page = await request<{ users: UserRow[]; nextCursor: string | null }>(`/admin/users?${params}`);
			users = page.users;
			nextCursor = page.nextCursor;
			currentCursor = after;
		} catch {
			noticeKind = 'error';
			notice = 'Daftar pengguna gagal dimuat. Periksa koneksi lalu coba lagi.';
		} finally { listLoading = false; }
	}

	async function selectUser(user: UserRow): Promise<void> {
		selectedUserId = user.id;
		selectedUser = null;
		try {
			selectedUser = await request<UserDetail>(`/admin/users/${user.id}`);
			editGlobal = selectedUser.globalScope;
			editScopes = selectedUser.scopes.map(toScopeGrant);
			currentPassword = '';
			showDeactivateConfirm = false;
		} catch {
			noticeKind = 'error';
			notice = 'Rincian pengguna gagal dimuat.';
		}
	}

	function toScopeGrant(scope: ScopeRecord): ScopeGrant {
		const candidates: { level: ScopeLevel; id: string | null; code: string | null; name: string | null }[] = [
			{ level: 'area', id: scope.areaId, code: scope.areaCode, name: scope.areaName },
			{ level: 'region', id: scope.regionId, code: scope.regionCode, name: scope.regionName },
			{ level: 'branch', id: scope.branchId, code: scope.branchCode, name: scope.branchName },
			{ level: 'service_area', id: scope.serviceAreaId, code: scope.serviceAreaCode, name: scope.serviceAreaName },
			{ level: 'workzone', id: scope.workzoneId, code: scope.workzoneCode, name: scope.workzoneName }
		];
		const found = candidates.find((candidate) => candidate.id !== null);
		if (!found?.id) throw new Error('invalid_scope_response');
		const label = `${levels.find((item) => item.code === found.level)?.label ?? found.level}: ${found.code ?? ''} ${found.name ?? ''}`.trim();
		return { level: found.level, targetId: found.id, label };
	}

	function resetDescendants(from: ScopeLevel): void {
		if (levelDepth[from] <= 0) { regionId = ''; regions = []; }
		if (levelDepth[from] <= 1) { branchId = ''; branches = []; }
		if (levelDepth[from] <= 2) { serviceAreaId = ''; serviceAreas = []; }
		if (levelDepth[from] <= 3) { workzoneId = ''; workzones = []; }
	}

	async function loadScopeOptions(level: ScopeLevel, parentId?: string): Promise<Option[]> {
		const params = new URLSearchParams({ level, limit: '50' });
		if (parentId) params.set('parentId', parentId);
		if (scopeSearch.trim()) params.set('search', scopeSearch.trim());
		const page = await request<{ options: Option[] }>(`/admin/scope-options?${params}`);
		if (level === 'area') areas = page.options;
		if (level === 'region') regions = page.options;
		if (level === 'branch') branches = page.options;
		if (level === 'service_area') serviceAreas = page.options;
		if (level === 'workzone') workzones = page.options;
		return page.options;
	}

	async function onAreaChange(value: string): Promise<void> {
		areaId = value;
		resetDescendants('area');
		if (value && levelDepth[grantLevel] >= 1) await loadScopeOptions('region', value);
	}

	async function onRegionChange(value: string): Promise<void> {
		regionId = value;
		resetDescendants('region');
		if (value && levelDepth[grantLevel] >= 2) await loadScopeOptions('branch', value);
	}

	async function onBranchChange(value: string): Promise<void> {
		branchId = value;
		resetDescendants('branch');
		if (value && levelDepth[grantLevel] >= 3) await loadScopeOptions('service_area', value);
	}

	async function onServiceAreaChange(value: string): Promise<void> {
		serviceAreaId = value;
		resetDescendants('service_area');
		if (value && levelDepth[grantLevel] >= 4) await loadScopeOptions('workzone', value);
	}

	async function onGrantLevelChange(value: ScopeLevel): Promise<void> {
		grantLevel = value;
		resetDescendants('area');
		if (levelDepth[value] >= 1 && areaId) await loadScopeOptions('region', areaId);
		if (levelDepth[value] >= 2 && regionId) await loadScopeOptions('branch', regionId);
		if (levelDepth[value] >= 3 && branchId) await loadScopeOptions('service_area', branchId);
		if (levelDepth[value] >= 4 && serviceAreaId) await loadScopeOptions('workzone', serviceAreaId);
	}

	async function refreshScopeOptions(): Promise<void> {
		await loadScopeOptions('area');
		if (levelDepth[grantLevel] >= 1 && areaId) await loadScopeOptions('region', areaId);
		if (levelDepth[grantLevel] >= 2 && regionId) await loadScopeOptions('branch', regionId);
		if (levelDepth[grantLevel] >= 3 && branchId) await loadScopeOptions('service_area', branchId);
		if (levelDepth[grantLevel] >= 4 && serviceAreaId) await loadScopeOptions('workzone', serviceAreaId);
	}

	function selectedGrant(): ScopeGrant | null {
		const byLevel: Record<ScopeLevel, { id: string; option: Option | undefined }> = {
			area: { id: areaId, option: areas.find((item) => item.id === areaId) },
			region: { id: regionId, option: regions.find((item) => item.id === regionId) },
			branch: { id: branchId, option: branches.find((item) => item.id === branchId) },
			service_area: { id: serviceAreaId, option: serviceAreas.find((item) => item.id === serviceAreaId) },
			workzone: { id: workzoneId, option: workzones.find((item) => item.id === workzoneId) }
		};
		const selected = byLevel[grantLevel];
		if (!selected.id || !selected.option) return null;
		return { level: grantLevel, targetId: selected.id, label: `${levels.find((item) => item.code === grantLevel)?.label}: ${selected.option.code} ${selected.option.name}` };
	}

	function addScope(target: 'create' | 'edit'): void {
		const grant = selectedGrant();
		if (!grant) return;
		const list = target === 'create' ? createScopes : editScopes;
		if (list.some((item) => item.level === grant.level && item.targetId === grant.targetId)) return;
		if (target === 'create') createScopes = [...createScopes, grant];
		else editScopes = [...editScopes, grant];
	}

	function removeScope(target: 'create' | 'edit', grant: ScopeGrant): void {
		if (target === 'create') createScopes = createScopes.filter((item) => item.level !== grant.level || item.targetId !== grant.targetId);
		else editScopes = editScopes.filter((item) => item.level !== grant.level || item.targetId !== grant.targetId);
	}

	function changeCreateRole(role: RoleCode): void {
		createRole = role;
		createGlobal = role === 'superadmin';
		if (createGlobal) createScopes = [];
	}

	function updateNotice(kind: 'success' | 'error' | 'info', message: string): void {
		noticeKind = kind;
		notice = message;
	}

	async function createUser(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (mutationLoading) return;
		mutationLoading = true;
		try {
			const token = await csrfToken();
			const payload = await request<{ id: string }>('/admin/users', {
				method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': token },
				body: JSON.stringify({
					username: createUsername, displayName: createDisplayName, roleCode: createRole,
					password: createPassword, passwordConfirm: createPasswordConfirm,
					globalScope: createGlobal, currentPassword: createGlobal ? createGlobalPassword : undefined,
					scopes: createGlobal ? [] : createScopes.map(({ level, targetId }) => ({ level, targetId }))
				})
			});
			createUsername = ''; createDisplayName = ''; createPassword = ''; createPasswordConfirm = ''; createGlobalPassword = '';
			createRole = 'officer'; createGlobal = false; createScopes = []; showCreate = false;
			previousCursors = [null];
			await loadUsers(null);
			const added = users.find((user) => user.id === payload.id);
			if (added) await selectUser(added);
			updateNotice('success', 'Pengguna berhasil ditambahkan. Sampaikan password awal melalui kanal terpisah yang aman.');
		} catch (error: unknown) {
			updateNotice('error', error instanceof Error && error.message === 'username_already_exists'
				? 'Username sudah digunakan.' : 'Pengguna belum dapat ditambahkan. Periksa data dan coba lagi.');
		} finally { mutationLoading = false; }
	}

	async function saveScopes(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!selectedUser || mutationLoading) return;
		mutationLoading = true;
		try {
			const token = await csrfToken();
			await request(`/admin/users/${selectedUser.id}/scopes`, {
				method: 'PUT', headers: { 'content-type': 'application/json', 'x-csrf-token': token },
				body: JSON.stringify({ globalScope: editGlobal, currentPassword,
					scopes: editGlobal ? [] : editScopes.map(({ level, targetId }) => ({ level, targetId })) })
			});
			currentPassword = '';
			await selectUser(selectedUser);
			updateNotice('success', 'Cakupan dan sesi pengguna sudah diperbarui. Pengguna perlu masuk kembali.');
		} catch {
			updateNotice('error', 'Perubahan cakupan gagal. Pastikan password konfirmasi benar dan cakupan masih aktif.');
		} finally { mutationLoading = false; }
	}

	async function deactivateUser(): Promise<void> {
		if (!selectedUser || mutationLoading) return;
		mutationLoading = true;
		try {
			const token = await csrfToken();
			await request(`/admin/users/${selectedUser.id}`, { method: 'DELETE', headers: { 'x-csrf-token': token } });
			showDeactivateConfirm = false;
			await loadUsers(currentCursor);
			const refreshed = users.find((user) => user.id === selectedUser?.id);
			if (refreshed) await selectUser(refreshed);
			updateNotice('success', 'Akun dinonaktifkan dan seluruh sesinya dicabut. Riwayat akun tetap tersimpan.');
		} catch {
			updateNotice('error', 'Akun tidak dapat dinonaktifkan. Superadmin aktif terakhir tidak bisa dinonaktifkan.');
		} finally { mutationLoading = false; }
	}

	async function logout(): Promise<void> {
		try {
			const token = await csrfToken();
			await request('/auth/logout', { method: 'POST', headers: { 'x-csrf-token': token } });
		} finally { window.location.assign('/'); }
	}

	function roleName(roleCode: RoleCode): string {
		return roles.find((role) => role.code === roleCode)?.label ?? roleCode;
	}

	function formatDate(value: string): string {
		return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
	}
</script>

<svelte:head>
	<title>User Management · DOMPIS</title>
	<meta name="description" content="Kelola akun dan cakupan akses DOMPIS." />
	<meta name="theme-color" content="#101220" />
</svelte:head>

<a class="skip-link" href="#main-content">Lewati ke konten</a>
<div class="admin-page">
	<header class="topbar">
		<a class="brand" href="/" aria-label="DOMPIS beranda"><span class="brand-mark">D</span><span>DOMPIS</span></a>
		<div class="topbar-actions">
			<span class="signed-user">{currentUserName || 'Memeriksa sesi…'}</span>
			<button class="quiet-button" type="button" onclick={toggleTheme}>{theme === 'dark' ? 'Mode terang' : 'Mode gelap'}</button>
			<button class="quiet-button" type="button" onclick={logout}>Keluar</button>
		</div>
	</header>
	<main id="main-content" class="workspace">
		<div class="page-heading">
			<div>
				<a class="back-link" href="/">Ruang kerja</a>
				<h1>Pengguna</h1>
				<p>Atur akun dan wilayah data yang dapat dikelola setiap pengguna.</p>
			</div>
			<button class="primary-button" type="button" onclick={() => showCreate = !showCreate} disabled={!canManage || pageLoading}>
				{showCreate ? 'Tutup form' : 'Tambah pengguna'}
			</button>
		</div>

		{#if notice}
			<p class="notice" class:notice-error={noticeKind === 'error'} class:notice-success={noticeKind === 'success'} role={noticeKind === 'error' ? 'alert' : 'status'}>{notice}</p>
		{/if}

		{#if pageLoading}
			<section class="panel loading-panel" aria-live="polite">Memeriksa akses dan memuat akun…</section>
		{:else if !canManage || !hasGlobalScope}
			<section class="panel access-denied"><h2>Akses dibatasi</h2><p>{notice || 'Halaman ini hanya tersedia untuk superadmin dengan cakupan global.'}</p><a class="secondary-button" href="/">Kembali ke halaman masuk</a></section>
		{:else}
			{#if showCreate}
				<section class="panel create-panel" aria-labelledby="create-title">
					<div class="panel-heading"><div><p class="section-kicker">AKUN BARU</p><h2 id="create-title">Tambah pengguna</h2></div><span class="panel-note">Password disetel oleh superadmin</span></div>
					<form onsubmit={createUser} class="create-form">
						<div class="form-grid">
							<label>Username<input bind:value={createUsername} minlength="4" maxlength="50" autocomplete="off" required placeholder="contoh.nama" /></label>
							<label>Nama pengguna<input bind:value={createDisplayName} minlength="2" maxlength="120" required placeholder="Nama yang tampil di aplikasi" /></label>
							<label>Role<select value={createRole} onchange={(event) => changeCreateRole(event.currentTarget.value as RoleCode)}>{#each roles as role}<option value={role.code}>{role.label}</option>{/each}</select></label>
							<label>Password awal<input bind:value={createPassword} type="password" minlength="12" maxlength="1024" autocomplete="new-password" required /></label>
							<label>Ulangi password awal<input bind:value={createPasswordConfirm} type="password" minlength="12" maxlength="1024" autocomplete="new-password" required /></label>
						</div>
						{#if createRole !== 'superadmin'}<p class="inline-warning">Role ini belum memiliki permission produk. Akun dapat dibuat, tetapi tidak bisa membuka ticket atau laporan sampai akses role disetujui.</p>{/if}
						{#if createGlobal}
							<div class="global-callout"><strong>Superadmin mendapat cakupan data global.</strong><span>Konfirmasi password Anda untuk membuat administrator global.</span><label>Password Anda<input bind:value={createGlobalPassword} type="password" autocomplete="current-password" required /></label></div>
						{:else}
							<div class="scope-builder">
								<div class="builder-heading"><div><h3>Cakupan wilayah</h3><p>Tambahkan satu atau beberapa cabang wilayah.</p></div></div>
								<div class="scope-controls">
									<label>Level scope<select value={grantLevel} onchange={(event) => void onGrantLevelChange(event.currentTarget.value as ScopeLevel)}>{#each levels as level}<option value={level.code}>{level.label}</option>{/each}</select></label>
									<label class="search-field">Cari kode/nama<input bind:value={scopeSearch} maxlength="80" placeholder="Ketik awalan kode atau nama" /></label>
									<button class="secondary-button" type="button" onclick={() => void refreshScopeOptions()}>Terapkan pencarian</button>
								</div>
								<div class="scope-path">
									<label>Area<select value={areaId} onchange={(event) => void onAreaChange(event.currentTarget.value)}><option value="">Pilih area</option>{#each areas as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>
									{#if levelDepth[grantLevel] >= 1}<label>Region<select value={regionId} disabled={!areaId} onchange={(event) => void onRegionChange(event.currentTarget.value)}><option value="">Pilih region</option>{#each regions as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
									{#if levelDepth[grantLevel] >= 2}<label>Branch<select value={branchId} disabled={!regionId} onchange={(event) => void onBranchChange(event.currentTarget.value)}><option value="">Pilih branch</option>{#each branches as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
									{#if levelDepth[grantLevel] >= 3}<label>Service Area<select value={serviceAreaId} disabled={!branchId} onchange={(event) => void onServiceAreaChange(event.currentTarget.value)}><option value="">Pilih Service Area</option>{#each serviceAreas as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
									{#if levelDepth[grantLevel] >= 4}<label>Workzone<select bind:value={workzoneId} disabled={!serviceAreaId}><option value="">Pilih Workzone</option>{#each workzones as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
								</div>
								<button class="secondary-button" type="button" onclick={() => addScope('create')} disabled={!selectedGrant()}>Tambahkan cakupan</button>
								{#if createScopes.length}<ul class="scope-chips">{#each createScopes as grant}<li>{grant.label}<button type="button" aria-label={`Hapus ${grant.label}`} onclick={() => removeScope('create', grant)}>×</button></li>{/each}</ul>{/if}
							</div>
						{/if}
						<div class="form-actions"><button class="primary-button" type="submit" disabled={mutationLoading}>{mutationLoading ? 'Menyimpan…' : 'Buat akun'}</button></div>
					</form>
				</section>
			{/if}

			<div class="admin-grid">
				<section class="panel user-list-panel" aria-labelledby="users-title">
					<div class="panel-heading"><div><p class="section-kicker">AKSES APLIKASI</p><h2 id="users-title">Daftar pengguna</h2></div><span class="panel-note">Maks. 50 per halaman</span></div>
					{#if listLoading}<p class="empty-state">Memuat pengguna…</p>
					{:else if users.length === 0}<div class="empty-state"><strong>Belum ada pengguna.</strong><span>Mulai dengan menambahkan akun yang perlu mengakses DOMPIS.</span></div>
					{:else}
						<ul class="user-list">{#each users as user (user.id)}
							<li><button class="user-row" class:selected={selectedUserId === user.id} type="button" onclick={() => void selectUser(user)}>
								<span class="user-avatar" aria-hidden="true">{user.displayName.slice(0, 1).toUpperCase()}</span>
								<span class="user-primary"><strong>{user.displayName}</strong><span>@{user.username}</span></span>
								<span class="user-meta"><span class="role-pill">{roleName(user.roleCode)}</span><span class:status-inactive={!user.active} class="status-pill">{user.active ? 'Aktif' : 'Nonaktif'}</span></span>
							</button></li>
						{/each}</ul>
						<div class="pagination"><button class="quiet-button" type="button" onclick={() => { if (previousCursors.length > 1) { previousCursors = previousCursors.slice(0, -1); void loadUsers(previousCursors.at(-1) ?? null); } }} disabled={previousCursors.length <= 1 || listLoading}>Sebelumnya</button><button class="quiet-button" type="button" onclick={() => { if (nextCursor) { previousCursors = [...previousCursors, nextCursor]; void loadUsers(nextCursor); } }} disabled={!nextCursor || listLoading}>Berikutnya</button></div>
					{/if}
				</section>

				<section class="panel detail-panel" aria-labelledby="detail-title">
					{#if !selectedUser}
						<div class="empty-detail"><span class="detail-mark" aria-hidden="true">↗</span><h2 id="detail-title">Pilih pengguna</h2><p>Rincian akun, status, dan cakupan wilayah akan tampil di sini.</p></div>
					{:else}
						<div class="panel-heading detail-heading"><div><p class="section-kicker">RINCIAN AKUN</p><h2 id="detail-title">{selectedUser.displayName}</h2><p class="identity-line">@{selectedUser.username} · {roleName(selectedUser.roleCode)}</p></div><span class:status-inactive={!selectedUser.active} class="status-pill">{selectedUser.active ? 'Aktif' : 'Nonaktif'}</span></div>
						<div class="account-facts"><div><span>Status</span><strong>{selectedUser.active ? 'Bisa masuk' : 'Tidak dapat masuk'}</strong></div><div><span>Cakupan</span><strong>{selectedUser.globalScope ? 'Seluruh aplikasi' : `${editScopes.length} scope`}</strong></div><div><span>Dibuat</span><strong>{formatDate(selectedUser.createdAt)}</strong></div></div>
						<form class="scope-editor" onsubmit={saveScopes}>
							<div class="builder-heading"><div><h3>Atur cakupan data</h3><p>Perubahan mencabut sesi aktif pengguna.</p></div></div>
							{#if selectedUser.id === currentUserId}<p class="inline-warning">Cakupan akun Anda sendiri tidak dapat diubah dari halaman ini.</p>
							{:else}
								<label class="global-toggle"><input type="checkbox" bind:checked={editGlobal} onchange={() => { if (editGlobal) editScopes = []; }} /> Beri cakupan data global</label>
								{#if !editGlobal}
									<div class="scope-controls">
										<label class="search-field">Cari kode/nama<input bind:value={scopeSearch} maxlength="80" placeholder="Ketik awalan kode atau nama" /></label>
										<button class="secondary-button" type="button" onclick={() => void refreshScopeOptions()}>Terapkan pencarian</button>
									</div>
									<div class="scope-path">
										<label>Level scope<select value={grantLevel} onchange={(event) => void onGrantLevelChange(event.currentTarget.value as ScopeLevel)}>{#each levels as level}<option value={level.code}>{level.label}</option>{/each}</select></label>
										<label>Area<select value={areaId} onchange={(event) => void onAreaChange(event.currentTarget.value)}><option value="">Pilih area</option>{#each areas as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>
										{#if levelDepth[grantLevel] >= 1}<label>Region<select value={regionId} disabled={!areaId} onchange={(event) => void onRegionChange(event.currentTarget.value)}><option value="">Pilih region</option>{#each regions as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
										{#if levelDepth[grantLevel] >= 2}<label>Branch<select value={branchId} disabled={!regionId} onchange={(event) => void onBranchChange(event.currentTarget.value)}><option value="">Pilih branch</option>{#each branches as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
										{#if levelDepth[grantLevel] >= 3}<label>Service Area<select value={serviceAreaId} disabled={!branchId} onchange={(event) => void onServiceAreaChange(event.currentTarget.value)}><option value="">Pilih Service Area</option>{#each serviceAreas as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
										{#if levelDepth[grantLevel] >= 4}<label>Workzone<select bind:value={workzoneId} disabled={!serviceAreaId}><option value="">Pilih Workzone</option>{#each workzones as item}<option value={item.id}>{item.code} · {item.name}</option>{/each}</select></label>{/if}
									</div>
									<button class="secondary-button" type="button" onclick={() => addScope('edit')} disabled={!selectedGrant()}>Tambahkan cakupan</button>
									{#if editScopes.length}<ul class="scope-chips">{#each editScopes as grant}<li>{grant.label}<button type="button" aria-label={`Hapus ${grant.label}`} onclick={() => removeScope('edit', grant)}>×</button></li>{/each}</ul>{:else}<p class="empty-scopes">Belum ada scope. Akun ini belum dapat membaca data ticket.</p>{/if}
								{/if}
								<label class="reauth-label">Konfirmasi password superadmin<input bind:value={currentPassword} type="password" autocomplete="current-password" required /></label>
								<button class="primary-button" type="submit" disabled={mutationLoading || !selectedUser.active}>{mutationLoading ? 'Menyimpan…' : 'Simpan cakupan'}</button>
							{/if}
						</form>
						<div class="danger-zone">
							<div><strong>Nonaktifkan akun</strong><span>Akses berhenti; riwayat dan audit tetap disimpan.</span></div>
							{#if showDeactivateConfirm}<div class="confirm-inline"><span>Nonaktifkan akun ini?</span><button class="danger-button" type="button" onclick={() => void deactivateUser()} disabled={mutationLoading}>Ya, nonaktifkan</button><button class="quiet-button" type="button" onclick={() => showDeactivateConfirm = false}>Batal</button></div>
							{:else}<button class="danger-button" type="button" onclick={() => showDeactivateConfirm = true} disabled={!selectedUser.active || selectedUser.id === currentUserId}>Nonaktifkan</button>{/if}
						</div>
					{/if}
				</section>
			</div>
		{/if}
	</main>
</div>

<style>
	:global(:root) { --canvas:#101220; --surface:#181A29; --raised:#2A2F45; --text:#FFFFFF; --muted:#C5CAD3; --primary:#AD0E27; --deep:#750A1C; color-scheme:dark; }
	:global(:root[data-theme='light']) { --canvas:#FFFFFF; --surface:#C5CAD3; --raised:#2A2F45; --text:#101220; --muted:#2A2F45; --primary:#750A1C; --deep:#AD0E27; color-scheme:light; }
	:global(*) { box-sizing:border-box; }
	:global(body) { margin:0; background:var(--canvas); color:var(--text); font:14px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
	:global(button),:global(input),:global(select) { font:inherit; }
	:global(button:focus-visible),:global(a:focus-visible),:global(input:focus-visible),:global(select:focus-visible) { outline:2px solid var(--primary); outline-offset:2px; }
	.skip-link { position:fixed; top:8px; left:12px; z-index:5; transform:translateY(-150%); padding:10px 14px; background:var(--deep); color:white; border-radius:6px; }
	.skip-link:focus { transform:translateY(0); }
	.admin-page { min-height:100vh; background:var(--canvas); }
	.topbar { height:64px; padding:0 clamp(16px,4vw,52px); display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--raised); background:var(--surface); }
	.brand { display:flex; align-items:center; gap:10px; color:var(--text); text-decoration:none; font-size:15px; font-weight:750; letter-spacing:.08em; }
	.brand-mark { display:grid; place-items:center; width:30px; height:30px; border-radius:7px; background:var(--primary); color:white; font-weight:800; }
	.topbar-actions { display:flex; align-items:center; gap:12px; }
	.signed-user { color:var(--muted); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
	.quiet-button,.secondary-button,.primary-button,.danger-button { min-height:40px; padding:8px 14px; border:1px solid var(--raised); border-radius:7px; cursor:pointer; text-decoration:none; }
	.quiet-button { color:var(--text); background:transparent; }
	.secondary-button { color:var(--text); background:var(--surface); }
	.primary-button { display:inline-flex; align-items:center; justify-content:center; border-color:var(--primary); color:#fff; background:var(--primary); font-weight:650; }
	.danger-button { color:#fff; background:#8d162b; border-color:#8d162b; }
	button:disabled { opacity:.5; cursor:not-allowed; }
	.workspace { max-width:1440px; margin:0 auto; padding:32px clamp(16px,4vw,52px) 48px; }
	.page-heading { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-bottom:24px; }
	.back-link { color:var(--muted); text-decoration:none; font-size:13px; }
	h1,h2,h3,p { margin-top:0; }
	h1 { margin:7px 0 4px; font-size:28px; line-height:1.2; letter-spacing:-.025em; }
	.page-heading p { margin:0; color:var(--muted); }
	.panel { border:1px solid var(--raised); border-radius:10px; background:var(--surface); }
	.notice { padding:12px 14px; margin:0 0 18px; border:1px solid var(--raised); border-radius:7px; color:var(--text); background:var(--surface); }
	.notice-error { border-color:#AD0E27; }
	.notice-success { border-color:#4c8b6a; }
	.loading-panel,.access-denied { padding:28px; }
	.access-denied p { color:var(--muted); }
	.create-panel { padding:22px; margin-bottom:20px; }
	.panel-heading { display:flex; justify-content:space-between; align-items:start; gap:16px; margin-bottom:20px; }
	.panel-heading h2 { font-size:19px; line-height:1.25; margin:0; }
	.section-kicker { margin:0 0 5px; color:var(--muted); font-size:11px; font-weight:700; letter-spacing:.1em; }
	.panel-note { color:var(--muted); font-size:12px; }
	.form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
	label { display:grid; gap:6px; font-weight:600; }
	input,select { width:100%; min-height:42px; padding:9px 11px; border:1px solid var(--raised); border-radius:6px; color:var(--text); background:var(--canvas); }
	input::placeholder { color:var(--muted); opacity:.75; }
	.global-callout { display:grid; grid-template-columns:1fr 1.4fr minmax(220px,1fr); align-items:center; gap:16px; margin-top:18px; padding:16px; border-left:3px solid var(--primary); background:var(--canvas); }
	.global-callout span { color:var(--muted); }
	.scope-builder,.scope-editor { margin-top:20px; padding-top:18px; border-top:1px solid var(--raised); }
	.builder-heading { display:flex; align-items:start; justify-content:space-between; gap:12px; margin-bottom:12px; }
	.builder-heading h3 { margin:0 0 3px; font-size:15px; }
	.builder-heading p { margin:0; color:var(--muted); font-size:13px; }
	.scope-controls { display:grid; grid-template-columns:minmax(150px,.7fr) minmax(220px,1.3fr) auto; align-items:end; gap:12px; margin:12px 0; }
	.scope-path { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin:12px 0; }
	.form-actions { display:flex; justify-content:flex-end; margin-top:18px; }
	.scope-chips { display:flex; flex-wrap:wrap; gap:8px; list-style:none; margin:12px 0 0; padding:0; }
	.scope-chips li { display:flex; align-items:center; gap:8px; padding:6px 8px 6px 10px; border:1px solid var(--raised); border-radius:6px; color:var(--text); background:var(--canvas); font-size:12px; }
	.scope-chips button { width:24px; height:24px; border:0; border-radius:4px; color:var(--text); background:var(--raised); cursor:pointer; font-size:18px; line-height:1; }
	.admin-grid { display:grid; grid-template-columns:minmax(300px,.82fr) minmax(460px,1.18fr); align-items:start; gap:18px; }
	.user-list-panel,.detail-panel { min-height:360px; padding:20px; }
	.user-list-panel .panel-heading { align-items:center; margin-bottom:12px; }
	.user-list-panel .panel-heading h2 { font-size:17px; }
	.user-list { list-style:none; margin:0; padding:0; }
	.user-list li+li { border-top:1px solid var(--raised); }
	.user-row { display:flex; width:100%; min-height:70px; align-items:center; gap:11px; padding:10px 2px; border:0; text-align:left; color:var(--text); background:transparent; cursor:pointer; }
	.user-row.selected { background:color-mix(in srgb,var(--primary) 12%,transparent); }
	.user-avatar { flex:0 0 36px; display:grid; place-items:center; width:36px; height:36px; border-radius:50%; color:#fff; background:var(--deep); font-weight:700; }
	.user-primary { flex:1; min-width:0; display:grid; gap:2px; }
	.user-primary strong,.user-primary span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
	.user-primary span,.identity-line { color:var(--muted); font-size:12px; }
	.user-meta { display:grid; justify-items:end; gap:4px; }
	.role-pill,.status-pill { display:inline-flex; align-items:center; min-height:22px; padding:2px 7px; border:1px solid var(--raised); border-radius:999px; color:var(--muted); font-size:10px; white-space:nowrap; }
	.status-pill { color:#b7e0c6; border-color:#3d7455; }
	.status-inactive { color:var(--muted); border-color:var(--raised); }
	.pagination { display:flex; justify-content:space-between; padding-top:12px; border-top:1px solid var(--raised); }
	.empty-state { display:grid; gap:5px; padding:34px 10px; color:var(--muted); text-align:center; }
	.empty-state strong { color:var(--text); }
	.empty-detail { display:grid; justify-items:center; align-content:center; min-height:300px; text-align:center; }
	.detail-mark { display:grid; place-items:center; width:42px; height:42px; margin-bottom:14px; border-radius:9px; color:#fff; background:var(--primary); font-size:22px; }
	.empty-detail h2 { margin:0 0 4px; font-size:18px; }
	.empty-detail p { max-width:300px; color:var(--muted); }
	.detail-heading { align-items:center; margin-bottom:16px; }
	.detail-heading h2 { margin-bottom:4px; }
	.identity-line { margin:0; }
	.account-facts { display:grid; grid-template-columns:repeat(3,1fr); padding:14px 0; border-top:1px solid var(--raised); border-bottom:1px solid var(--raised); }
	.account-facts div { display:grid; gap:3px; }
	.account-facts span { color:var(--muted); font-size:11px; }
	.account-facts strong { font-size:12px; }
	.global-toggle { display:flex; grid-template-columns:none; align-items:center; gap:8px; margin:12px 0; }
	.global-toggle input { width:18px; min-height:18px; accent-color:var(--primary); }
	.reauth-label { max-width:360px; margin:14px 0; }
	.inline-warning,.empty-scopes { padding:10px 12px; border-left:3px solid var(--primary); color:var(--muted); background:var(--canvas); font-size:13px; }
	.danger-zone { display:flex; justify-content:space-between; align-items:center; gap:14px; margin-top:22px; padding-top:18px; border-top:1px solid var(--raised); }
	.danger-zone div:first-child { display:grid; gap:2px; }
	.danger-zone div:first-child span { color:var(--muted); font-size:12px; }
	.confirm-inline { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
	.confirm-inline span { color:var(--text)!important; }
	@media(max-width:1000px) { .admin-grid { grid-template-columns:1fr; } .user-list-panel { min-height:unset; } }
	@media(max-width:680px) {
		.topbar { height:auto; min-height:60px; padding:10px 14px; }
		.topbar-actions { gap:6px; }
		.signed-user { display:none; }
		.quiet-button { min-height:36px; padding:6px 9px; font-size:12px; }
		.workspace { padding:22px 12px 32px; }
		.page-heading { align-items:start; }
		h1 { font-size:24px; }
		.page-heading p { max-width:250px; font-size:13px; }
		.page-heading>.primary-button { flex-shrink:0; padding-inline:10px; font-size:12px; }
		.create-panel,.user-list-panel,.detail-panel { padding:15px; }
		.form-grid,.global-callout,.scope-controls { grid-template-columns:1fr; }
		.account-facts { grid-template-columns:1fr 1fr; gap:12px; }
		.user-row { gap:8px; }
		.user-meta { max-width:94px; }
		.role-pill { max-width:92px; overflow:hidden; text-overflow:ellipsis; }
		.danger-zone { align-items:start; flex-direction:column; }
	}
</style>
