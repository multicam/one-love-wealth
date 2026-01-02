<script lang="ts">
	// Resizable panel state
	let leftWidth = $state(250);
	let rightWidth = $state(350);
	let isDraggingLeft = $state(false);
	let isDraggingRight = $state(false);

	const MIN_WIDTH = 150;
	const MAX_LEFT = 400;
	const MAX_RIGHT = 500;

	function handleLeftMouseDown(e: MouseEvent) {
		isDraggingLeft = true;
		e.preventDefault();
	}

	function handleRightMouseDown(e: MouseEvent) {
		isDraggingRight = true;
		e.preventDefault();
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDraggingLeft) {
			const newWidth = e.clientX;
			leftWidth = Math.max(MIN_WIDTH, Math.min(MAX_LEFT, newWidth));
		}
		if (isDraggingRight) {
			const newWidth = window.innerWidth - e.clientX;
			rightWidth = Math.max(MIN_WIDTH, Math.min(MAX_RIGHT, newWidth));
		}
	}

	function handleMouseUp() {
		isDraggingLeft = false;
		isDraggingRight = false;
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="h-screen flex bg-gray-900 text-gray-100 overflow-hidden">
	<!-- Left Column -->
	<div 
		class="flex-shrink-0 bg-gray-800 border-r border-gray-700 overflow-y-auto"
		style="width: {leftWidth}px"
	>
		<div class="p-4">
			<h2 class="text-lg font-semibold mb-4 text-white">Left Panel</h2>
			
			<!-- Skeleton content -->
			<div class="space-y-3">
				<div class="h-8 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-8 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-8 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-20 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-8 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-8 bg-gray-700 rounded animate-pulse"></div>
			</div>
		</div>
	</div>

	<!-- Left Resize Handle -->
	<div
		class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
		class:bg-blue-500={isDraggingLeft}
		class:bg-gray-700={!isDraggingLeft}
		onmousedown={handleLeftMouseDown}
		role="separator"
		aria-orientation="vertical"
		tabindex="0"
	></div>

	<!-- Center Column -->
	<div class="flex-1 overflow-y-auto bg-gray-900">
		<div class="p-6">
			<h2 class="text-lg font-semibold mb-4 text-white">Center Panel</h2>
			
			<!-- Skeleton content -->
			<div class="space-y-4">
				<div class="h-12 bg-gray-800 rounded animate-pulse"></div>
				<div class="h-64 bg-gray-800 rounded animate-pulse"></div>
				<div class="grid grid-cols-3 gap-4">
					<div class="h-24 bg-gray-800 rounded animate-pulse"></div>
					<div class="h-24 bg-gray-800 rounded animate-pulse"></div>
					<div class="h-24 bg-gray-800 rounded animate-pulse"></div>
				</div>
				<div class="h-48 bg-gray-800 rounded animate-pulse"></div>
			</div>
		</div>
	</div>

	<!-- Right Resize Handle -->
	<div
		class="w-1 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0"
		class:bg-blue-500={isDraggingRight}
		class:bg-gray-700={!isDraggingRight}
		onmousedown={handleRightMouseDown}
		role="separator"
		aria-orientation="vertical"
		tabindex="0"
	></div>

	<!-- Right Column -->
	<div 
		class="flex-shrink-0 bg-gray-800 border-l border-gray-700 overflow-y-auto"
		style="width: {rightWidth}px"
	>
		<div class="p-4">
			<h2 class="text-lg font-semibold mb-4 text-white">Right Panel</h2>
			
			<!-- Skeleton content -->
			<div class="space-y-3">
				<div class="h-10 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-32 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-10 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-10 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-24 bg-gray-700 rounded animate-pulse"></div>
				<div class="h-12 bg-gray-700 rounded animate-pulse"></div>
			</div>
		</div>
	</div>
</div>
