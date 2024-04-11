<script>
	import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode} from 'flowbite-svelte'
	import {base} from '$app/paths'
	import {
		UserSolid,
		CalendarMonthSolid,
		BellRingSolid,
		AdjustmentsVerticalSolid,
		EditSolid
	} from 'flowbite-svelte-icons'
	import {_} from 'svelte-i18n'
</script>

<Navbar let:NavContainer>
	<NavContainer class="rounded-lg border bg-white px-5 py-2 dark:bg-gray-600">
		<NavBrand href="{base}/">
			<img src="favicon.ico" class="me-3 h-6 w-full rounded-lg sm:h-9" alt="PPOC Gen Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">PPOC Gen</span>
		</NavBrand>
		<div class="flex md:order-2">
			<DarkMode class="ml-2 border text-primary-500 dark:border-gray-800 dark:text-primary-600" />
			<NavHamburger />
		</div>
		<NavUl class="order-1">
			<NavLi href="{base}/publishers">
				<div class="flex flex-row">
					{$_('navbar.publishers')}
					<UserSolid color="red" />
				</div>
			</NavLi>
			<NavLi href="{base}/schedules"
				><div class="flex flex-row">
					{$_('navbar.schedules')}
					<CalendarMonthSolid color="red" />
				</div></NavLi
			>
			<NavLi href="{base}/turns"><div class="flex flex-row">{$_('navbar.turns')} <EditSolid color="red" /></div></NavLi>
			<NavLi href="{base}/incidences"
				><div class="flex flex-row">
					{$_('navbar.incidences')}
					<BellRingSolid color="red" />
				</div></NavLi
			>
			<NavLi href="{base}/settings"
				><div class="flex flex-row">
					{$_('navbar.settings')}
					<AdjustmentsVerticalSolid color="red" />
				</div></NavLi
			>
		</NavUl>
	</NavContainer>
</Navbar>
