import { Middleware, TurnContext } from 'botbuilder';

export class AadTenantFilterMiddleware implements Middleware {
    private readonly tenantIds: Set<string>;

    constructor(...tenantIds: string[]) {
        this.tenantIds = new Set(tenantIds.map((id) => id.toUpperCase()));
    }

    async onTurn(
        context: TurnContext,
        next: () => Promise<void>
    ): Promise<void> {
        // get the tenantId from the activity
        const tenantId = context?.activity?.conversation?.tenantId?.toUpperCase();

        // if the tenant id isn't present or isn't one of the configured ids, ignore this activity
        if (!tenantId || !this.tenantIds.has(tenantId)) {
            return;
        }

        await next();
    }
}
