import { queryOptions } from '@tanstack/react-query';
import { http } from '@pterodactyl/sdk';

/** Next Wipe's own repeats. */
export type Repeat = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'first-thursday';

/** Where the shown wipe comes from: this extension's schedule, or a Wipe & Season Manager plan. */
export type WipeSource = 'next-wipe' | 'wipe-season-manager';

/** The wipe the console card shows. */
export interface Wipe {
    source: WipeSource;
    label: string;
    /** A Next Wipe repeat, or a Wipe & Season Manager one (`once`, `daily`, ...). */
    repeat: string;
    timezone: string;
    next_at: string | null;
}

/** This extension's own schedule, for the edit form. */
export interface Schedule {
    label: string;
    anchor_at: string;
    /** The next (or first) wipe as a datetime-local value in `timezone`. */
    anchor_local: string;
    repeat: Repeat;
    timezone: string;
}

export interface WipeResponse {
    data: Wipe | null;
    schedule: Schedule | null;
    public: boolean;
    public_url: string | null;
    can_manage: boolean;
    can_manage_plans: boolean;
}

export interface WipeInput {
    label: string;
    anchor_local: string;
    timezone: string;
    repeat: Repeat;
    public: boolean;
}

const path = (uuid: string) => `/api/client/servers/${uuid}/extensions/next-wipe/wipe`;

export const wipeQuery = (uuid: string) =>
    queryOptions({
        queryKey: ['next-wipe', uuid],
        queryFn: async () => (await http.get<WipeResponse>(path(uuid))).data,
        staleTime: 60_000,
    });

export async function saveWipe(uuid: string, input: WipeInput): Promise<WipeResponse> {
    return (await http.put<WipeResponse>(path(uuid), input)).data;
}

export async function savePublic(uuid: string, enabled: boolean): Promise<WipeResponse> {
    return (await http.put<WipeResponse>(`${path(uuid)}/public`, { public: enabled })).data;
}

export async function deleteWipe(uuid: string): Promise<void> {
    await http.delete(path(uuid));
}
