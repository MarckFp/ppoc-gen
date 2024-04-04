<script>
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Dropdown, DropdownItem, Button } from 'flowbite-svelte';
</script>

<Navbar>
	<NavBrand href="/">
		<img src="/favicon.ico" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite</span
		>
	</NavBrand>
	<div class="flex md:order-2">
		<Button>
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
</Navbar>
