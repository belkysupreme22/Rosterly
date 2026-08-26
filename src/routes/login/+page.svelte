<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			const result = await authClient.signIn.email({
				email,
				password,
				callbackURL: '/dashboard'
			});

			if (result.error) {
				errorMessage = result.error.message || 'Invalid credentials';
			} else {
				window.location.href = '/dashboard';
			}
		} catch (err) {
			errorMessage = 'An unexpected error occurred';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-page">
	<div class="w-full max-w-sm">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<h1 class="text-2xl font-bold text-brand-700">Rosterly</h1>
			<p class="mt-1 text-sm text-text-muted">Sign in to your account</p>
		</div>

		<!-- Login card -->
		<div class="rounded-lg border border-border bg-white p-6 shadow-sm">
			<form onsubmit={handleLogin} class="space-y-4">
				{#if errorMessage}
					<div class="rounded-md bg-danger-light px-3 py-2 text-sm text-danger">
						{errorMessage}
					</div>
				{/if}

				<Input label="Email" name="email" type="email" bind:value={email} required placeholder="you@company.com" />

				<Input label="Password" name="password" type="password" bind:value={password} required placeholder="Enter your password" />

				<Button type="submit" variant="primary" class="w-full" disabled={isLoading}>
					{isLoading ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>
		</div>

		<p class="mt-4 text-center text-xs text-text-muted">
			Contact your HR administrator for account access.
		</p>
	</div>
</div>
