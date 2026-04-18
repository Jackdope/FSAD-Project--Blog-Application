// Home page JavaScript – Bloggersverse
function normalizeImageUrl(url) {
    if (!url) return url;
    const trimmed = String(url).trim();
    if (!trimmed) return trimmed;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

    // Use same-origin so it works on any host/port (not just localhost:8080)
    const origin = window.location.origin;

    if (trimmed.startsWith('/uploads/')) return `${origin}${trimmed}`;
    if (trimmed.startsWith('uploads/')) return `${origin}/${trimmed}`;
    if (!trimmed.includes('/') && !trimmed.includes('\\')) return `${origin}/uploads/${trimmed}`;

    // If it's some other absolute path, try to treat it as same-origin.
    if (trimmed.startsWith('/')) return `${origin}${trimmed}`;

    return trimmed;
}

document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("posts-container");
    const postModal = document.getElementById("postModal");
    const modalBody = document.getElementById("modal-body");
    const searchInput = document.getElementById("search-input");

    let allPosts = [];

    // Update navbar auth state
    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }

    loadPosts();

    async function loadPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts`);
            if (response.ok) {
                allPosts = await response.json();
                displayPosts(allPosts);
            } else {
                console.error("Failed to fetch posts:", response.status);
                postsContainer.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400"><i class="fas fa-exclamation-triangle text-4xl mb-4 block"></i>Failed to load stories. Please try again later.</div>`;
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            postsContainer.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400"><i class="fas fa-wifi text-4xl mb-4 block"></i>Network error. Check your connection.</div>`;
        }
    }

    function displayPosts(postsToDisplay) {
        postsContainer.innerHTML = "";

        if (postsToDisplay.length === 0) {
            postsContainer.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <i class="fas fa-feather-alt text-6xl text-gray-200 mb-6 block"></i>
                    <p class="text-xl text-gray-400 font-medium">No stories found yet...</p>
                    <p class="text-gray-300 mt-2">Be the first to share your thoughts!</p>
                </div>`;
            return;
        }

        postsToDisplay.forEach(post => {
            const postCard = document.createElement("div");
            postCard.className = "group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/80 overflow-hidden cursor-pointer flex flex-col h-full hover:-translate-y-1";

            const date = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Handle multiple images (comma-separated) - use first one as cover
            let coverImage = post.imageUrl;
            if (coverImage && coverImage.includes(',')) {
                coverImage = coverImage.split(',')[0].trim();
            }
            coverImage = normalizeImageUrl(coverImage);

            postCard.innerHTML = `
                <div class="h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 relative">
                    ${coverImage ?
                        `<img src="${coverImage}" alt="${escapeHtml(post.title)}" class="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-700" onerror="console.warn('Image failed to load:', this.src); this.remove(); this.parentElement.insertAdjacentHTML('beforeend','<div class=\\'w-full h-full bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center\\'><i class=\\'fas fa-image text-gray-200 text-5xl\\'></i></div>');">` :
                        `<div class="w-full h-full bg-gradient-to-br from-emerald-50 via-sky-50 to-violet-50 flex items-center justify-center"><i class="fas fa-feather text-gray-200 text-5xl"></i></div>`
                    }
                    ${post.category ? `<span class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">${escapeHtml(post.category)}</span>` : ''}
                    ${!post.isPublic ? '<span class="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><i class="fas fa-lock text-[10px]"></i>Private</span>' : ''}
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <p class="text-xs text-emerald-600 font-bold mb-2.5 uppercase tracking-wider">${date}</p>
                    <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors duration-300">${escapeHtml(post.title)}</h3>
                    <p class="bv-post-body text-gray-600 line-clamp-3 mb-5 flex-grow leading-relaxed text-base" style="font-family: 'Shadows Into Light', cursive !important;">${escapeHtml(post.content)}</p>
                    
                    ${post.tags ? `
                    <div class="flex flex-wrap gap-1.5 mb-4">
                        ${post.tags.split(',').slice(0, 3).map(tag => `
                            <span class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">#${escapeHtml(tag.trim())}</span>
                        `).join('')}
                    </div>` : ''}
                    
                    <div class="mt-auto flex items-center pt-4 border-t border-gray-50 justify-between">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold text-xs mr-3 shadow-sm">
                                ${(post.authorName || 'A')[0].toUpperCase()}
                            </div>
                            <span class="text-sm text-gray-600 font-medium">${escapeHtml(post.authorName || 'Anonymous')}</span>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors duration-300">
                            <i class="fas fa-arrow-right text-xs text-gray-300 group-hover:text-emerald-500 transition-colors"></i>
                        </div>
                    </div>
                </div>
            `;
            postCard.addEventListener("click", () => openPostModal(post.id));
            postsContainer.appendChild(postCard);
        });
    }

    async function openPostModal(postId) {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
            if (response.ok) {
                const post = await response.json();
                displayPostModal(post);
            }
        } catch (error) {
            console.error("Error fetching post details:", error);
        }
    }

    function displayPostModal(post) {
        const date = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Handle multiple images
        let coverImage = post.imageUrl;
        let allImages = [];
        if (coverImage) {
            allImages = coverImage.split(',').map(u => normalizeImageUrl(u.trim())).filter(u => u);
            coverImage = allImages[0];
        }

        let imagesHtml = '';
        if (allImages.length > 1) {
            imagesHtml = `<div class="grid grid-cols-2 gap-3 mb-6">${allImages.map(img => `<img src="${img}" alt="Post image" class="w-full h-40 object-contain bg-gray-50 rounded-xl">`).join('')}</div>`;
        } else if (coverImage) {
            imagesHtml = `<div class="-mx-8 -mt-8 mb-8 overflow-hidden bg-gray-50"><img src="${coverImage}" alt="${escapeHtml(post.title)}" class="w-full h-auto max-h-[50vh] object-contain"></div>`;
        }

        modalBody.innerHTML = `
            ${imagesHtml}
            
            <div class="flex items-center flex-wrap gap-2 text-sm mb-5">
                ${post.category ? `<span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold text-xs">${escapeHtml(post.category)}</span>` : ''}
                ${!post.isPublic ? `<span class="bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1"><i class="fas fa-lock text-[10px]"></i>Private</span>` : ''}
                <span class="text-gray-400 font-medium text-xs">${date}</span>
            </div>
            
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">${escapeHtml(post.title)}</h2>
            
            ${post.tags ? `
            <div class="flex flex-wrap gap-2 mb-6">
                ${post.tags.split(',').map(tag => `<span class="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full font-medium">#${escapeHtml(tag.trim())}</span>`).join('')}
            </div>` : ''}
            
            <div class="flex items-center mb-8 pb-6 border-b border-gray-100">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                    ${(post.authorName || 'A')[0].toUpperCase()}
                </div>
                <div>
                    <p class="text-gray-900 font-bold">${escapeHtml(post.authorName || 'Anonymous')}</p>
                    <p class="text-gray-400 text-sm">Bloggersverse Author</p>
                </div>
            </div>

            <div class="bv-post-body prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4 text-xl" style="font-family: 'Shadows Into Light', cursive !important;">
                ${post.content.split('\n').map(line => {
                    const t = line.trim();
                    return t ? `<p>${escapeHtml(t)}</p>` : '';
                }).join('')}
            </div>
        `;

        postModal.classList.remove("hidden");
        postModal.classList.add("flex");
        document.body.style.overflow = 'hidden';
    }

    // Search input (inline filtering)
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (!searchTerm) {
                displayPosts(allPosts);
                return;
            }
            const filteredPosts = allPosts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                (post.category && post.category.toLowerCase().includes(searchTerm)) ||
                (post.tags && post.tags.toLowerCase().includes(searchTerm))
            );
            displayPosts(filteredPosts);
        });
    }

    // Make closePostModal available globally
    window.closePostModal = function() {
        postModal.classList.add("hidden");
        postModal.classList.remove("flex");
        document.body.style.overflow = '';
    };

    // Close modal on backdrop click
    if (postModal) {
        postModal.addEventListener('click', (event) => {
            if (event.target === postModal) {
                closePostModal();
            }
        });
    }

    // Make search functions global for onclick handlers in HTML
    window.handleSearchSubmit = function() {
        const val = searchInput ? searchInput.value.toLowerCase() : '';
        if (!val) return;
        const filteredPosts = allPosts.filter(post =>
            post.title.toLowerCase().includes(val) ||
            post.content.toLowerCase().includes(val) ||
            (post.category && post.category.toLowerCase().includes(val)) ||
            (post.tags && post.tags.toLowerCase().includes(val))
        );
        displayPosts(filteredPosts);
    };

    window.resetSearch = function() {
        if (searchInput) searchInput.value = '';
        displayPosts(allPosts);
    };

    // Global searchByTag for category bubble onclick
    window.searchByTag = function(tag) {
        if (searchInput) searchInput.value = tag;
        const filteredPosts = allPosts.filter(post =>
            (post.tags && post.tags.toLowerCase().includes(tag.toLowerCase())) ||
            (post.category && post.category.toLowerCase() === tag.toLowerCase())
        );
        displayPosts(filteredPosts);
        // Scroll to posts 
        document.getElementById('posts-container').scrollIntoView({behavior: "smooth"});
    };
});

// Global logout function
function logout() {
    auth.logout();
    window.location.href = '/login.html';
}
