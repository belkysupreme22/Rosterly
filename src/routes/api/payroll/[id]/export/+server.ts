import type { RequestHandler } from './$types';
import { generateCbeBatchExport } from '$lib/server/payroll';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user || (user.role !== 'owner' && user.role !== 'hr_admin' && user.role !== 'manager')) {
		throw error(403, 'Unauthorized');
	}

	try {
		const csvContent = await generateCbeBatchExport(params.id);
		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="CBE_Payroll_Batch_${params.id.slice(0, 8)}.csv"`
			}
		});
	} catch (e: any) {
		throw error(404, e.message || 'Failed to generate CBE export');
	}
};
