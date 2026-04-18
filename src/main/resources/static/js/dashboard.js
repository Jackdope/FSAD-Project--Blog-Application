document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    if (!auth.isAuthenticated()) {
        window.location.href = "/login.html";
        return;
    }

    const createPostForm = document.getElementById("createPostForm");
    const editPostForm = document.getElementById("editPostForm");
    const userPostsContainer = document.getElementById("userPosts");
    const postMessage = document.getElementById("postMessage");
    const uploadImageBtn = document.getElementById("uploadImageBtn");

    const editModal = document.getElementById("editModal");
    const closeEditModalBtn = document.getElementById("closeEditModalBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    loadUserPosts();

    function normalizeImageUrl(url) {
        if (!url) return url;
        const trimmed = String(url).trim();
        if (!trimmed) return trimmed;
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
        const origin = window.location.origin;
        if (trimmed.startsWith("/uploads/")) return `${origin}${trimmed}`;
        if (trimmed.startsWith("uploads/")) return `${origin}/${trimmed}`;
        // If backend stores only the filename, assume it's under /uploads
        if (!trimmed.includes("/") && !trimmed.includes("\\")) return `${origin}/uploads/${trimmed}`;
        if (trimmed.startsWith("/")) return `${origin}${trimmed}`;
        return trimmed;
    }

    // Handle Image Upload (Single)
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener("click", async () => {
            const fileInput = document.getElementById("imageFile");
            const file = fileInput.files[0];

            if (!file) {
                showMessage(postMessage, "Please select an image file.", "red");
                return;
            }

            uploadImageBtn.disabled = true;
            uploadImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Uploading...';

            try {
                const token = localStorage.getItem("authToken");
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch(`${API_BASE_URL}/posts/upload`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    const imagePath = await response.text();
                    const trimmedPath = imagePath.trim();
                    // Store the raw backend path (typically /uploads/...) so it's portable across hosts/ports
                    document.getElementById("imageUrl").value = trimmedPath;
                    fileInput.value = "";

                    // Show preview
                    const preview = document.getElementById("imagePreview");
                    const previewImg = document.getElementById("imagePreviewImg");
                    if (preview && previewImg) {
                        previewImg.src = normalizeImageUrl(trimmedPath);
                        preview.classList.remove("hidden");
                    }

                    showMessage(postMessage, "Image uploaded successfully!", "green");
                } else {
                    showMessage(postMessage, "Failed to upload image.", "red");
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                showMessage(postMessage, "Upload error. Please try again.", "red");
            }

            uploadImageBtn.disabled = false;
            uploadImageBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Upload';
        });
    }

    // Create New Post
    createPostForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const content = document.getElementById("content").value.trim();
        let imageUrl = document.getElementById("imageUrl").value.trim();
        const categoryEl = document.getElementById("category");
        const category = categoryEl ? categoryEl.value : "";
        const tagsEl = document.getElementById("tags");
        const tags = tagsEl ? tagsEl.value.trim() : "";

        if (!title || !content) {
            showMessage(postMessage, "Title and content are required.", "red");
            return;
        }
        if (title.length < 5 || title.length > 200) {
            showMessage(postMessage, "Title must be between 5 and 200 characters.", "red");
            return;
        }
        if (content.length < 10) {
            showMessage(postMessage, "Content must be at least 10 characters.", "red");
            return;
        }

        try {
            // Fallback: if user selected a file but didn't click Upload first,
            // upload it automatically so the post still gets its cover image.
            if (!imageUrl) {
                const fileInput = document.getElementById("imageFile");
                const selectedFile = fileInput && fileInput.files ? fileInput.files[0] : null;
                if (selectedFile) {
                    const token = localStorage.getItem("authToken");
                    const formData = new FormData();
                    formData.append("file", selectedFile);

                    const uploadResponse = await fetch(`${API_BASE_URL}/posts/upload`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}` },
                        body: formData
                    });

                    if (uploadResponse.ok) {
                        imageUrl = (await uploadResponse.text()).trim();
                        document.getElementById("imageUrl").value = imageUrl;
                    } else {
                        showMessage(postMessage, "Image upload failed. Please try Upload again.", "red");
                        return;
                    }
                }
            }

            const privacyValue = document.querySelector('input[name="privacy"]:checked')?.value || "public";
            const isPublic = privacyValue === "public";
            const postData = { title, content, isPublic };
            if (imageUrl) postData.imageUrl = imageUrl;
            if (category) postData.category = category;
            if (tags) postData.tags = tags;

            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                showMessage(postMessage, "Post created successfully!", "green");
                createPostForm.reset();
                // Explicitly clear image data
                document.getElementById("imageUrl").value = "";
                const fileInput = document.getElementById("imageFile");
                if (fileInput) fileInput.value = "";
                // Clear image preview
                const preview = document.getElementById("imagePreview");
                if (preview) preview.classList.add("hidden");
                loadUserPosts();
            } else {
                const data = await response.json().catch(() => ({}));
                // Surface backend validation details if present
                if (data && data.errors) {
                    const details = Object.values(data.errors).filter(Boolean).join(" ");
                    showMessage(postMessage, details || data.message || "Failed to create post.", "red");
                } else {
                    showMessage(postMessage, (data && data.message) || "Failed to create post.", "red");
                }
            }
        } catch (error) {
            console.error("Error creating post:", error);
            showMessage(postMessage, "An error occurred. Please try again.", "red");
        }
    });

    // Load User's Posts
    async function loadUserPosts() {
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/posts/user`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const posts = await response.json();
                displayUserPosts(posts);
            } else {
                console.error("Failed to load posts", response.status);
                userPostsContainer.innerHTML = `<div class="col-span-full py-16 text-center text-red-400 bg-red-50/50 rounded-2xl border border-red-100"><i class="fas fa-exclamation-circle text-3xl mb-3 block"></i>Error loading posts (${response.status}). Please try refreshing.</div>`;
            }
        } catch (error) {
            console.error("Error fetching user posts:", error);
            userPostsContainer.innerHTML = `<div class="col-span-full py-16 text-center text-red-400 bg-red-50/50 rounded-2xl border border-red-100"><i class="fas fa-wifi text-3xl mb-3 block"></i>Network error. Please try again later.</div>`;
        }
    }

    function displayUserPosts(posts) {
        userPostsContainer.innerHTML = "";

        if (posts.length === 0) {
            userPostsContainer.innerHTML = `
                <div class="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div class="text-gray-200 mb-4"><i class="fas fa-feather-alt text-6xl"></i></div>
                    <p class="text-xl text-gray-500 font-semibold">You haven't created any posts yet.</p>
                    <p class="text-gray-400 mt-2 text-sm">Use the form above to share your first story!</p>
                </div>`;
            return;
        }

        posts.forEach(post => {
            const postCard = document.createElement("div");
            postCard.className = "bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group";
            postCard.dataset.id = post.id;
            const date = new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

            // Handle multiple images - use first as cover
            let coverImage = post.imageUrl;
            if (coverImage && coverImage.includes(',')) {
                coverImage = coverImage.split(',')[0].trim();
            }
            coverImage = normalizeImageUrl(coverImage);

            let imageHtml = '';
            if (coverImage) {
                imageHtml = `
                    <div class="h-48 overflow-hidden bg-gray-100 relative">
                        <img src="${coverImage}" alt="${escapeHtml(post.title)}" class="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500" onerror="console.warn('Image failed to load:', this.src); this.closest('div').classList.add('bg-gradient-to-r','from-gray-50','to-gray-100'); this.remove();">
                        ${post.category ? `<span class="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">${escapeHtml(post.category)}</span>` : ''}
                    </div>`;
            } else {
                imageHtml = `
                    <div class="h-16 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 relative">
                        ${post.category ? `<span class="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">${escapeHtml(post.category)}</span>` : ''}
                    </div>`;
            }

            postCard.innerHTML = `
                ${imageHtml}
                <div class="p-5 flex-grow flex flex-col">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-emerald-600 transition-colors flex-1">${escapeHtml(post.title)}</h3>
                        ${!post.isPublic ? '<span class="ml-2 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center whitespace-nowrap"><i class="fas fa-lock mr-1 text-[10px]"></i>Private</span>' : '<span class="ml-2 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center whitespace-nowrap"><i class="fas fa-globe mr-1 text-[10px]"></i>Public</span>'}
                    </div>
                    <p class="text-xs text-gray-400 mb-3 flex items-center"><i class="far fa-calendar-alt mr-1.5"></i>${date}</p>
                    <p class="bv-post-body text-gray-600 line-clamp-3 mb-4 flex-grow text-base leading-relaxed" style="font-family: 'Shadows Into Light', cursive !important;">${escapeHtml(post.content)}</p>
                    <div class="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                        <button class="edit-btn text-sky-500 hover:text-sky-700 hover:bg-sky-50 px-3 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center" data-id="${post.id}">
                            <i class="fas fa-edit mr-1.5"></i> Edit
                        </button>
                        <button class="delete-btn text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center" data-id="${post.id}">
                            <i class="fas fa-trash-alt mr-1.5"></i> Delete
                        </button>
                    </div>
                </div>`;
            userPostsContainer.appendChild(postCard);
        });
    }

    // Use event delegation for edit/delete buttons (single registration, no duplicates)
    document.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-btn");
        if (editBtn) {
            openEditModal(editBtn.dataset.id);
        }
        const deleteBtn = e.target.closest(".delete-btn");
        if (deleteBtn) {
            deletePost(deleteBtn.dataset.id);
        }
    });

    async function openEditModal(postId) {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
            if (response.ok) {
                const post = await response.json();
                document.getElementById("editPostId").value = post.id;
                document.getElementById("editTitle").value = post.title;
                document.getElementById("editContent").value = post.content;
                // Only preserve imageUrl if it's an uploaded file (/uploads/), discard webpage URLs
                const validImageUrl = (post.imageUrl && post.imageUrl.startsWith('/uploads/')) ? post.imageUrl : '';
                document.getElementById("editImageUrl").value = validImageUrl;

                const catEl = document.getElementById("editCategory");
                if (catEl && post.category) {
                    catEl.value = post.category;
                }

                // Set privacy radio
                const privacyValue = post.isPublic ? "public" : "private";
                const radioEl = document.querySelector(`input[name="editPrivacy"][value="${privacyValue}"]`);
                if (radioEl) radioEl.checked = true;

                editModal.classList.remove("hidden");
                editModal.classList.add("flex");
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error("Error opening edit modal:", error);
            alert("Failed to fetch post details for editing.");
        }
    }

    function closeEditModal() {
        editModal.classList.add("hidden");
        editModal.classList.remove("flex");
        document.body.style.overflow = '';
    }

    if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

    // Close modal on outside click
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }

    // Handle Edit Form Submission
    editPostForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const postId = document.getElementById("editPostId").value;
        const title = document.getElementById("editTitle").value.trim();
        const content = document.getElementById("editContent").value.trim();
        const imageUrl = document.getElementById("editImageUrl").value.trim();

        const catEl = document.getElementById("editCategory");
        const category = catEl ? catEl.value : "";
        const privacyValue = document.querySelector('input[name="editPrivacy"]:checked')?.value || "public";
        const isPublic = privacyValue === "public";

        if (!title || !content) {
            alert("Title and content are required.");
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            const updateData = { title, content, isPublic };
            if (imageUrl) updateData.imageUrl = imageUrl;
            if (category) updateData.category = category;

            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                closeEditModal();
                loadUserPosts();
            } else {
                const data = await response.json();
                alert(data.message || "Failed to update post.");
            }
        } catch (error) {
            console.error("Error updating post:", error);
            alert("An error occurred. Please try again.");
        }
    });

    // Delete Post
    async function deletePost(postId) {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadUserPosts();
            } else {
                alert("Failed to delete post.");
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("An error occurred while deleting the post.");
        }
    }

    function showMessage(element, message, color) {
        element.textContent = message;
        element.className = `mt-4 p-3.5 rounded-xl text-sm font-medium ${color === 'red' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`;
        setTimeout(() => {
            element.textContent = "";
            element.className = "mt-4 text-sm font-medium empty:hidden";
        }, 5000);
    }
});

// Global logout function
function logout() {
    auth.logout();
    window.location.href = '/login.html';
}
