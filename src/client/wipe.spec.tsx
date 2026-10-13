import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createExtensionTestHost, createTestServer } from '@pterodactyl/sdk/testing';
import NextWipeCard from './components/NextWipeCard';
import { wipeQuery, type WipeResponse } from './api';
import { countdown, repeatLabel, toZonedInput } from './countdown';

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

const response = (overrides: Partial<WipeResponse> = {}): WipeResponse => ({
    data: null,
    schedule: null,
    public: false,
    public_url: null,
    can_manage: false,
    can_manage_plans: false,
    ...overrides,
});

const inTwoDays = () => new Date(Date.now() + (2 * 86400 + 3 * 3600 + 60) * 1000).toISOString();

test('countdown formats days, hours and minutes', () => {
    const now = Date.parse('2026-10-10T00:00:00Z');
    expect(countdown('2026-10-13T04:12:00Z', now)).toBe('3d 4h 12m');
    expect(countdown('2026-10-10T02:05:00Z', now)).toBe('2h 5m');
    expect(countdown('2026-10-10T00:01:30Z', now)).toBe('1m 30s');
    expect(countdown('2026-10-09T00:00:00Z', now)).toBeNull();
});

test('form times are read on the wall clock of the schedule time zone, across daylight saving', () => {
    // 19:00 in London is 18:00 UTC in summer time and 19:00 UTC in winter.
    expect(toZonedInput('2026-10-15T18:00:00Z', 'Europe/London')).toBe('2026-10-15T19:00');
    expect(toZonedInput('2026-11-05T19:00:00Z', 'Europe/London')).toBe('2026-11-05T19:00');
    expect(toZonedInput('2026-11-05T19:00:00Z', 'America/New_York')).toBe('2026-11-05T14:00');
    expect(toZonedInput('2026-10-15T00:30:00Z', 'UTC')).toBe('2026-10-15T00:30');
    expect(toZonedInput(null, 'UTC')).toBe('');
});

test('repeats from Wipe & Season Manager plans have labels', () => {
    expect(repeatLabel('weekly')).toBe('Every week');
    expect(repeatLabel('daily')).toBe('Every day');
    expect(repeatLabel('once')).toBe('Once');
});

test('nothing shows for users who cannot manage a server without a schedule', async () => {
    host.queryClient.setQueryData(key, response());
    const { container } = render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    await waitFor(() => expect(container.textContent).toBe(''));
});

test('managers are offered to set a wipe', async () => {
    host.queryClient.setQueryData(key, response({ can_manage: true }));
    render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Set next wipe')).toBeTruthy();
});

test('the countdown shows for everyone, without an edit button for viewers', async () => {
    host.queryClient.setQueryData(key, response({
        data: { source: 'next-wipe', label: 'Map wipe', repeat: 'weekly', timezone: 'Europe/London', next_at: inTwoDays() },
    }));
    render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    expect(await screen.findByText(/in 2d 3h/)).toBeTruthy();
    expect(screen.getByText('Map wipe · Every week · Europe/London')).toBeTruthy();
    expect(screen.queryByText('Edit')).toBeNull();
});

test('managers edit their own schedule with a time zone picker', async () => {
    host.queryClient.setQueryData(key, response({
        data: { source: 'next-wipe', label: 'Map wipe', repeat: 'weekly', timezone: 'Europe/London', next_at: inTwoDays() },
        schedule: { label: 'Map wipe', anchor_at: '2026-10-15T18:00:00+00:00', anchor_local: '2026-10-15T19:00', repeat: 'weekly', timezone: 'Europe/London' },
        can_manage: true,
    }));
    render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    fireEvent.click(await screen.findByText('Edit'));
    expect(await screen.findByText('Time zone')).toBeTruthy();
    expect((document.getElementById('rxnw-anchor') as HTMLInputElement).value).toBe('2026-10-15T19:00');
    expect(screen.queryByText('Wipes')).toBeNull();
});

test('a Wipe & Season Manager plan drives the card and Edit becomes a link to the Wipes tab', async () => {
    host.queryClient.setQueryData(key, response({
        data: { source: 'wipe-season-manager', label: 'Weekly wipe', repeat: 'weekly', timezone: 'Europe/London', next_at: inTwoDays() },
        schedule: { label: 'Old', anchor_at: '2026-09-03T19:00:00+00:00', anchor_local: '2026-11-05T19:00', repeat: 'first-thursday', timezone: 'UTC' },
        can_manage: true,
        can_manage_plans: true,
    }));
    render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Weekly wipe · Every week · Europe/London')).toBeTruthy();
    expect(screen.getByText(/in 2d 3h/)).toBeTruthy();
    expect(screen.queryByText('Edit')).toBeNull();
    expect(screen.getByText('Wipes')).toBeTruthy();

    // The dialog only offers the public page; the schedule itself lives on the Wipes tab.
    fireEvent.click(screen.getByText('Public page'));
    expect(await screen.findByText(/come from its plans on the Wipes tab/)).toBeTruthy();
    expect(screen.queryByText('Time zone')).toBeNull();
});

test('viewers of a planned server see the countdown without any buttons', async () => {
    host.queryClient.setQueryData(key, response({
        data: { source: 'wipe-season-manager', label: 'Weekly wipe', repeat: 'daily', timezone: 'UTC', next_at: inTwoDays() },
    }));
    render(<NextWipeCard data={server} />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Weekly wipe · Every day · UTC')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
});
