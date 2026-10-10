import { queryOptions } from '@tanstack/react-query';
import { http } from '@pterodactyl/sdk';

export type Repeat = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'first-thursday';

export interface Wipe {
    label: string;
    anchor_at: string;
    repeat: Repeat;
    next_at: string | null;
    public: boolean;
    public_url: string | null;
}

export interface WipeResponse {
    data: Wipe | null;
    can_manage: boolean;
}

export interface WipeInput {
    label: string;
    anchor_at: string;
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

export async function deleteWipe(uuid: string): Promise<void> {
    await http.delete(path(uuid));
}
