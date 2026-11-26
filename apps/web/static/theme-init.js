(() => {
	let storedTheme = null;
	try {
		storedTheme = window.localStorage.getItem('dompis-theme');
	} catch {
		// Browser storage may be disabled by policy.
	}

	const theme = storedTheme === 'light' || storedTheme === 'dark'
		? storedTheme
		: window.matchMedia('(prefers-color-scheme: light)').matches
			? 'light'
			: 'dark';
	document.documentElement.dataset.theme = theme;
})();
