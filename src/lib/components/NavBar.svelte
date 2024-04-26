<script>
	import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode} from 'flowbite-svelte'
	import {base} from '$app/paths'
	import {
		UsersGroupOutline,
		CalendarMonthOutline,
		BellRingOutline,
		CogOutline,
		EditOutline
	} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'
</script>

<Navbar let:NavContainer class="dark:bg-gray-700 print:hidden">
	<NavContainer class="rounded-lg border bg-white px-5 py-2 dark:bg-gray-600">
		<NavBrand href="{base}/">
			<img src="favicon.ico" class="me-3 h-6 w-full rounded-lg sm:h-9" alt="PPOC Gen Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">PPOC Gen</span>
		</NavBrand>
		<div class="flex md:order-2">
			<DarkMode class="black ml-2 dark:border-gray-800 dark:text-primary-200" />
			<NavHamburger />
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
