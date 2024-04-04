<script>
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Dropdown, DropdownItem, Button } from 'flowbite-svelte';
</script>

<Navbar let:NavContainer>
	<NavContainer class="border px-5 py-2 rounded-lg bg-white dark:bg-gray-600">
		<NavBrand href="/">
			<img src="favicon.png" class="me-3 h-6 sm:h-9" alt="PPOC Gen Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">PPOC Gen</span
			>
		</NavBrand>
		<div class="flex md:order-2">
			<Button color="light">
				Language
			</Button>
			<Dropdown class="w-44 z-20">
				<DropdownItem href="/">
					English
				</DropdownItem>
				<DropdownItem href="/">
					Spanish
				</DropdownItem>
			</Dropdown>
			<NavHamburger />
		</div>
		<NavUl class="order-1">
			<NavLi href="/publishers">Publishers</NavLi>
			<NavLi href="/schedules">Schedules</NavLi>
			<NavLi href="/turns">Turns</NavLi>
			<NavLi href="/turns">Turns</NavLi>
			<NavLi href="/settings">Settings</NavLi>
		</NavUl>
	</NavContainer>
</Navbar>
