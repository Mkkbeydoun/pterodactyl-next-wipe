import { useState, type FormEvent } from 'react';
import { Button, CopyOnClick, Dialog, Input, Label, Select, Switch } from '@pterodactyl/sdk';
import type { Repeat, Wipe, WipeInput } from '../api';
import { fromLocalInput, REPEAT_LABELS, toLocalInput } from '../countdown';

interface Props {
    initial: Wipe | null;
    pending: boolean;
    onCancel: () => void;
    onDelete: () => void;
    onSubmit: (input: WipeInput) => void;
}

export default function WipeForm({ initial, pending, onCancel, onDelete, onSubmit }: Props) {
    const [label, setLabel] = useState(initial?.label ?? 'Map wipe');
    const [anchor, setAnchor] = useState(toLocalInput(initial?.next_at ?? initial?.anchor_at ?? null));
    const [repeat, setRepeat] = useState<Repeat>(initial?.repeat ?? 'weekly');
    const [isPublic, setPublic] = useState(initial?.public ?? false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit({ label: label.trim(), anchor_at: fromLocalInput(anchor), repeat, public: isPublic });
    };

    return (
        <form onSubmit={submit} className='rxnw:flex rxnw:flex-col rxnw:gap-4'>
            <div>
                <Label htmlFor='rxnw-label'>Name</Label>
                <Input id='rxnw-label' value={label} maxLength={60} required onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className='rxnw:grid rxnw:gap-4 rxnw:sm:grid-cols-2'>
                <div>
                    <Label htmlFor='rxnw-anchor'>Next wipe (your time)</Label>
                    <Input
                        id='rxnw-anchor'
                        type='datetime-local'
                        value={anchor}
                        required
                        onChange={(e) => setAnchor(e.target.value)}
                    />
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
            </div>
            <Switch
                checked={isPublic}
                onChange={setPublic}
                label='Public page'
                description='A link anyone can open, for Discord or your website. It shows the server name and wipe time only.'
            />
            {isPublic && initial?.public_url && (
                <CopyOnClick text={initial.public_url}>
                    <code className='rxnw:block rxnw:cursor-pointer rxnw:truncate rxnw:rounded rxnw:bg-background rxnw:px-3 rxnw:py-2 rxnw:text-xs'>
                        {initial.public_url}
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
