<script lang="ts">
	import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode, BottomNav, BottomNavItem} from 'flowbite-svelte'
	import {base} from '$app/paths'
	import {
		UsersGroupOutline,
		CalendarMonthOutline,
		BellRingOutline,
		CogOutline,
		EditOutline
	} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'
	import {page} from '$app/stores'
	import {mobile} from '$lib/stores'

	$: activeUrl = $page.url.pathname
</script>

{#if $mobile}
	<BottomNav {activeUrl} position="fixed" classInner="grid-cols-6">
		<BottomNavItem href="{base}/app" activeClass="w-full px-3">
			<img src="{base}/favicon.ico" class="h-6 min-h-6 w-6 min-w-6 shrink-0" alt="PPOC Gen Logo" />
		</BottomNavItem>
		<BottomNavItem href="{base}/app/publishers" data-testid="navbar-publishers" data-sveltekit-preload-data="hover">
			<UsersGroupOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/app/schedules" data-testid="navbar-schedules" data-sveltekit-preload-data="hover">
			<CalendarMonthOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/app/turns" data-testid="navbar-turns" data-sveltekit-preload-data="hover">
			<EditOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/app/incidences" data-testid="navbar-incidences" data-sveltekit-preload-data="hover">
			<BellRingOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/app/settings" data-testid="navbar-settings" data-sveltekit-preload-data="hover">
			<CogOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
	</BottomNav>
	<DarkMode class="hidden" />
{:else}
	<Navbar let:NavContainer class="dark:bg-gray-700 print:hidden">
		<NavContainer class="rounded-lg border bg-white px-5 py-2 dark:bg-gray-600">
			<NavBrand href="{base}/app">
				<img
					src="{base}/favicon.ico"
					class="me-3 h-6 min-h-6 w-6 min-w-6 shrink-0 rounded-lg sm:h-9 sm:w-9"
					alt="PPOC Gen Logo"
				/>
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">PPOC Gen</span>
			</NavBrand>
			<div class="flex md:order-2">
				<DarkMode class="black ml-2 dark:border-gray-800 dark:text-primary-200" />
				<NavHamburger data-testid="navbar-hamburger" />
			</div>
			<NavUl class="order-1">
				<NavLi href="{base}/app/publishers" data-testid="navbar-publishers" data-sveltekit-preload-data="hover">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.publishers')}
						<UsersGroupOutline size="lg" color="red" class="dark:text-primary-400" />
					</div>
				</NavLi>
				<NavLi href="{base}/app/schedules" data-testid="navbar-schedules" data-sveltekit-preload-data="hover">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.schedules')}
						<CalendarMonthOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
				<NavLi href="{base}/app/turns" data-testid="navbar-turns" data-sveltekit-preload-data="hover">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.turns')}
						<EditOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
				<NavLi href="{base}/app/incidences" data-testid="navbar-incidences" data-sveltekit-preload-data="hover">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.incidences')}
						<BellRingOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
				<NavLi href="{base}/app/settings" data-testid="navbar-settings" data-sveltekit-preload-data="hover">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.settings')}
						<CogOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
			</NavUl>
		</NavContainer>
	</Navbar>
{/if}
