<svelte:head>
	<title>DOMPIS</title>
	<meta name="description" content="DOMPIS Ticket Workspace" />
</svelte:head>

<main>
	<p class="eyebrow">DOMPIS</p>
	<h1>Ticket Workspace</h1>
	<p class="message">Fondasi aplikasi tersedia. Data dan laporan akan ditampilkan setelah API dan sumber data tervalidasi.</p>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: #f5f7fa;
		color: #172033;
		font-family: system-ui, sans-serif;
	}

	main {
		min-height: 100vh;
		display: grid;
		align-content: center;
		justify-items: center;
		padding: 24px;
		text-align: center;
	}

	.eyebrow {
		margin: 0 0 8px;
		color: #4338ca;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 5vw, 3rem);
	}

	.message {
		max-width: 34rem;
		color: #475569;
		line-height: 1.6;
	}
</style>
