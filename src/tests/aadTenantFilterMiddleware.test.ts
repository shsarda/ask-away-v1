import { TurnContext } from 'botbuilder';
import { AadTenantFilterMiddleware } from 'src/bot-middleware/aadTenantFilterMiddleware';

describe('AAD Tenant Filter middleware', () => {
    it(`should not call next when the tenant id isn't in the enabled list`, async () => {
        let hasBeenCalled = false;
        const middleware = new AadTenantFilterMiddleware();
        const context = <TurnContext>{
            activity: {
                conversation: {
                    tenantId: '00000000-0000-0000-0000-000000000000',
                },
            },
        };

        await middleware.onTurn(context, async () => {
            hasBeenCalled = true;
        });

        expect(hasBeenCalled).toBeFalsy();
    });

    it(`should call next when the tenant id is in the enabled list`, async () => {
        let hasBeenCalled = false;
        const middleware = new AadTenantFilterMiddleware(
            '00000000-0000-0000-0000-000000000000'
        );
        const context = <TurnContext>{
            activity: {
                conversation: {
                    tenantId: '00000000-0000-0000-0000-000000000000',
                },
            },
        };

        await middleware.onTurn(context, async () => {
            hasBeenCalled = true;
        });

        expect(hasBeenCalled).toBeTruthy();
    });
});
