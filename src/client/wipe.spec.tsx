import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createExtensionTestHost, createTestServer } from '@pterodactyl/sdk/testing';
import NextWipeCard from './components/NextWipeCard';
import { wipeQuery } from './api';
import { countdown, fromLocalInput, toLocalInput } from './countdown';

const server = createTestServer({ uuid: 'f1a1b2c3-0000-4000-8000-000000000003' });
let host: ReturnType<typeof createExtensionTestHost>;

beforeEach(() => {
    host = createExtensionTestHost({ extensionId: 'next-wipe', prefix: 'rxnw', server });
});

afterEach(() => {
    cleanup();
    host.dispose();
});

const key = wipeQuery(server.attributes.uuid).queryKey;

test('countdown formats days, hours and minutes', () => {
    const now = Date.parse('2026-10-10T00:00:00Z');
    expect(countdown('2026-10-13T04:12:00Z', now)).toBe('3d 4h 12m');
    expect(countdown('2026-10-10T02:05:00Z', now)).toBe('2h 5m');
    expect(countdown('2026-10-10T00:01:30Z', now)).toBe('1m 30s');
    expect(countdown('2026-10-09T00:00:00Z', now)).toBeNull();
});

test('datetime-local values round-trip', () => {
    const iso = '2026-10-15T19:00:00.000Z';
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
});

test('nothing shows for users who cannot manage a server without a schedule', async () => {
    host.queryClient.setQueryData(key, { data: null, can_manage: false });
    const { container } = render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    await waitFor(() => expect(container.textContent).toBe(''));
});

test('managers are offered to set a wipe', async () => {
    host.queryClient.setQueryData(key, { data: null, can_manage: true });
    render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Set next wipe')).toBeTruthy();
});

test('the countdown shows for everyone, without an edit button for viewers', async () => {
    const next = new Date(Date.now() + (2 * 86400 + 3 * 3600 + 60) * 1000).toISOString();
    host.queryClient.setQueryData(key, {
        data: { label: 'Map wipe', anchor_at: next, repeat: 'weekly', next_at: next, public: false, public_url: null },
        can_manage: false,
    });
    render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    expect(await screen.findByText(/in 2d 3h/)).toBeTruthy();
    expect(screen.getByText('Map wipe · Every week')).toBeTruthy();
    expect(screen.queryByText('Edit')).toBeNull();
});
