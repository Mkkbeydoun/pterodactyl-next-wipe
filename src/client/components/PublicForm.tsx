import { useState, type FormEvent } from 'react';
import { Button, CopyOnClick, Dialog, Switch } from '@pterodactyl/sdk';

interface Props {
    initial: boolean;
    url: string | null;
    pending: boolean;
    onCancel: () => void;
    onSubmit: (enabled: boolean) => void;
}

/** The public page on its own, for servers whose wipes come from Wipe & Season Manager. */
export default function PublicForm({ initial, url, pending, onCancel, onSubmit }: Props) {
    const [enabled, setEnabled] = useState(initial);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit(enabled);
    };

    return (
        <form onSubmit={submit} className='rxnw:flex rxnw:flex-col rxnw:gap-4'>
            <p className='rxnw:text-sm rxnw:text-muted-foreground'>
                This server's wipes come from its plans on the Wipes tab. The countdown, the public page and its Discord
                preview all follow the next planned wipe.
            </p>
            <Switch
                checked={enabled}
                onChange={setEnabled}
                label='Public page'
                description='A link anyone can open, for Discord or your website. It shows the server name and wipe time only.'
            />
            {enabled && url && (
                <CopyOnClick text={url}>
                    <code className='rxnw:block rxnw:cursor-pointer rxnw:truncate rxnw:rounded rxnw:bg-background rxnw:px-3 rxnw:py-2 rxnw:text-xs'>
                        {url}
                    </code>
                </CopyOnClick>
            )}
            <Dialog.Footer>
                <Button isSecondary onClick={onCancel} disabled={pending}>
                    Cancel
                </Button>
                <Button type='submit' isLoading={pending}>
                    Save
                </Button>
            </Dialog.Footer>
        </form>
    );
}
