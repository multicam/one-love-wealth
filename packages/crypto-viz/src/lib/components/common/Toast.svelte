<script>
    import { X } from 'lucide-svelte';
    
    export let message = '';
    export let type = 'info'; // 'info' | 'success' | 'error' | 'warning'
    export let onClose = () => {};

    const colors = {
        info: 'bg-accent',
        success: 'bg-success',
        error: 'bg-danger',
        warning: 'bg-warning'
    };
</script>

<div class="fixed bottom-4 right-4 z-50 animate-slide-up">
    <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg {colors[type]} text-white">
        <span class="text-sm">{message}</span>
        <button 
            class="p-1 hover:bg-white/20 rounded transition-colors"
            on:click={onClose}
        >
            <X size={16} />
        </button>
    </div>
</div>

<style>
    @keyframes slide-up {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
</style>
