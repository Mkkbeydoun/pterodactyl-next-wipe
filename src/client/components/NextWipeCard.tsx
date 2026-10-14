import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CalendarSync } from 'lucide-react';
import { Button, Dialog, httpErrorToHuman, toast, usePanelNavigate, type SdkServer as Server } from '@pterodactyl/sdk';
import { deleteWipe, savePublic, saveWipe, wipeQuery, type WipeInput, type WipeResponse } from '../api';
import { browserTimezone, countdown, formatWhen, repeatLabel } from '../countdown';
import PublicForm from './PublicForm';
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
    const navigate = usePanelNavigate();
    const now = useNow(1000);
    const [editing, setEditing] = useState(false);
    const { data } = useQuery({ ...wipeQuery(uuid), enabled: Boolean(uuid) });

    const saved = (message: string) => (response: WipeResponse) => {
        client.setQueryData(wipeQuery(uuid).queryKey, response);
        toast.success(message);
        setEditing(false);
    };
    const failed = (error: Error) => toast.error(httpErrorToHuman(error));

    const save = useMutation({
        mutationFn: (input: WipeInput) => saveWipe(uuid, input),
        onSuccess: saved('Wipe schedule saved.'),
        onError: failed,
    });

    const share = useMutation({
        mutationFn: (enabled: boolean) => savePublic(uuid, enabled),
        onSuccess: saved('Public page saved.'),
        onError: failed,
    });

    const remove = useMutation({
        mutationFn: () => deleteWipe(uuid),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: wipeQuery(uuid).queryKey });
            toast.success('Wipe schedule removed.');
            setEditing(false);
        },
        onError: failed,
    });

    if (!data || (!data.data && !data.can_manage)) return null;

    const wipe = data.data;
    // Wipe & Season Manager plans drive the countdown; they are changed on the server's Wipes tab.
    const fromPlans = wipe?.source === 'wipe-season-manager';
    const left = wipe?.next_at ? countdown(wipe.next_at, now) : null;
    const otherZone = wipe && wipe.timezone !== browserTimezone();

    const openWipes = () => {
        const id = server.attributes.identifier;
        try {
            void navigate({ extension: 'wipe-season-manager', screen: 'wipes', params: { id } });
        } catch {
            window.location.assign(`/server/${id}/wipes`);
        }
    };

    return (
        <div className='rxnw:mt-0 rxnw:mb-3 rxnw:flex rxnw:flex-wrap rxnw:items-center rxnw:gap-x-3 rxnw:gap-y-2 rxnw:rounded-md rxnw:border rxnw:border-border rxnw:bg-card rxnw:px-4 rxnw:py-2 rxnw:text-card-foreground'>
            <CalendarClock size={16} aria-hidden='true' className='rxnw:shrink-0 rxnw:text-muted-foreground' />
            <div className='rxnw:min-w-0 rxnw:flex-1 rxnw:basis-56'>
                {wipe ? (
                    <>
                        <p className='rxnw:truncate rxnw:text-sm rxnw:text-muted-foreground'>
                            {wipe.label} · {repeatLabel(wipe.repeat)} · {wipe.timezone}
                        </p>
                        <p className='rxnw:font-semibold' aria-live='off'>
                            {wipe.next_at ? (left ? `in ${left}` : 'Wiping now') : 'No upcoming wipe'}
                            {wipe.next_at && (
                                <span
                                    className='rxnw:ml-2 rxnw:text-sm rxnw:font-normal rxnw:text-muted-foreground'
                                    title={`${formatWhen(wipe.next_at, wipe.timezone)} (${wipe.timezone})`}
                                >
                                    {formatWhen(wipe.next_at)}
                                    {otherZone && ` · ${formatWhen(wipe.next_at, wipe.timezone)} ${wipe.timezone}`}
                                </span>
                            )}
                        </p>
                    </>
                ) : (
                    <p className='rxnw:text-sm rxnw:text-muted-foreground'>No wipe scheduled for this server.</p>
                )}
            </div>
            {fromPlans
                ? (data.can_manage_plans || data.can_manage) && (
                      <div className='rxnw:flex rxnw:items-center rxnw:gap-2'>
                          {data.can_manage && (
                              <Button isSecondary onClick={() => setEditing(true)}>
                                  Public page
                              </Button>
                          )}
                          {data.can_manage_plans && (
                              <Button isSecondary onClick={openWipes}>
                                  <span className='rxnw:inline-flex rxnw:items-center rxnw:gap-2'>
                                      <CalendarSync size={16} aria-hidden='true' />
                                      Wipes
                                  </span>
                              </Button>
                          )}
                      </div>
                  )
                : data.can_manage && (
                      <Button isSecondary onClick={() => setEditing(true)}>
                          {wipe ? 'Edit' : 'Set next wipe'}
                      </Button>
                  )}
            <Dialog open={editing} onClose={() => setEditing(false)} title={fromPlans ? 'Public page' : 'Wipe schedule'}>
                {editing &&
                    (fromPlans ? (
                        <PublicForm
                            initial={data.public}
                            url={data.public_url}
                            pending={share.isPending}
                            onCancel={() => setEditing(false)}
                            onSubmit={(enabled) => share.mutate(enabled)}
                        />
                    ) : (
                        <WipeForm
                            initial={data.schedule}
                            isPublic={data.public}
                            publicUrl={data.public_url}
                            pending={save.isPending || remove.isPending}
                            onCancel={() => setEditing(false)}
                            onDelete={() => remove.mutate()}
                            onSubmit={(input) => save.mutate(input)}
                        />
                    ))}
            </Dialog>
        </div>
    );
}
