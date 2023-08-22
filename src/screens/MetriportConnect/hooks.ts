import { useStateTree } from 'models';
import { getUserIdentity } from 'services/auth';
import { fetchMetriportConnectToken, updatePatientIdentifier } from 'services/metriport';
import { useService } from 'fhir-react/src/hooks/service';
import { failure, isSuccess } from 'fhir-react/src/libs/remoteData';
import { isFailure } from 'fhir-react/lib/libs/remoteData';

export interface MetriportConnectProps {}

export function useMetriportConnect() {
    const { user } = useStateTree();
    const userId = user.appleUserId;
    const [response] = useService(async () => {
        if (userId && user.patient) {
            const userIdentity = await getUserIdentity();
            if (userIdentity?.jwt) {
                const metriportTokenResponse = await fetchMetriportConnectToken(userIdentity.jwt);

                if (isSuccess(metriportTokenResponse)) {
                    const patientUpdateResponse = await updatePatientIdentifier({
                        token: userIdentity.jwt,
                        patient: user.patient,
                        metriportUserId: metriportTokenResponse.data.metriportUserId,
                    });

                    if (isFailure(patientUpdateResponse)) {
                        return patientUpdateResponse;
                    }
                    user.switchPatient(patientUpdateResponse.data);
                }

                return metriportTokenResponse;
            } else {
                return failure('Apple User token is outdated, please re-login');
            }
        } else {
            return failure('Please log in with Apple ID');
        }
    });

    return { response };
}
