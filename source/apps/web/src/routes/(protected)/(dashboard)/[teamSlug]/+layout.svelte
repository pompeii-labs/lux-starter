<script lang="ts">
    import TeamPicker from "$lib/components/team-picker.svelte";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { sidebarMenuButtonVariants } from "$lib/components/ui/sidebar/sidebar-menu-button.svelte";
    import { LogOutIcon, SettingsIcon } from "@lucide/svelte";
    import type { LayoutProps } from "./$types";
    import { Button } from "$lib/components/ui/button";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import type { LuxProjectLiveSubscription } from "@luxdb/sdk";
    import type { Invites, Members } from "$lib/types/lux";
    import { onMount } from "svelte";
    import { invalidate } from "$app/navigation";

    let { children, data }: LayoutProps = $props();
    let { teams, profile, lux, session, team } = $derived(data);

    let memberSub: LuxProjectLiveSubscription<Members> | null = $state(null);
    let inviteSub: LuxProjectLiveSubscription<Invites> | null = $state(null);

    onMount(() => {
        async function subscribeMembers() {
            const { live: sub, error: luxError } = await lux
                .table('members')
                .select()
                .live();

            if (luxError) {
                return console.error(luxError);
            }

            memberSub = sub;
            memberSub?.on('change', () => {
                console.log('lux:members invalidated by realtime');
                invalidate("lux:members");
            });
        }

        async function subscribeInvites() {
            const { live: sub, error: luxError } = await lux
                .table('invites')
                .select()
                .live();

            if (luxError) {
                return console.error(luxError);
            }

            inviteSub = sub;
            inviteSub?.on('change', () => {
                console.log('lux:invites invalidated by realtime');
                invalidate("lux:invites");
            });
        }

        subscribeMembers();
        subscribeInvites();

        return () => {
            memberSub?.unsubscribe();
            memberSub = null;
            inviteSub?.unsubscribe();
            inviteSub = null;
        }
    })
</script>

<Sidebar.Provider>
    <Sidebar.Root>
        <Sidebar.Header>
            <p>Product</p>
            <Sidebar.Menu>
                <Sidebar.MenuItem>
                    <TeamPicker selectedTeamId={team.id} {teams} {session} class={sidebarMenuButtonVariants({ variant: "outline", class: "justify-between" })} />
                </Sidebar.MenuItem>
            </Sidebar.Menu>
        </Sidebar.Header>
        <Sidebar.Content>
            <Sidebar.Group>
                <Sidebar.GroupLabel>
                    Team
                </Sidebar.GroupLabel>
                <Sidebar.GroupContent>
                    <Sidebar.Menu>
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton isActive={page.route.id === ("/(protected)/(dashboard)/[teamSlug]/settings")}>
                                {#snippet child({ props })}
                                    <a href={resolve("/(protected)/(dashboard)/[teamSlug]/settings", { teamSlug: team.slug })} {...props}>
                                        <SettingsIcon />
                                        <span>Settings</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    </Sidebar.Menu>
                </Sidebar.GroupContent>
            </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
            <div class="flex items-center gap-4">
                <Sidebar.MenuButton>
                    {#snippet child({ props })}
                        <a {...props} href={resolve("/(protected)/account")}>
                            {profile.full_name ?? session.user.email}
                        </a>
                    {/snippet}
                </Sidebar.MenuButton>
                <Button size="icon" variant="ghost" onclick={() => lux.auth.signOut()}>
                    <LogOutIcon />
                </Button>
            </div>
        </Sidebar.Footer>
    </Sidebar.Root>
    <main class="w-full">
        <Sidebar.Trigger />
        {@render children()}
    </main>
</Sidebar.Provider>