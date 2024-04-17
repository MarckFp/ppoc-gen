<script lang="ts">
	import {_} from 'svelte-i18n'

	//TODO: Create a Dynamic Calendar using current month
	//TODO: For a future it would be nice to display the weather using a free API so it could be take in advance for creating turns
	let date = new Date(),
		year = date.getFullYear(),
		month = date.toLocaleString('en', {month: 'long'}).toLowerCase(),
		firstDay = new Date(date.getFullYear(), date.getMonth(), 2),
		firstDayWeekDay = firstDay.getDay() - 1,
		lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1),
		lastDayWeekDay = lastDay.getDay() - 1
</script>

<div class="container mx-auto mb-10 mt-10">
	<div class="wrapper w-full rounded bg-white shadow">
		<div class="header flex justify-between border-b p-2">
			<span class="text-lg font-bold"> {$_('general.' + month)} {year} </span>
			<div class="buttons">
				<button class="p-1" aria-label="Previous Month">
					<svg
						width="1em"
						fill="gray"
						height="1em"
						viewBox="0 0 16 16"
						class="bi bi-arrow-left-circle"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
						<path
							fill-rule="evenodd"
							d="M8.354 11.354a.5.5 0 0 0 0-.708L5.707 8l2.647-2.646a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708 0z"
						/>
						<path fill-rule="evenodd" d="M11.5 8a.5.5 0 0 0-.5-.5H6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 .5-.5z" />
					</svg>
				</button>
				<button class="p-1" aria-label="Next Month">
					<svg
						width="1em"
						fill="gray"
						height="1em"
						viewBox="0 0 16 16"
						class="bi bi-arrow-right-circle"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
						<path
							fill-rule="evenodd"
							d="M7.646 11.354a.5.5 0 0 1 0-.708L10.293 8 7.646 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0z"
						/>
						<path fill-rule="evenodd" d="M4.5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z" />
					</svg>
				</button>
			</div>
		</div>
		<table class="w-full">
			<thead>
				<tr>
					<th class="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
						<span class="hidden sm:block md:block lg:block xl:block">{$_('general.monday')}</span>
						<span class="block sm:hidden md:hidden lg:hidden xl:hidden">Mon</span>
					</th>
					<th class="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
						<span class="hidden sm:block md:block lg:block xl:block">{$_('general.tuesday')}</span>
						<span class="block sm:hidden md:hidden lg:hidden xl:hidden">Tue</span>
					</th>
					<th class="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
						<span class="hidden sm:block md:block lg:block xl:block">{$_('general.wednesday')}</span>
						<span class="block sm:hidden md:hidden lg:hidden xl:hidden">Wed</span>
					</th>
					<th class="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
						<span class="hidden sm:block md:block lg:block xl:block">{$_('general.thursday')}</span>
						<span class="block sm:hidden md:hidden lg:hidden xl:hidden">Thu</span>
					</th>
					<th class="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
						<span class="hidden sm:block md:block lg:block xl:block">{$_('general.friday')}</span>
						<span class="block sm:hidden md:hidden lg:hidden xl:hidden">Fri</span>
					</th>
					<th class="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
						<span class="hidden sm:block md:block lg:block xl:block">{$_('general.saturday')}</span>
						<span class="block sm:hidden md:hidden lg:hidden xl:hidden">Sat</span>
					</th>
					<th class="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
						<span class="hidden sm:block md:block lg:block xl:block">{$_('general.sunday')}</span>
						<span class="block sm:hidden md:hidden lg:hidden xl:hidden">Sun</span>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr class="h-20 text-center">
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">1</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1">
								<div class="event mb-1 rounded bg-purple-600 p-1 text-sm text-white">
									<span class="event-name"> Meeting </span>
									<span class="time"> 12:00~14:00 </span>
								</div>
								<div class="event mb-1 rounded bg-purple-600 p-1 text-sm text-white">
									<span class="event-name"> Meeting </span>
									<span class="time"> 18:00~20:00 </span>
								</div>
							</div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">2</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">3</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">4</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">6</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-hidden border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">7</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1">
								<div class="event mb-1 rounded bg-purple-600 p-1 text-sm text-white">
									<span class="event-name"> Shopping </span>
									<span class="time"> 12:00~14:00 </span>
								</div>
							</div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-sm text-gray-500">8</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
				</tr>

				<!--         line 1 -->
				<tr class="h-20 text-center">
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">9</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">10</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">12</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">13</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">14</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">15</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-sm text-gray-500">16</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
				</tr>
				<!--         line 1 -->

				<!--         line 2 -->
				<tr class="h-20 text-center">
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">16</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">17</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">18</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">19</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">20</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">21</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-sm text-gray-500">22</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
				</tr>
				<!--         line 2 -->

				<!--         line 3 -->
				<tr class="h-20 text-center">
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">23</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">24</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">25</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">26</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">27</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">28</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-sm text-gray-500">29</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
				</tr>
				<!--         line 3 -->

				<!--         line 4 -->
				<tr class="h-20 text-center">
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">30</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">31</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">1</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">2</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">3</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-gray-500">4</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
					<td
						class="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40"
					>
						<div class="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
							<div class="top h-5 w-full">
								<span class="text-sm text-gray-500">5</span>
							</div>
							<div class="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
						</div>
					</td>
				</tr>
				<!--         line 4 -->
			</tbody>
		</table>
	</div>
</div>
