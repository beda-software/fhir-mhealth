import { useStateTree } from 'models';
import { getUserIdentity } from 'services/auth';
import { fetchMetriportConnectToken } from 'services/metriport';
import { useService } from 'fhir-react/src/hooks/service';
import { failure } from 'fhir-react/src/libs/remoteData';

export interface MetriportConnectProps {}

export function useMetriportConnect() {
    const { user } = useStateTree();
    const userId = user.appleUserId;
    const [response] = useService(async () => {
        if (userId) {
            const userIdentity = await getUserIdentity();
            if (userIdentity?.jwt) {
                return await fetchMetriportConnectToken(userIdentity.jwt, userId);
            } else {
                return failure('Apple User token is outdated, please re-login');
            }
        } else {
            return failure('Please log in with Apple ID');
        }
    });

    return { response };
}
