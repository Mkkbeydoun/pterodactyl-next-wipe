import { useMemo, useState, type FormEvent } from 'react';
import { Button, CopyOnClick, Dialog, Input, Label, Select, Switch } from '@pterodactyl/sdk';
import type { Repeat, Schedule, WipeInput } from '../api';
import { browserTimezone, REPEAT_LABELS, timezones } from '../countdown';

interface Props {
    initial: Schedule | null;
    isPublic: boolean;
    publicUrl: string | null;
    pending: boolean;
    onCancel: () => void;
    onDelete: () => void;
    onSubmit: (input: WipeInput) => void;
}

export default function WipeForm({ initial, isPublic: initialPublic, publicUrl, pending, onCancel, onDelete, onSubmit }: Props) {
    const [label, setLabel] = useState(initial?.label ?? 'Map wipe');
    const [anchor, setAnchor] = useState(initial?.anchor_local ?? '');
    // New schedules start in the browser's time zone.
    const [timezone, setTimezone] = useState(initial?.timezone ?? browserTimezone());
    const [repeat, setRepeat] = useState<Repeat>(initial?.repeat ?? 'weekly');
    const [isPublic, setPublic] = useState(initialPublic);

    const zones = useMemo(() => {
        const list = timezones();

        return (list.includes(timezone) ? list : [timezone, ...list]).map((zone) => ({ value: zone, label: zone }));
    }, [timezone]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit({ label: label.trim(), anchor_local: anchor, timezone, repeat, public: isPublic });
    };

    return (
        <form onSubmit={submit} className='rxnw:flex rxnw:flex-col rxnw:gap-4'>
            <div>
                <Label htmlFor='rxnw-label'>Name</Label>
                <Input id='rxnw-label' value={label} maxLength={60} required onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className='rxnw:grid rxnw:gap-4 rxnw:sm:grid-cols-2'>
                <div>
                    <Label htmlFor='rxnw-anchor'>Next wipe</Label>
                    <Input
                        id='rxnw-anchor'
                        type='datetime-local'
                        value={anchor}
                        required
                        onChange={(e) => setAnchor(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor='rxnw-timezone'>Time zone</Label>
                    <Select id='rxnw-timezone' value={timezone} options={zones} onChange={(v) => setTimezone(String(v))} />
                </div>
            </div>
            <div>
                <Label htmlFor='rxnw-repeat'>Repeats</Label>
                <Select
                    id='rxnw-repeat'
                    value={repeat}
                    options={Object.entries(REPEAT_LABELS).map(([value, label]) => ({ value, label }))}
                    onChange={(v) => setRepeat(v as Repeat)}
                />
            </div>
            <Switch
                checked={isPublic}
                onChange={setPublic}
                label='Public page'
                description='A link anyone can open, for Discord or your website. It shows the server name and wipe time only.'
            />
            {isPublic && publicUrl && (
                <CopyOnClick text={publicUrl}>
                    <code className='rxnw:block rxnw:cursor-pointer rxnw:truncate rxnw:rounded rxnw:bg-background rxnw:px-3 rxnw:py-2 rxnw:text-xs'>
                        {publicUrl}
                    </code>
                </CopyOnClick>
            )}
            <Dialog.Footer>
                {initial && (
                    <Button.Text onClick={onDelete} disabled={pending} className='rxnw:mr-auto'>
                        Remove
                    </Button.Text>
                )}
                <Button isSecondary onClick={onCancel} disabled={pending}>
                    Cancel
                </Button>
                <Button type='submit' isLoading={pending} disabled={!anchor}>
                    Save
                </Button>
            </Dialog.Footer>
        </form>
    );
}
