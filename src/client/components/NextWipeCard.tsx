import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { Button, Dialog, httpErrorToHuman, toast, type SdkServer as Server } from '@pterodactyl/sdk';
import { deleteWipe, saveWipe, wipeQuery, type WipeInput } from '../api';
import { countdown, REPEAT_LABELS } from '../countdown';
import WipeForm from './WipeForm';

const useNow = (ms: number) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(timer);
    }, [ms]);

    return now;
};

export default function NextWipeCard({ data: server }: { data: Server }) {
    const uuid = server.attributes.uuid;
    const client = useQueryClient();
    const now = useNow(1000);
    const [editing, setEditing] = useState(false);
    const { data } = useQuery({ ...wipeQuery(uuid), enabled: Boolean(uuid) });

    const save = useMutation({
        mutationFn: (input: WipeInput) => saveWipe(uuid, input),
        onSuccess: (response) => {
            client.setQueryData(wipeQuery(uuid).queryKey, response);
            toast.success('Wipe schedule saved.');
            setEditing(false);
        },
        onError: (error) => toast.error(httpErrorToHuman(error)),
    });

    const remove = useMutation({
        mutationFn: () => deleteWipe(uuid),
        onSuccess: () => {
            client.setQueryData(wipeQuery(uuid).queryKey, { data: null, can_manage: true });
            toast.success('Wipe schedule removed.');
            setEditing(false);
        },
        onError: (error) => toast.error(httpErrorToHuman(error)),
    });

    if (!data || (!data.data && !data.can_manage)) return null;

    const wipe = data.data;
    const left = wipe?.next_at ? countdown(wipe.next_at, now) : null;

    return (
        <div className='rxnw:mb-4 rxnw:flex rxnw:flex-wrap rxnw:items-center rxnw:gap-x-4 rxnw:gap-y-2 rxnw:rounded-md rxnw:border rxnw:border-border rxnw:bg-card rxnw:px-4 rxnw:py-3 rxnw:text-card-foreground'>
            <CalendarClock size={20} aria-hidden='true' className='rxnw:shrink-0 rxnw:text-muted-foreground' />
            <div className='rxnw:min-w-0 rxnw:flex-1'>
                {wipe ? (
                    <>
                        <p className='rxnw:text-sm rxnw:text-muted-foreground'>
                            {wipe.label} · {REPEAT_LABELS[wipe.repeat]}
                        </p>
                        <p className='rxnw:font-semibold' aria-live='off'>
                            {wipe.next_at
                                ? left
                                    ? `in ${left}`
                                    : 'Wiping now'
                                : 'No upcoming wipe'}
                            {wipe.next_at && (
                                <span className='rxnw:ml-2 rxnw:text-sm rxnw:font-normal rxnw:text-muted-foreground'>
                                    {new Date(wipe.next_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            )}
                        </p>
                    </>
                ) : (
                    <p className='rxnw:text-sm rxnw:text-muted-foreground'>No wipe scheduled for this server.</p>
                )}
            </div>
            {data.can_manage && (
                <Button size='small' isSecondary onClick={() => setEditing(true)}>
                    {wipe ? 'Edit' : 'Set next wipe'}
                </Button>
            )}
            <Dialog open={editing} onClose={() => setEditing(false)} title='Wipe schedule'>
                {editing && (
                    <WipeForm
                        initial={wipe}
                        pending={save.isPending || remove.isPending}
                        onCancel={() => setEditing(false)}
                        onDelete={() => remove.mutate()}
                        onSubmit={(input) => save.mutate(input)}
                    />
                )}
            </Dialog>
        </div>
    );
}
