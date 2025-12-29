<script lang="ts">
	import { Skeleton as SharedSkeleton } from '@one-love-wealth/shared-ui';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<SharedSkeleton class={className} />
