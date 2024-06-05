<script lang="ts">
	import '../app.css'
	import {DarkMode, GradientButton, Heading, Span} from 'flowbite-svelte'
	import {Section, Cta, HeroHeader, FeatureDefault, FeatureItem, Faq, FaqItem} from 'flowbite-svelte-blocks'
	import {
		ChartPieSolid,
		BriefcaseSolid,
		DollarOutline,
		RocketSolid,
		CogOutline,
		ArrowRightOutline,
		ArrowsRepeatOutline,
		BookSolid
	} from 'flowbite-svelte-icons'
	import {base} from '$app/paths'
	import {db} from '$lib/db'
	import {_} from 'svelte-i18n'

	db.congregation
		.orderBy('id')
		.first()
		.then(cong => {
			if (cong) {
				window.location.pathname = base + '/app/'
			}
		})

	if (window.__TAURI__) {
		window.location.pathname = base + '/app/new/'
	}
</script>

<div class="grid grid-cols-1 gap-2">
	<DarkMode class="hidden" />
	<Heading class="my-10 text-center dark:text-white"><Span gradient>PPOC Gen</Span></Heading>
	<Section name="ctawithimg">
		<Cta ctatype="image">
			<svelte:fragment slot="img">
				<img
					class="w-full dark:hidden"
					src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
					alt="dashboard"
				/>
				<img
					class="hidden w-full dark:block"
					src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
					alt="dashboard"
				/>
			</svelte:fragment>
			<svelte:fragment slot="h2">{$_('landing.title')}</svelte:fragment>
			<p class="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">{$_('landing.title-desc')}</p>
			<a
				href="{base}/app/new"
				class="inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
			>
				{$_('landing.get-started')}
				<ArrowRightOutline size="md" class="-mr-1 ml-2" />
			</a>
		</Cta>
	</Section>

	<div class="flex flex-row justify-center">
		<hr class="w-3/6" />
	</div>

	<Section name="feature">
		<HeroHeader
			class="mb-8 max-w-screen-md lg:mb-16"
			h2Class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white"
			pClass="text-gray-500 sm:text-xl dark:text-gray-400"
		>
			<svelte:fragment slot="h2">{$_('landing.feature-title')}</svelte:fragment>
			<svelte:fragment slot="paragraph">{$_('landing.feature-desc')}</svelte:fragment>
		</HeroHeader>
		<FeatureDefault>
			<FeatureItem class="mt-5">
				<svelte:fragment slot="icon"><DollarOutline class="text-primary-600 dark:text-primary-300" /></svelte:fragment>
				<svelte:fragment slot="h3">{$_('landing.free')}</svelte:fragment>
				<svelte:fragment slot="paragraph">{$_('landing.free-desc')}</svelte:fragment>
			</FeatureItem>
			<FeatureItem class="mt-5">
				<svelte:fragment slot="icon"><RocketSolid class="text-primary-600 dark:text-primary-300" /></svelte:fragment>
				<svelte:fragment slot="h3">{$_('landing.performant')}</svelte:fragment>
				<svelte:fragment slot="paragraph">{$_('landing.performant-desc')}</svelte:fragment>
			</FeatureItem>
			<FeatureItem class="mt-5">
				<svelte:fragment slot="icon"><ChartPieSolid class="text-primary-600 dark:text-primary-300" /></svelte:fragment>
				<svelte:fragment slot="h3">{$_('landing.granular')}</svelte:fragment>
				<svelte:fragment slot="paragraph">{$_('landing.granular-desc')}</svelte:fragment>
			</FeatureItem>
			<FeatureItem class="mt-5">
				<svelte:fragment slot="icon"><CogOutline class="text-primary-600 dark:text-primary-300" /></svelte:fragment>
				<svelte:fragment slot="h3">{$_('landing.configurable')}</svelte:fragment>
				<svelte:fragment slot="paragraph">{$_('landing.configurable-desc')}</svelte:fragment>
			</FeatureItem>
			<FeatureItem class="mt-5">
				<svelte:fragment slot="icon"
					><ArrowsRepeatOutline class="text-primary-600 dark:text-primary-300" /></svelte:fragment
				>
				<svelte:fragment slot="h3">{$_('landing.automatic')}</svelte:fragment>
				<svelte:fragment slot="paragraph">{$_('landing.automatic-desc')}</svelte:fragment>
			</FeatureItem>
			<FeatureItem class="mt-5">
				<svelte:fragment slot="icon"><BriefcaseSolid class="text-primary-600 dark:text-primary-300" /></svelte:fragment>
				<svelte:fragment slot="h3">{$_('landing.export')}</svelte:fragment>
				<svelte:fragment slot="paragraph">{$_('landing.export-desc')}</svelte:fragment>
			</FeatureItem>
		</FeatureDefault>
	</Section>

	<div class="flex flex-row justify-center">
		<hr class="w-3/6" />
	</div>

	<Section name="faq">
		<h2 class="mb-8 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
			{$_('landing.faq')}
		</h2>
		<Faq>
			<div>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-free')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">{$_('landing.faq-free-answer')}</p>
				</FaqItem>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-difference')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">{$_('landing.faq-difference-answer')}</p>
				</FaqItem>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-data')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">{$_('landing.faq-data-answer')}</p>
				</FaqItem>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-more-cong')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">{$_('landing.faq-more-cong-answer')}</p>
				</FaqItem>
			</div>
			<div>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-sync')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">{$_('landing.faq-sync-answer')}</p>
				</FaqItem>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-error')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">
						{$_('landing.faq-error-answer')}<a
							href="https://github.com/MarckFp/ppoc-gen/issues"
							class="font-medium text-primary-600 underline hover:no-underline dark:text-primary-500">Github issues</a
						>{$_('landing.faq-error-answer-2')}
					</p>
				</FaqItem>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-support')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">
						{$_('landing.faq-support-answer')}<a
							href="https://donate.jw.org"
							class="font-medium text-primary-600 underline hover:no-underline dark:text-primary-500">Donate JW</a
						>
					</p>
				</FaqItem>
				<FaqItem class="mx-1">
					<svelte:fragment slot="h3">{$_('landing.faq-maintenance')}</svelte:fragment>
					<p class="text-gray-500 dark:text-gray-400">{$_('landing.faq-maintenance-answer')}</p>
				</FaqItem>
			</div>
		</Faq>
		<h3 class="my-5 font-bold tracking-tight text-gray-900 dark:text-white">
			{$_('landing.you-can-also')}
			<GradientButton color="teal" class="ml-2" href="https://github.com/MarckFp/ppoc-gen/blob/main/docs/README.md"
				>{$_('home.docs')} <BookSolid class="ms-1" /></GradientButton
			>
		</h3>
	</Section>
</div>
