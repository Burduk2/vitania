<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { isTouch } from '$lib/index';
	import { MSG_MAX_LEN, type UnvalidatedClientMessage, type WsPayload } from '$lib/types';

	let { data } = $props();

	let messages = $state<App.Message[]>(data.messages);

	let ws: WebSocket;
	onMount(() => {
		ws = new WebSocket('ws://localhost:8080');

		ws.onopen = () => {
			console.log('ws connected');
		};
		ws.onmessage = (e) => {
			const payload = JSON.parse(e.data.toString()) as WsPayload;
			messages.push({
				text: payload.text,
				isoCode: payload.isoCode,
				displayTime: new Intl.DateTimeFormat(undefined, {
					dateStyle: 'short',
					timeStyle: 'short'
				}).format(new Date(payload.timestamp))
			});
			chatEl.scrollTop = chatEl.scrollHeight + 100;
		};

		return () => ws.close();
	});

	let chatEl: any;
	onMount(() => {
		if ($isTouch) return;
		// window.addEventListener(
		// 	'wheel',
		// 	(e) => {
		// 		chatEl.scrollTop += e.deltaY;
		// 		e.preventDefault();
		// 	},
		// 	{ passive: false }
		// );
	});

	let msgText: string = $state('');
</script>

<div class="flex gap-4 h-screen items-center justify-center">
	<!-- sidebar -->
	<div class="h-full py-4 pl-4 w-80 max-w-full">
		<div class="border-dark3 border p-3 rounded-xl">
			<h1 class="text-xl! text-center">Vitania</h1>
			<form
				class="mt-4"
				onsubmit={() => {
					const msg: UnvalidatedClientMessage = {
						text: msgText
					};
					msgText = '';
					ws.send(JSON.stringify(msg));
				}}
			>
				<input
					type="text"
					bind:value={msgText}
					maxlength={MSG_MAX_LEN}
					required
					placeholder="Message anything"
					class="bg-dark2 border-dark3 border p-2 rounded-lg w-full outline-none"
				/>
				<button
					class="bg-light1 text-dark2! w-full cursor-pointer hover:brightness-90 active:brightness-85 font-medium p-2 rounded-lg mt-2"
					>Send</button
				>
			</form>
		</div>
	</div>

	<!-- chat -->
	<div class="h-full w-150 max-w-full">
		<div
			bind:this={chatEl}
			class="scroll-smooth px-4 flex h-full flex-col gap-5 py-4 overflow-y-scroll flex-1"
		>
			{#each messages as { text, isoCode, displayTime }}
				<div class="group relative" transition:fly={{ y: 1, x: 30, duration: 100 }}>
					<div class="flex gap-3">
						<p class="select-none">–</p>
						<p class="text-light1 wrap-anywhere">{text}</p>
					</div>
					<div
						class="opacity-0 {!$isTouch ? 'group-hover:opacity-100' : ''} duration-100
            absolute gap-3 mb-1 items-center -bottom-1 translate-y-full right-0"
					>
						<p class="whitespace-nowrap text-light3! text-xs!">
							{#if isoCode}
								<span class="text-green1! text-xs!">{isoCode}</span>
								·
							{/if}
							{displayTime}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
