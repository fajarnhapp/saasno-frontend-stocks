import type { Instrumentation } from 'next';

export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('./instrumentation-node');
    }
}

export const onRequestError: Instrumentation.onRequestError = async (_error, _request, context) => {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { countServerError } = await import('./utils/metricsServer');
        countServerError(context.routeType);
    }
};
