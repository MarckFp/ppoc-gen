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

	$: activeUrl = $page.url.pathname
	let mobile: boolean = false
	export let loading: boolean = false

	//Media Queries for Calendar View
	const mediaQuery = window.matchMedia('(width <= 640px)')
	mediaQuery.addEventListener('change', ({matches}) => {
		if (matches) {
			mobile = true
		} else {
			mobile = false
		}
	})
	if (mediaQuery.matches) {
		mobile = true
	} else {
		mobile = false
	}
</script>

{#if mobile}
	<BottomNav
		{activeUrl}
		position="fixed"
		classInner="grid-cols-6"
		outerClass="fixed w-full {loading
			? 'z-0'
			: 'z-50'} border-gray-200 dark:bg-gray-700 dark:border-gray-600 bottom-0 start-0 h-16 bg-white border-t"
	>
		<BottomNavItem href="{base}/" activeClass="w-full px-3">
			<img src="favicon.svg" class="h-6 w-6 shrink-0" alt="PPOC Gen Logo" />
		</BottomNavItem>
		<BottomNavItem href="{base}/publishers" data-testid="navbar-publishers">
			<UsersGroupOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/schedules" data-testid="navbar-schedules">
			<CalendarMonthOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/turns" data-testid="navbar-turns">
			<EditOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/incidences" data-testid="navbar-incidences">
			<BellRingOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
		<BottomNavItem href="{base}/settings" data-testid="navbar-settings">
			<CogOutline size="lg" color="red" class="dark:text-primary-400" />
		</BottomNavItem>
	</BottomNav>
	<DarkMode class="hidden" />
{:else}
	<Navbar let:NavContainer class="dark:bg-gray-700 print:hidden">
		<NavContainer class="rounded-lg border bg-white px-5 py-2 dark:bg-gray-600">
			<NavBrand href="{base}/">
				<img src="favicon.svg" class="me-3 h-6 rounded-lg sm:h-9" alt="PPOC Gen Logo" />
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">PPOC Gen</span>
			</NavBrand>
			<div class="flex md:order-2">
				<DarkMode class="black ml-2 dark:border-gray-800 dark:text-primary-200" />
				<NavHamburger data-testid="navbar-hamburger" />
			</div>
			<NavUl class="order-1">
				<NavLi href="{base}/publishers" data-testid="navbar-publishers">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.publishers')}
						<UsersGroupOutline size="lg" color="red" class="dark:text-primary-400" />
					</div>
				</NavLi>
				<NavLi href="{base}/schedules" data-testid="navbar-schedules">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.schedules')}
						<CalendarMonthOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
				<NavLi href="{base}/turns" data-testid="navbar-turns">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.turns')}
						<EditOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
				<NavLi href="{base}/incidences" data-testid="navbar-incidences">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.incidences')}
						<BellRingOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
				<NavLi href="{base}/settings" data-testid="navbar-settings">
					<div class="flex flex-row dark:text-white">
						{$_('navbar.settings')}
						<CogOutline size="lg" color="red" class="dark:text-primary-400" />
					</div></NavLi
				>
			</NavUl>
		</NavContainer>
	</Navbar>
{/if}
