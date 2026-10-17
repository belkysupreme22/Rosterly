<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Topbar from '$lib/components/Topbar.svelte';

	interface Props {
		data: {
			user: { id: string; name: string; email: string; role: string };
			employeeId: string | null;
			unreadNoticesCount: number;
			currentPath: string;
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();
</script>

<div class="flex min-h-screen bg-surface-page">
	<!-- Sidebar Navigation -->
	<Sidebar currentPath={data.currentPath} userRole={data.user.role} />

	<!-- Main content area -->
	<div class="ml-64 flex flex-1 flex-col">
		<Topbar
			userName={data.user.name}
			userRole={data.user.role}
			currentPath={data.currentPath}
			unreadNoticesCount={data.unreadNoticesCount}
			employeeId={data.employeeId}
		/>

		<main class="flex-1 p-6 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
