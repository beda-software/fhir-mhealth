import { HumanName } from 'fhir/r4b';

export function formatHumanName(name: HumanName) {
    return (name.given ?? [])
        .concat(name.family ?? [])
        .filter((part): part is string => part !== undefined)
        .join(' ');
}
