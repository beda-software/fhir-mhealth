import { useStateTree } from 'models';
import { getUserIdentity } from 'services/auth';
import { fetchMetriportConnectToken } from 'services/metriport';
import { useService } from 'fhir-react/lib/hooks/service';
import { failure } from 'fhir-react/lib/libs/remoteData';

export interface MetriportConnectProps {}

export function useMetriportWidget() {
    const { user } = useStateTree();
    const userId = user.appleUserId;
    const [response] = useService(async () => {
        if (userId) {
            const userIdentity = await getUserIdentity();
            console.log('userIdentity', userIdentity);
            if (userIdentity?.jwt) {
                return await fetchMetriportConnectToken(userIdentity.jwt, userId);
            } else {
                return failure('Apple User token is outdated, please re-login');
            }
        } else {
            return failure('Please log in with Apple ID');
        }
    }, [userId]);

    return { response };
}
