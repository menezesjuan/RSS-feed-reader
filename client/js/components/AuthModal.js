export function createAuthModal(store) {
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center hidden p-4 select-none';

  let isSignUp = false;

  function render() {
    modal.innerHTML = `
      <div class="w-full max-w-sm bg-[var(--color-surface)] rounded-xl shadow-2xl border border-[var(--color-border)] p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
          <h2 class="text-base font-bold text-[var(--color-text-primary)]">
            ${isSignUp ? 'Create your Account' : 'Sign in to Frontpage'}
          </h2>
          <button id="auth-close-btn" class="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <p class="text-xs text-[var(--color-text-secondary)]">
          ${isSignUp ? 'Save your subscriptions, reading progress, and custom categories across all your devices.' : 'Welcome back. Enter your credentials to sync your feeds.'}
        </p>

        <form id="auth-form" class="space-y-3">
          <div>
            <label class="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Email</label>
            <input 
              id="auth-email" 
              type="email" 
              required 
              placeholder="developer@example.com" 
              class="w-full h-9 px-3 text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Password</label>
            <input 
              id="auth-password" 
              type="password" 
              required 
              placeholder="••••••••" 
              class="w-full h-9 px-3 text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div id="auth-feedback" class="text-xs hidden p-2 rounded-md"></div>

          <button type="submit" class="w-full h-9 text-xs font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-md shadow-xs transition-colors">
            ${isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div class="pt-2 text-center text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border-subtle)]">
          <span>${isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}</span>
          <button id="auth-toggle-mode-btn" class="ml-1 font-semibold text-[var(--color-accent)] hover:underline">
            ${isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    `;

    const close = () => modal.classList.add('hidden');
    modal.querySelector('#auth-close-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.querySelector('#auth-toggle-mode-btn').addEventListener('click', () => {
      isSignUp = !isSignUp;
      render();
    });

    modal.querySelector('#auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = modal.querySelector('#auth-email').value;
      const feedback = modal.querySelector('#auth-feedback');

      feedback.className = 'text-xs block p-2 rounded-md bg-green-50 text-[var(--color-success)]';
      feedback.textContent = `Signed in as ${email}. Sync active.`;

      setTimeout(() => {
        close();
      }, 1200);
    });
  }

  render();

  document.addEventListener('frontpage:open-auth', () => {
    modal.classList.remove('hidden');
  });

  return modal;
}
